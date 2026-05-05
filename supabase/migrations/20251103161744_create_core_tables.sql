/*
  # Create Core Database Schema

  1. New Tables
    - `sellers`: Seller/merchant accounts
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `shop_name` (text)
      - `shop_description` (text)
      - `merchant_qr` (text, QR code data)
      - `bank_name` (text)
      - `account_holder_name` (text)
      - `account_number` (text, encrypted)
      - `ifsc_code` (text)
      - `verification_status` (text)
      - `created_at` (timestamp)
    
    - `products`: Product catalog
      - `id` (uuid, primary key)
      - `seller_id` (uuid, foreign key to sellers)
      - `name` (text)
      - `description` (text, auto-generated from AI)
      - `price` (numeric)
      - `stock` (integer)
      - `category` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `cart_items`: Shopping cart items
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `created_at` (timestamp)
    
    - `orders`: Customer orders
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_amount` (numeric)
      - `status` (text)
      - `payment_method` (text)
      - `created_at` (timestamp)
    
    - `order_items`: Order line items
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `price` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and sellers
*/

CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  shop_description text,
  merchant_qr text,
  bank_name text,
  account_holder_name text,
  account_number text,
  ifsc_code text,
  verification_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  stock integer DEFAULT 0,
  category text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Sellers policies
CREATE POLICY "Sellers can view own profile"
  ON sellers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Sellers can update own profile"
  ON sellers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified sellers"
  ON sellers FOR SELECT
  TO anon
  USING (verification_status = 'verified');

-- Products policies
CREATE POLICY "Sellers can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view products from verified sellers"
  ON products FOR SELECT
  TO anon
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE verification_status = 'verified'
    )
  );

-- Cart policies
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);