-- Migration: Add order_number sequential column to orders table
-- Run this on the existing database to add sequential order numbers

-- Create the sequence
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START WITH 1;

-- Add the column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER UNIQUE;

-- Populate existing orders with sequential numbers based on creation date
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM orders
)
UPDATE orders SET order_number = numbered.rn
FROM numbered WHERE orders.id = numbered.id;

-- Set the sequence to continue from the max existing number
SELECT setval('orders_order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1, false);

-- Set default for new orders
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('orders_order_number_seq');
