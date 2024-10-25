DROP TABLE IF EXISTS product_specifications CASCADE;
DROP TABLE IF EXISTS product_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS images CASCADE;


DROP FUNCTION IF EXISTS update_modified_column() CASCADE;


CREATE TABLE images
(
    id         SERIAL PRIMARY KEY,
    url        VARCHAR(255) NOT NULL DEFAULT 'https://picsum.photos/2000/2000?random=12',
    alt_text   VARCHAR(255),
    created_at TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    status     INT                   DEFAULT 1
);

-- Function to generate random data for the images table
CREATE OR REPLACE FUNCTION generate_image_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..num_records LOOP
        INSERT INTO images (url, alt_text, status)
        VALUES (
            'https://picsum.photos/2000/2000?random=' || (random() * 1000)::INT,
            'Random image ' || i,
            (random() * 2 + 1)::INT
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 100 random image records
SELECT generate_image_data(100);

-- Example usage: Generate 100 random image records
-- SELECT generate_image_data(100);

CREATE INDEX idx_images_url ON images (url);
CREATE INDEX idx_images_created_at ON images (created_at);
CREATE INDEX idx_images_updated_at ON images (updated_at);
CREATE INDEX idx_images_status ON images (status);

CREATE TABLE products
(
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255)   NOT NULL,
    slug           VARCHAR(255)   NOT NULL UNIQUE,
    brand          VARCHAR(100)   NOT NULL,
    model          VARCHAR(100)   NOT NULL,
    price          DECIMAL(10, 2) NOT NULL,
    description    TEXT,
    specifications JSONB,
    stock_quantity INT            NOT NULL DEFAULT 0,
    thumbnail_id   INT,
    created_at     TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    status         INT                     DEFAULT 1,
    FOREIGN KEY (thumbnail_id) REFERENCES images (id) ON DELETE SET NULL
);

-- Function to generate random data for the products table
CREATE OR REPLACE FUNCTION generate_product_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_name VARCHAR(255);
    random_slug VARCHAR(255);
    random_brand VARCHAR(100);
    random_model VARCHAR(100);
    random_price DECIMAL(10, 2);
    random_description TEXT;
    random_specs JSONB;
    random_stock INTEGER;
    random_thumbnail INTEGER;
    max_image_id INTEGER;
BEGIN
    -- Get the maximum image_id
    SELECT MAX(id) INTO max_image_id FROM images;

    FOR i IN 1..num_records LOOP
        random_name := 'Product ' || i;
        random_slug := LOWER(REPLACE(random_name, ' ', '-'));
        random_brand := 'Brand ' || (random() * 10 + 1)::INT;
        random_model := 'Model ' || (random() * 100 + 1)::INT;
        random_price := (random() * 1000 + 10)::DECIMAL(10, 2);
        random_description := 'Description for product ' || i;
        random_specs := json_build_object(
            'weight', (random() * 10 + 0.1)::DECIMAL(4, 2) || ' kg',
            'dimensions', (random() * 50 + 10)::INT || 'x' || (random() * 50 + 10)::INT || 'x' || (random() * 50 + 10)::INT || ' cm'
        );
        random_stock := (random() * 100 + 1)::INT;
        random_thumbnail := (random() * max_image_id + 1)::INT;

        INSERT INTO products (name, slug, brand, model, price, description, specifications, stock_quantity, thumbnail_id)
        VALUES (random_name, random_slug, random_brand, random_model, random_price, random_description, random_specs, random_stock, random_thumbnail);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 100 random product records
SELECT generate_product_data(100);

CREATE INDEX idx_products_name ON products (name);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_brand ON products (brand);
CREATE INDEX idx_products_model ON products (model);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_stock_quantity ON products (stock_quantity);
CREATE INDEX idx_products_created_at ON products (created_at);
CREATE INDEX idx_products_updated_at ON products (updated_at);
CREATE INDEX idx_products_status ON products (status);

CREATE TABLE product_images
(
    id            SERIAL PRIMARY KEY,
    product_id    INT,
    image_id      INT,
    display_order INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status        INT       DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE
);

-- Function to generate random data for the product_images table
CREATE OR REPLACE FUNCTION generate_product_image_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_product_id INTEGER;
    random_image_id INTEGER;
    random_display_order INTEGER;
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random product_id from existing products
        SELECT id INTO random_product_id FROM products ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random image_id from existing images
        SELECT id INTO random_image_id FROM images ORDER BY RANDOM() LIMIT 1;
        
        random_display_order := (random() * 10 + 1)::INT;

        INSERT INTO product_images (product_id, image_id, display_order)
        VALUES (random_product_id, random_image_id, random_display_order);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 200 random product_image records
