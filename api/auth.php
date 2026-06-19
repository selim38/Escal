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
    case 'signup': signup(); break;
    case 'login':  login();  break;
    case 'me':     me();     break;
    default:       json_error('Action inconnue', 404);
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

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Adresse e-mail invalide.', 400);
    if ($phone === '')                              json_error('Le numéro de téléphone est requis.', 400);
    if ($name === '')                               json_error('Le nom est requis.', 400);
    if ($err = password_problem($pwd))              json_error($err, 400);

    $pdo = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() !== false) {
        json_error('Un compte existe déjà avec cet e-mail.', 409);
    }

    $hash = password_hash($pwd, PASSWORD_DEFAULT);
    $pdo->prepare('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)')
        ->execute([$name, $email, $phone, $hash]);
    $id = (int) $pdo->lastInsertId();

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
