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
DROP TABLE IF EXISTS ram CASCADE;
DROP TABLE IF EXISTS hard_drives CASCADE;
DROP TABLE IF EXISTS product_ram CASCADE;
DROP TABLE IF EXISTS product_hard_drives CASCADE;

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
    image_id   INT null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT       DEFAULT 1,
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_name ON categories (name);
CREATE INDEX idx_categories_slug ON categories (slug);
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

CREATE TABLE ram
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    size       VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1
);

CREATE INDEX idx_ram_name ON ram (name);
CREATE INDEX idx_ram_size ON ram (size);
CREATE INDEX idx_ram_created_at ON ram (created_at);
CREATE INDEX idx_ram_updated_at ON ram (updated_at);
CREATE INDEX idx_ram_status ON ram (status);

CREATE TABLE hard_drives
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    capacity   VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1
);

CREATE INDEX idx_hard_drives_name ON hard_drives (name);
CREATE INDEX idx_hard_drives_capacity ON hard_drives (capacity);
CREATE INDEX idx_hard_drives_created_at ON hard_drives (created_at);
CREATE INDEX idx_hard_drives_updated_at ON hard_drives (updated_at);
CREATE INDEX idx_hard_drives_status ON hard_drives (status);

CREATE TABLE product_ram
(
    product_id INT,
    ram_id     INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1,
    PRIMARY KEY (product_id, ram_id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (ram_id) REFERENCES ram (id) ON DELETE CASCADE
);

CREATE INDEX idx_product_ram_product_id ON product_ram (product_id);
CREATE INDEX idx_product_ram_ram_id ON product_ram (ram_id);
CREATE INDEX idx_product_ram_created_at ON product_ram (created_at);
CREATE INDEX idx_product_ram_updated_at ON product_ram (updated_at);
CREATE INDEX idx_product_ram_status ON product_ram (status);

CREATE TABLE product_hard_drives
(
    product_id INT,
    hard_id    INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1,
    PRIMARY KEY (product_id, hard_id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (hard_id) REFERENCES hard_drives (id) ON DELETE CASCADE
);

CREATE INDEX idx_product_hard_product_id ON product_hard_drives (product_id);
CREATE INDEX idx_product_hard_hard_id ON product_hard_drives (hard_id);
CREATE INDEX idx_product_hard_created_at ON product_hard_drives (created_at);
CREATE INDEX idx_product_hard_updated_at ON product_hard_drives (updated_at);
CREATE INDEX idx_product_hard_status ON product_hard_drives (status);

CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS
$func$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$func$ language 'plpgsql';

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