SELECT generate_product_image_data(200);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_image_id ON product_images (image_id);
CREATE INDEX idx_product_images_display_order ON product_images (display_order);
CREATE INDEX idx_product_images_created_at ON product_images (created_at);
CREATE INDEX idx_product_images_updated_at ON product_images (updated_at);
CREATE INDEX idx_product_images_status ON product_images (status);

CREATE TABLE categories
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    content    TEXT,
    parent_id  INT,
    image_id   INT null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT       DEFAULT 1,
    FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE SET NULL
);

-- Function to generate random categories
CREATE OR REPLACE FUNCTION generate_random_categories(n INTEGER) RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_name VARCHAR(100);
    random_slug VARCHAR(100);
    random_content TEXT;
    random_parent_id INT;
    random_image_id INT;
    laptop_categories VARCHAR[] := ARRAY['Gaming Laptops', 'Business Laptops', 'Ultrabooks', '2-in-1 Laptops', 'Budget Laptops', 'High-Performance Laptops', 'Student Laptops', 'Workstation Laptops', 'Chromebooks', 'MacBooks'];
BEGIN
    FOR i IN 1..n LOOP
        IF i <= array_length(laptop_categories, 1) THEN
            random_name := laptop_categories[i];
        ELSE
            random_name := 'Laptop Category ' || i;
        END IF;
        random_slug := lower(regexp_replace(random_name, '\s+', '-', 'g'));
        random_content := 'Content for ' || random_name;
        
        -- Randomly decide if this category should have a parent
        IF i > 1 AND random() < 0.3 THEN
            random_parent_id := floor(random() * (i - 1) + 1)::INT;
        ELSE
            random_parent_id := NULL;
        END IF;
        
        -- Assume we have some images already in the images table
        -- You might need to adjust this based on your actual data
        random_image_id := floor(random() * 10 + 1)::INT;
        
        INSERT INTO categories (name, slug, content, parent_id, image_id)
        VALUES (random_name, random_slug, random_content, random_parent_id, random_image_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Call the function to generate 50 random categories
SELECT generate_random_categories(50);

CREATE INDEX idx_categories_name ON categories (name);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_created_at ON categories (created_at);
CREATE INDEX idx_categories_updated_at ON categories (updated_at);
CREATE INDEX idx_categories_status ON categories (status);

CREATE TABLE product_categories
(
    product_id  INT,
    category_id INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status      INT DEFAULT 1,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- Function to generate random product_categories data
CREATE OR REPLACE FUNCTION generate_product_categories_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_product_id INTEGER;
    random_category_id INTEGER;
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random product_id from existing products
        SELECT id INTO random_product_id FROM products ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random category_id from existing categories
        SELECT id INTO random_category_id FROM categories ORDER BY RANDOM() LIMIT 1;

        -- Avoid duplicate entries
        INSERT INTO product_categories (product_id, category_id)
        VALUES (random_product_id, random_category_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 200 random product_categories records
SELECT generate_product_categories_data(200);

CREATE INDEX idx_product_categories_product_id ON product_categories (product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories (category_id);
CREATE INDEX idx_product_categories_created_at ON product_categories (created_at);
CREATE INDEX idx_product_categories_updated_at ON product_categories (updated_at);
CREATE INDEX idx_product_categories_status ON product_categories (status);

CREATE TABLE roles
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status      INT DEFAULT 1
);
INSERT INTO roles (name, description, created_at)
VALUES ('admin', 'Administrator with full access', CURRENT_TIMESTAMP),
       ('manager', 'Manager with elevated privileges', CURRENT_TIMESTAMP),
       ('user', 'Regular user with standard access', CURRENT_TIMESTAMP);

CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    phone      VARCHAR(20),
    address    TEXT,
    avatar_id  INT,
    role_id    INT          NOT NULL DEFAULT 3,
    status     INT                   DEFAULT 1,
    created_at TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (avatar_id) REFERENCES images (id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL
);

-- Function to generate random user data
CREATE OR REPLACE FUNCTION generate_user_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_username VARCHAR(50);
    random_password VARCHAR(255);
    random_email VARCHAR(100);
    random_first_name VARCHAR(50);
    random_last_name VARCHAR(50);
    random_phone VARCHAR(20);
    random_address TEXT;
    random_avatar_id INT;
    random_role_id INT;
BEGIN
    FOR i IN 1..num_records LOOP
        random_username := 'user' || i;
        random_password := md5(random()::text); -- This is just an example, use proper password hashing in production
        random_email := 'user' || i || '@example.com';
        random_first_name := 'FirstName' || i;
        random_last_name := 'LastName' || i;
        random_phone := '+1' || (floor(random() * 9000000000) + 1000000000)::TEXT;
        random_address := 'Address ' || i;
        
        -- Select a random avatar_id from existing images
        SELECT id INTO random_avatar_id FROM images ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random role_id from existing roles
        SELECT id INTO random_role_id FROM roles ORDER BY RANDOM() LIMIT 1;

        INSERT INTO users (username, password, email, first_name, last_name, phone, address, avatar_id, role_id)
        VALUES (random_username, random_password, random_email, random_first_name, random_last_name, random_phone, random_address, random_avatar_id, random_role_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 100 random user records
SELECT generate_user_data(100);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_updated_at ON users (updated_at);
CREATE INDEX idx_users_role_id ON users (role_id);
CREATE INDEX idx_users_status ON users (status);

CREATE INDEX idx_roles_name ON roles (name);
CREATE INDEX idx_roles_created_at ON roles (created_at);
CREATE INDEX idx_roles_updated_at ON roles (updated_at);
CREATE INDEX idx_roles_status ON roles (status);

CREATE TABLE permissions
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status      INT DEFAULT 1
);

-- Function to generate random permission data
CREATE OR REPLACE FUNCTION generate_permission_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_name VARCHAR(50);
    random_description TEXT;
BEGIN
    FOR i IN 1..num_records LOOP
        random_name := 'permission_' || i;
        random_description := 'Description for permission ' || i;

        INSERT INTO permissions (name, description)
        VALUES (random_name, random_description);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 20 random permission records
SELECT generate_permission_data(20);

CREATE INDEX idx_permissions_name ON permissions (name);
CREATE INDEX idx_permissions_created_at ON permissions (created_at);
CREATE INDEX idx_permissions_updated_at ON permissions (updated_at);
CREATE INDEX idx_permissions_status ON permissions (status);

CREATE TABLE role_permissions
(
    role_id       INT,
    permission_id INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status        INT DEFAULT 1,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

-- Function to generate random role_permissions data
CREATE OR REPLACE FUNCTION generate_role_permissions_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_role_id INTEGER;
    random_permission_id INTEGER;
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random role_id from existing roles
        SELECT id INTO random_role_id FROM roles ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random permission_id from existing permissions
        SELECT id INTO random_permission_id FROM permissions ORDER BY RANDOM() LIMIT 1;

        -- Avoid duplicate entries
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (random_role_id, random_permission_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 50 random role_permissions records
SELECT generate_role_permissions_data(50);

CREATE INDEX idx_role_permissions_role_id ON role_permissions (role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions (permission_id);
CREATE INDEX idx_role_permissions_created_at ON role_permissions (created_at);
CREATE INDEX idx_role_permissions_updated_at ON role_permissions (updated_at);
CREATE INDEX idx_role_permissions_status ON role_permissions (status);

CREATE TABLE orders
(
    id               SERIAL PRIMARY KEY,
    user_id          INT,
    order_date       TIMESTAMP                                                                                    DEFAULT CURRENT_TIMESTAMP,
    total_amount     DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    payment_method   VARCHAR(50),
    created_at       TIMESTAMP                                                                                    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP                                                                                    DEFAULT CURRENT_TIMESTAMP,
    status           INT                                                                                          DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Function to generate random order data
CREATE OR REPLACE FUNCTION generate_order_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_user_id INTEGER;
    random_total_amount DECIMAL(10, 2);
    random_shipping_address TEXT;
    random_payment_method VARCHAR(50);
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random user_id from existing users
        SELECT id INTO random_user_id FROM users ORDER BY RANDOM() LIMIT 1;
        
        random_total_amount := (random() * 1000 + 10)::DECIMAL(10, 2);
        random_shipping_address := 'Shipping Address ' || i;
        random_payment_method := (ARRAY['Credit Card', 'PayPal', 'Bank Transfer'])[floor(random() * 3 + 1)];

        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
        VALUES (random_user_id, random_total_amount, random_shipping_address, random_payment_method);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 200 random order records
SELECT generate_order_data(200);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_order_date ON orders (order_date);
CREATE INDEX idx_orders_total_amount ON orders (total_amount);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_orders_updated_at ON orders (updated_at);
CREATE INDEX idx_orders_status ON orders (status);

CREATE TABLE order_items
(
    id         SERIAL PRIMARY KEY,
    order_id   INT,
    product_id INT,
    quantity   INT            NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    status     INT            DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

-- Function to generate random order_items data
CREATE OR REPLACE FUNCTION generate_order_items_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_order_id INTEGER;
    random_product_id INTEGER;
    random_quantity INTEGER;
    random_price DECIMAL(10, 2);
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random order_id from existing orders
        SELECT id INTO random_order_id FROM orders ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random product_id from existing products
        SELECT id INTO random_product_id FROM products ORDER BY RANDOM() LIMIT 1;
        
        random_quantity := (random() * 5 + 1)::INT;
        random_price := (random() * 100 + 10)::DECIMAL(10, 2);

        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (random_order_id, random_product_id, random_quantity, random_price);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 500 random order_items records
SELECT generate_order_items_data(500);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
CREATE INDEX idx_order_items_created_at ON order_items (created_at);
CREATE INDEX idx_order_items_updated_at ON order_items (updated_at);
CREATE INDEX idx_order_items_status ON order_items (status);

CREATE TABLE reviews
(
    id         SERIAL PRIMARY KEY,
    product_id INT,
    user_id    INT,
    rating     INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT       DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Function to generate random review data
CREATE OR REPLACE FUNCTION generate_review_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_product_id INTEGER;
    random_user_id INTEGER;
    random_rating INTEGER;
    random_comment TEXT;
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random product_id from existing products
        SELECT id INTO random_product_id FROM products ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random user_id from existing users
        SELECT id INTO random_user_id FROM users ORDER BY RANDOM() LIMIT 1;
        
        random_rating := (random() * 4 + 1)::INT;
        random_comment := 'Review comment ' || i;

        INSERT INTO reviews (product_id, user_id, rating, comment)
        VALUES (random_product_id, random_user_id, random_rating, random_comment);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 300 random review records
SELECT generate_review_data(300);

CREATE INDEX idx_reviews_product_id ON reviews (product_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);
CREATE INDEX idx_reviews_created_at ON reviews (created_at);
CREATE INDEX idx_reviews_updated_at ON reviews (updated_at);
CREATE INDEX idx_reviews_status ON reviews (status);

CREATE TABLE coupons
(
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(50) UNIQUE                                                  NOT NULL,
    discount_type       VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')) NOT NULL,
    discount_value      DECIMAL(10, 2)                                                      NOT NULL,
    start_date          DATE,
    end_date            DATE,
    min_purchase_amount DECIMAL(10, 2),
    max_usage           INT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status              INT     DEFAULT 1
);

-- Function to generate random coupon data
CREATE OR REPLACE FUNCTION generate_coupon_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_code VARCHAR(50);
    random_discount_type VARCHAR(20);
    random_discount_value DECIMAL(10, 2);
    random_start_date DATE;
    random_end_date DATE;
    random_min_purchase_amount DECIMAL(10, 2);
    random_max_usage INTEGER;
BEGIN
    FOR i IN 1..num_records LOOP
        random_code := 'COUPON' || i;
        random_discount_type := (ARRAY['percentage', 'fixed_amount'])[floor(random() * 2 + 1)];
        
        IF random_discount_type = 'percentage' THEN
            random_discount_value := (random() * 50 + 5)::DECIMAL(10, 2);
        ELSE
            random_discount_value := (random() * 100 + 10)::DECIMAL(10, 2);
        END IF;
        
        random_start_date := CURRENT_DATE + (random() * 30)::INT;
        random_end_date := random_start_date + (random() * 60 + 30)::INT;
        random_min_purchase_amount := (random() * 200 + 50)::DECIMAL(10, 2);
        random_max_usage := (random() * 100 + 1)::INT;

        INSERT INTO coupons (code, discount_type, discount_value, start_date, end_date, min_purchase_amount, max_usage)
        VALUES (random_code, random_discount_type, random_discount_value, random_start_date, random_end_date, random_min_purchase_amount, random_max_usage);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 50 random coupon records
SELECT generate_coupon_data(50);

CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_discount_type ON coupons (discount_type);
CREATE INDEX idx_coupons_start_date ON coupons (start_date);
CREATE INDEX idx_coupons_end_date ON coupons (end_date);
CREATE INDEX idx_coupons_is_active ON coupons (is_active);
CREATE INDEX idx_coupons_created_at ON coupons (created_at);
CREATE INDEX idx_coupons_updated_at ON coupons (updated_at);
CREATE INDEX idx_coupons_status ON coupons (status);

CREATE TABLE wishlist
(
    id         SERIAL PRIMARY KEY,
    user_id    INT,
    product_id INT,
    added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT       DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

-- Function to generate random wishlist data
CREATE OR REPLACE FUNCTION generate_wishlist_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_user_id INTEGER;
    random_product_id INTEGER;
BEGIN
    FOR i IN 1..num_records LOOP
        -- Select a random user_id from existing users
        SELECT id INTO random_user_id FROM users ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random product_id from existing products
        SELECT id INTO random_product_id FROM products ORDER BY RANDOM() LIMIT 1;

        -- Avoid duplicate entries
        INSERT INTO wishlist (user_id, product_id)
        VALUES (random_user_id, random_product_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 200 random wishlist records
SELECT generate_wishlist_data(200);

CREATE INDEX idx_wishlist_user_id ON wishlist (user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist (product_id);
CREATE INDEX idx_wishlist_added_at ON wishlist (added_at);
CREATE INDEX idx_wishlist_updated_at ON wishlist (updated_at);
CREATE INDEX idx_wishlist_status ON wishlist (status);

CREATE TABLE tags
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT       DEFAULT 1
);

-- Function to create sample data for tags
CREATE OR REPLACE FUNCTION create_sample_tags(num_tags INTEGER)
RETURNS VOID AS $$
DECLARE
    tag_names TEXT[] := ARRAY['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Health'];
    i INTEGER;
BEGIN
    FOR i IN 1..LEAST(num_tags, array_length(tag_names, 1)) LOOP
        INSERT INTO tags (name) VALUES (tag_names[i]);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create sample tags (e.g., create 5 tags)
SELECT create_sample_tags(30);

CREATE INDEX idx_tags_name ON tags (name);
CREATE INDEX idx_tags_created_at ON tags (created_at);
CREATE INDEX idx_tags_updated_at ON tags (updated_at);
CREATE INDEX idx_tags_status ON tags (status);

CREATE TABLE product_tags
(
    product_id INT,
    tag_id     INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- Function to generate random product_tags data
CREATE OR REPLACE FUNCTION generate_product_tags_data(num_records INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    random_product_id INTEGER;
    random_tag_id INTEGER;
    max_product_id INTEGER;
    max_tag_id INTEGER;
BEGIN
    -- Get the maximum product_id and tag_id
    SELECT MAX(id) INTO max_product_id FROM products;
    SELECT MAX(id) INTO max_tag_id FROM tags;

    FOR i IN 1..num_records LOOP
        -- Select a random product_id from existing products
        SELECT id INTO random_product_id FROM products ORDER BY RANDOM() LIMIT 1;
        
        -- Select a random tag_id from existing tags
        SELECT id INTO random_tag_id FROM tags ORDER BY RANDOM() LIMIT 1;

        -- Avoid duplicate entries
        INSERT INTO product_tags (product_id, tag_id)
        VALUES (random_product_id, random_tag_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate 300 random product_tags records
SELECT generate_product_tags_data(300);

CREATE INDEX idx_product_tags_product_id ON product_tags (product_id);
CREATE INDEX idx_product_tags_tag_id ON product_tags (tag_id);
CREATE INDEX idx_product_tags_created_at ON product_tags (created_at);
CREATE INDEX idx_product_tags_updated_at ON product_tags (updated_at);
CREATE INDEX idx_product_tags_status ON product_tags (status);

CREATE TABLE product_specifications
(
    id         SERIAL PRIMARY KEY,
    product_id INT          NOT NULL,
    spec_name  VARCHAR(100) NOT NULL,
    spec_value TEXT         NOT NULL,
    unit       VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE (product_id, spec_name)
);

CREATE INDEX idx_product_specifications_product_id ON product_specifications (product_id);
CREATE INDEX idx_product_specifications_spec_name ON product_specifications (spec_name);
CREATE INDEX idx_product_specifications_created_at ON product_specifications (created_at);
CREATE INDEX idx_product_specifications_updated_at ON product_specifications (updated_at);
CREATE INDEX idx_product_specifications_status ON product_specifications (status);

CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_modtime
    BEFORE UPDATE
    ON products
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_images_modtime
    BEFORE UPDATE
    ON images
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
