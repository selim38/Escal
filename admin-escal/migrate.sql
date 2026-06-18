-- Migration — à exécuter une seule fois sur la DB existante
USE escal_concept;

-- 1. Ajouter la colonne country
ALTER TABLE leads
  ADD COLUMN country VARCHAR(100) NOT NULL DEFAULT ''
  AFTER phone;

-- 2. Ajouter 'new' dans l'enum status et en faire la valeur par défaut
ALTER TABLE leads
  MODIFY COLUMN status ENUM('new','pending','won','lost') NOT NULL DEFAULT 'new';

-- 3. Ajouter la colonne photos
ALTER TABLE leads
  ADD COLUMN photos_json JSON NULL COMMENT 'Chemins des photos transmises par le client'
  AFTER price_breakdown_json;
