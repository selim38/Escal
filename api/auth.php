<?php
/**
 * /api/auth.php?action=signup|login|me
 *   signup : { name, email, phone, password } → { token, user }
 *   login  : { email, password }              → { token, user }
 *   me     : (Bearer token)                   → { user }
 *
 * Mots de passe hashés avec password_hash (bcrypt). Tokens signés HMAC.
 */

require __DIR__ . '/bootstrap.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'signup':        signup();        break;
    case 'login':         login();         break;
    case 'me':            me();            break;
    case 'invite':        invite();        break;   // protégé : créer une invitation
    case 'request-reset': request_reset(); break;   // public : envoie un code WhatsApp
    case 'reset':         reset_password(); break;   // public : valide le code + nouveau mdp
    default:              json_error('Action inconnue', 404);
}

// ───────────────────────────────────────────────────────────────────────────
function public_user(array $u): array
{
    return [
        'id'    => (int) $u['id'],
        'name'  => $u['name'],
        'email' => $u['email'],
        'phone' => $u['phone'],
    ];
}

/** Règles mot de passe robuste : ≥8 car., 1 minuscule, 1 majuscule, 1 chiffre. */
function password_problem(string $pwd): ?string
{
    if (strlen($pwd) < 8)            return 'Le mot de passe doit faire au moins 8 caractères.';
    if (!preg_match('/[a-z]/', $pwd)) return 'Le mot de passe doit contenir une minuscule.';
    if (!preg_match('/[A-Z]/', $pwd)) return 'Le mot de passe doit contenir une majuscule.';
    if (!preg_match('/\d/',   $pwd))  return 'Le mot de passe doit contenir un chiffre.';
    return null;
}

