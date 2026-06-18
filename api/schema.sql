-- =========================================================
-- Escal Concept — Schéma MySQL partagé
-- Utilisé par : modul-escal (configurateur) + admin-escal (dashboard)
-- =========================================================



-- ---------------------------------------------------------
-- 1. GRILLE TARIFAIRE — MARCHE DROITE
--    Profondeur × Largeur → prix unitaire (€/marche)
--    Source : tableau "LES TAILLES PAR MARCHE - Droit"
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_step (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  depth_band   ENUM('D_LT_320','D_GT_320') NOT NULL,
  width_band   ENUM('W_LT_800','W_801_1000','W_1001_1300','W_1301_1600','W_1601_1800') NOT NULL,
  price_eur    DECIMAL(8,2) NOT NULL,
  UNIQUE KEY uq_band (depth_band, width_band)
) ENGINE=InnoDB;

INSERT INTO price_step (depth_band, width_band, price_eur) VALUES
  ('D_LT_320', 'W_LT_800',      50),
  ('D_LT_320', 'W_801_1000',    60),
  ('D_LT_320', 'W_1001_1300',   70),
  ('D_LT_320', 'W_1301_1600',   80),
  ('D_LT_320', 'W_1601_1800',   90),
  ('D_GT_320', 'W_LT_800',     100),
  ('D_GT_320', 'W_801_1000',   120),
  ('D_GT_320', 'W_1001_1300',  140),
  ('D_GT_320', 'W_1301_1600',  160),
  ('D_GT_320', 'W_1601_1800',  180)
ON DUPLICATE KEY UPDATE price_eur = VALUES(price_eur);

-- ---------------------------------------------------------
-- 2. PRIX CONTREMARCHES (riser options)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_riser (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  riser_option    ENUM('NONE','DECOR','BLACK_MATTE','WHITE_MATTE') NOT NULL UNIQUE,
  price_per_step  DECIMAL(8,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;

INSERT INTO price_riser (riser_option, price_per_step) VALUES
  ('NONE',        0),
  ('DECOR',       0),
  ('BLACK_MATTE', 19),
  ('WHITE_MATTE', 19)
ON DUPLICATE KEY UPDATE price_per_step = VALUES(price_per_step);

-- ---------------------------------------------------------
-- 3. PRIX EMBOUTS DE MARCHE
--    NONE = 0, OPEN_STEP = à définir, OVERHANGING = à définir
--    Règle : max 60 embouts par commande
--    Profondeur > 630 mm = INTERDIT (popup "Contacter le support")
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_end_cap (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  end_cap_type    ENUM('NONE','OPEN_STEP','OVERHANGING') NOT NULL UNIQUE,
  price_per_unit  DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  max_quantity    INT UNSIGNED NOT NULL DEFAULT 60
) ENGINE=InnoDB;

INSERT INTO price_end_cap (end_cap_type, price_per_unit, max_quantity) VALUES
  ('NONE',        0.00, 60),
  ('OPEN_STEP',   0.00, 60),   -- À mettre à jour avec le prix réel
  ('OVERHANGING', 0.00, 60)    -- À mettre à jour avec le prix réel
ON DUPLICATE KEY UPDATE price_per_unit = VALUES(price_per_unit);

-- ---------------------------------------------------------
-- 4. CONTRAINTES MÉTIER
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_rules (
  rule_key    VARCHAR(80) PRIMARY KEY,
  rule_value  VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

INSERT INTO business_rules (rule_key, rule_value, description) VALUES
  ('max_depth_mm',      '630',  'Profondeur max en mm — au-delà : popup "Contacter le support"'),
  ('max_step_count',    '30',   'Nombre max de marches par commande'),
  ('max_end_cap_count', '60',   'Nombre max d\'embouts par commande'),
  ('glue_cost_per_3',   '12',   'Colle : 12 € tous les 3 marches')
ON DUPLICATE KEY UPDATE rule_value = VALUES(rule_value);

-- ---------------------------------------------------------
-- 5. LEADS (soumissions du configurateur)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Contact
  first_name                  VARCHAR(100) NOT NULL,
  last_name                   VARCHAR(100) NOT NULL,
  email                       VARCHAR(255) NOT NULL,
  phone                       VARCHAR(50)  NOT NULL,
  country                     VARCHAR(100) NOT NULL DEFAULT '',

  -- Configuration
  decor                       VARCHAR(50)  NOT NULL,
  riser_option                ENUM('NONE','DECOR','BLACK_MATTE','WHITE_MATTE') NOT NULL,
  step_count                  TINYINT UNSIGNED NOT NULL,
  uniform_step_dimensions     TINYINT(1) NOT NULL DEFAULT 1,
  width_band                  ENUM('W_LT_800','W_801_1000','W_1001_1300','W_1301_1600','W_1601_1800') NULL,
  depth_band                  ENUM('D_LT_320','D_GT_320') NULL,
  step_configs_json           JSON NULL COMMENT 'Tableau des configs par marche (si non uniformes)',
  open_sides                  TINYINT(1) NOT NULL DEFAULT 0,
  intermediate_landing        TINYINT(1) NOT NULL DEFAULT 0,
  landing_finish              ENUM('NONE','NEZ_SEUIL','NEZ_RACCORD_PARQUET') NOT NULL DEFAULT 'NONE',
  step_end_cap                ENUM('NONE','OPEN_STEP','OVERHANGING') NOT NULL DEFAULT 'NONE',
  open_step_end_side          ENUM('LEFT','RIGHT') NULL,
  lateral_end_side            ENUM('LEFT','RIGHT') NULL,

  -- Tarification calculée
  estimated_materials_eur     DECIMAL(10,2) NULL,
  price_breakdown_json        JSON NULL,
  photos_json                 JSON NULL COMMENT 'Chemins des photos transmises par le client',

  -- Suivi dashboard
  status                      ENUM('new','pending','won','lost') NOT NULL DEFAULT 'new',
  last_snippet                TEXT NULL COMMENT 'Dernier message WhatsApp affiché',
  unread_count                TINYINT UNSIGNED NOT NULL DEFAULT 0,
  internal_notes              TEXT NULL COMMENT 'Notes internes — visibles uniquement par l\'equipe commerciale',

  -- Horodatage
  created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 6. CONVERSATIONS WhatsApp
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id     INT UNSIGNED NOT NULL,
  author      ENUM('client','vendor') NOT NULL,
  message     TEXT NOT NULL,
  sent_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_conv_lead (lead_id, sent_at),
  CONSTRAINT fk_conv_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB;
