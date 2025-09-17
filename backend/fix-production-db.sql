-- Production Database Fix Script
-- Run this in production database to ensure parity with localhost

-- 1. Fix store verification status (if stores exist but not verified)
UPDATE stores SET is_verified = 1 WHERE is_verified = 0 OR is_verified IS NULL;

-- 2. Fix product verification status 
UPDATE products SET is_verified = 1 WHERE is_verified = 0 OR is_verified IS NULL;

-- 3. Ensure product is_active defaults to 1 for existing products
UPDATE products SET is_active = 1 WHERE is_active IS NULL;

-- 4. Verify admin user exists (optional - only if needed)
-- INSERT IGNORE INTO admins (username, password, created_at) 
-- VALUES ('admin', '$2b$10$YourHashedPasswordHere', NOW());

-- 5. Check data status
SELECT 'Stores Status:' as Info;
SELECT id, name, is_verified FROM stores;

SELECT 'Products Status:' as Info;
SELECT p.id, p.name, p.is_active, p.is_verified, s.name as store_name 
FROM products p 
LEFT JOIN stores s ON p.store_id = s.id;

SELECT 'Active & Verified Products Count:' as Info;
SELECT COUNT(*) as total 
FROM products p 
INNER JOIN stores s ON p.store_id = s.id 
WHERE p.is_active = 1 AND p.is_verified = 1 AND s.is_verified = 1;

-- 6. Fix any NULL values in critical fields
UPDATE stores SET 
  description = COALESCE(description, ''),
  address = COALESCE(address, ''),
  logo = COALESCE(logo, ''),
  banner = COALESCE(banner, '')
WHERE description IS NULL OR address IS NULL OR logo IS NULL OR banner IS NULL;

UPDATE products SET
  description = COALESCE(description, ''),
  poster_url = COALESCE(poster_url, ''),
  promo_price = COALESCE(promo_price, 0)
WHERE description IS NULL OR poster_url IS NULL OR promo_price IS NULL;

SELECT 'Database fix completed!' as Status;
