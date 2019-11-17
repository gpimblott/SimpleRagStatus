ALTER TABLE project
    DROP COLUMN IF EXISTS product_owner,
    DROP COLUMN IF EXISTS tech_lead;

DROP TABLE IF EXISTS milestone;