// ───────────────────────────────────────────────────────────────────────────
function signup(): never
{
    if (method() !== 'POST') json_error('Méthode non autorisée', 405);
    $b = read_json_body();

    $name  = trim((string) ($b['name'] ?? ''));
    $email = strtolower(trim((string) ($b['email'] ?? '')));
    $phone = trim((string) ($b['phone'] ?? ''));
    $pwd   = (string) ($b['password'] ?? '');

    $code = trim((string) ($b['code'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Adresse e-mail invalide.', 400);
    if ($phone === '')                              json_error('Le numéro de téléphone est requis.', 400);
    if ($name === '')                               json_error('Le nom est requis.', 400);
    if ($err = password_problem($pwd))              json_error($err, 400);

    $pdo = db();

    // Bootstrap : si aucun utilisateur n'existe, le 1er compte se crée sans invitation.
    $userCount = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

    if ($userCount > 0) {
        // Inscription sur invitation uniquement
        if ($code === '') json_error('Une invitation est requise pour créer un compte.', 403);
        $inv = $pdo->prepare(
            'SELECT id, email FROM invitations WHERE code = ? AND used = 0 AND expires_at > NOW()'
        );
        $inv->execute([$code]);
        $row = $inv->fetch();
        if (!$row) {
            json_error('Invitation invalide ou expirée.', 403);
        }
        if (strtolower((string) $row['email']) !== $email) {
            json_error("Cette invitation est destinée à une autre adresse e-mail.", 403);
        }
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() !== false) {
        json_error('Un compte existe déjà avec cet e-mail.', 409);
    }

    $hash = password_hash($pwd, PASSWORD_DEFAULT);
    $pdo->prepare('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)')
        ->execute([$name, $email, $phone, $hash]);
    $id = (int) $pdo->lastInsertId();

    // Consomme l'invitation
    if ($code !== '') {
        $pdo->prepare('UPDATE invitations SET used = 1 WHERE code = ?')->execute([$code]);
    }

    $user = ['id' => $id, 'name' => $name, 'email' => $email, 'phone' => $phone];
    json_out(['token' => auth_make_token($id), 'user' => public_user($user)]);
}

// ───────────────────────────────────────────────────────────────────────────
function login(): never
{
    if (method() !== 'POST') json_error('Méthode non autorisée', 405);
    $b = read_json_body();

    $email = strtolower(trim((string) ($b['email'] ?? '')));
    $pwd   = (string) ($b['password'] ?? '');
    if ($email === '' || $pwd === '') json_error('E-mail et mot de passe requis.', 400);

    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $u = $stmt->fetch();

    // Message volontairement générique (anti-énumération de comptes)
    if (!$u || !password_verify($pwd, $u['password_hash'])) {
        json_error('E-mail ou mot de passe incorrect.', 401);
    }

    db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$u['id']]);
    json_out(['token' => auth_make_token((int) $u['id']), 'user' => public_user($u)]);
}

// ───────────────────────────────────────────────────────────────────────────
function me(): never
{
    $uid = require_auth();
    $stmt = db()->prepare('SELECT id, name, email, phone FROM users WHERE id = ?');
    $stmt->execute([$uid]);
    $u = $stmt->fetch();
    if (!$u) json_error('Utilisateur introuvable', 401);
    json_out(['user' => public_user($u)]);
}

// ───────────────────────────────────────────────────────────────────────────
// Crée une invitation (réservé aux utilisateurs connectés)
function invite(): never
{
    if (method() !== 'POST') json_error('Méthode non autorisée', 405);
    $uid = require_auth();
    $b = read_json_body();

    $email = strtolower(trim((string) ($b['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Adresse e-mail invalide.', 400);

    $pdo = db();
    $exists = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $exists->execute([$email]);
    if ($exists->fetchColumn() !== false) {
        json_error('Un compte existe déjà avec cet e-mail.', 409);
    }

    $code = bin2hex(random_bytes(16));
    $pdo->prepare(
        'INSERT INTO invitations (email, code, invited_by, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))'
    )->execute([$email, $code, $uid]);

    json_out(['ok' => true, 'email' => $email, 'code' => $code]);
}

// ───────────────────────────────────────────────────────────────────────────
// Demande de réinitialisation : envoie un code à 6 chiffres par WhatsApp
function request_reset(): never
{
    if (method() !== 'POST') json_error('Méthode non autorisée', 405);
    $b = read_json_body();
    $email = strtolower(trim((string) ($b['email'] ?? '')));

    // Réponse toujours OK (anti-énumération de comptes)
    $okResponse = ['ok' => true];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out($okResponse);

    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, phone FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $u = $stmt->fetch();
    if (!$u || empty($u['phone'])) json_out($okResponse);

    // Twilio Verify gère la génération, l'envoi WhatsApp, l'expiration et l'anti-fraude.
    require_once __DIR__ . '/twilio.php';
    twilio_verify_start((string) $u['phone']);

    json_out($okResponse);
}

// ───────────────────────────────────────────────────────────────────────────
// Réinitialise le mot de passe avec le code reçu
function reset_password(): never
{
    if (method() !== 'POST') json_error('Méthode non autorisée', 405);
    $b = read_json_body();

    $email = strtolower(trim((string) ($b['email'] ?? '')));
    $code  = trim((string) ($b['code'] ?? ''));
    $pwd   = (string) ($b['password'] ?? '');

    if ($email === '' || $code === '') json_error('Code et e-mail requis.', 400);
    if ($err = password_problem($pwd))  json_error($err, 400);

    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, phone FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $u = $stmt->fetch();
    if (!$u || empty($u['phone'])) json_error('Code invalide ou expiré.', 400);

    // Vérification du code via Twilio Verify
    require_once __DIR__ . '/twilio.php';
    if (!twilio_verify_check((string) $u['phone'], $code)) {
        json_error('Code invalide ou expiré.', 400);
    }

    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        ->execute([password_hash($pwd, PASSWORD_DEFAULT), $u['id']]);

    json_out(['ok' => true]);
}
