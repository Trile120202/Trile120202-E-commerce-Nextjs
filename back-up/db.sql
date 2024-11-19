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
DROP TABLE IF EXISTS delivery_addresses CASCADE;
DROP TABLE IF EXISTS user_delivery_addresses CASCADE;
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
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS banner_images CASCADE;
DROP TABLE IF EXISTS product_graphics_cards CASCADE;
DROP TABLE IF EXISTS graphics_cards CASCADE;
DROP TABLE IF EXISTS displays CASCADE;
DROP TABLE IF EXISTS product_displays CASCADE;
DROP TABLE IF EXISTS cpus CASCADE;
DROP TABLE IF EXISTS product_cpus CASCADE;
DROP TABLE IF EXISTS graphics_cards CASCADE;
DROP TABLE IF EXISTS product_graphics_cards CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS user_delivery_addresses CASCADE;
DROP TABLE IF EXISTS delivery_addresses CASCADE;

DROP FUNCTION IF EXISTS update_modified_column() CASCADE;

CREATE TABLE images
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255)   NOT NULL,
    slug           VARCHAR(255)   NOT NULL UNIQUE,
    price          DECIMAL(10, 2) NOT NULL,
    description    TEXT,
    specifications JSONB,
    stock_quantity INT            NOT NULL DEFAULT 0,
    thumbnail_id   UUID,
    created_at     TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    status         INT                     DEFAULT 1,
    FOREIGN KEY (thumbnail_id) REFERENCES images (id) ON DELETE SET NULL
);

CREATE INDEX idx_products_name_slug ON products (name, slug);
CREATE INDEX idx_products_price_stock ON products (price, stock_quantity);
CREATE INDEX idx_products_dates ON products (created_at, updated_at);
CREATE INDEX idx_products_status_thumb ON products (status, thumbnail_id);
CREATE INDEX idx_products_specs ON products USING GIN (specifications);

CREATE TABLE product_images
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID,
    image_id      UUID,
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
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    content    TEXT,
    image_id   UUID null,
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
    product_id  UUID,
    category_id UUID,
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
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status      INT DEFAULT 1
);

INSERT INTO roles (id, name, description) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'Administrator role');
INSERT INTO roles (id, name, description) VALUES ('550e8400-e29b-41d4-a716-446655440001', 'user', 'User role');


CREATE TABLE users
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    full_name TEXT,
    phone      VARCHAR(20),
    address    TEXT,
    avatar_id  UUID,
    role_id    UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001',
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
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    role_id       UUID,
    permission_id UUID,
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

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    icon_url VARCHAR(255),
    provider VARCHAR(100),
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INT DEFAULT 1
);

INSERT INTO payment_methods (name, code, description, is_active, icon_url, provider, config) VALUES
('Thanh toán khi nhận hàng', 'cod', 'Thanh toán tiền mặt khi nhận hàng', true, '/icons/cod.png', 'internal', '{"fee": 0}'),
('Chuyển khoản ngân hàng', 'bank_transfer', 'Chuyển khoản qua tài khoản ngân hàng', true, '/icons/bank.png', 'internal', '{"bank_name": "Vietcombank", "account_number": "1234567890", "account_name": "CÔNG TY TNHH ABC"}'),
('Ví điện tử MoMo', 'momo', 'Thanh toán qua ví MoMo', true, '/icons/momo.png', 'momo', '{"partner_code": "MOMO123", "access_key": "abc123"}'),
('ZaloPay', 'zalopay', 'Thanh toán qua ZaloPay', true, '/icons/zalopay.png', 'zalopay', '{"app_id": "zalo123", "key1": "key123"}'),
('VNPay', 'vnpay', 'Thanh toán qua cổng VNPay', true, '/icons/vnpay.png', 'vnpay', '{"terminal_id": "vnp123", "secret_key": "vnpsecret123"}');

CREATE INDEX idx_payment_methods_code ON payment_methods (code);
CREATE INDEX idx_payment_methods_is_active ON payment_methods (is_active);
CREATE INDEX idx_payment_methods_created_at ON payment_methods (created_at);
CREATE INDEX idx_payment_methods_updated_at ON payment_methods (updated_at);
CREATE INDEX idx_payment_methods_status ON payment_methods (status);


CREATE TABLE orders
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID,
    delivery_address_id UUID NOT NULL,
    note TEXT,
    order_date       TIMESTAMP                                                                                    DEFAULT CURRENT_TIMESTAMP,
    total_amount     TEXT,
    shipping_address TEXT,
    payment_method_id UUID,
    created_at       TIMESTAMP                                                                                    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP                                                                                    DEFAULT CURRENT_TIMESTAMP,
    status           INT                                                                                          DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_order_date ON orders (order_date);
CREATE INDEX idx_orders_total_amount ON orders (total_amount);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_orders_updated_at ON orders (updated_at);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_method ON orders (payment_method_id);

CREATE TABLE order_items
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID,
    product_id UUID,
    quantity   INT            NOT NULL,
    price      TEXT NOT NULL,
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
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID,
    user_id    UUID,
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
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(50) UNIQUE                                                  NOT NULL,
    discount_type       VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')) NOT NULL,
    discount_value      DECIMAL(10, 2)                                                      NOT NULL,
    start_date          DATE,
    end_date            DATE,
    min_purchase_amount DECIMAL(10, 2),
    max_usage           INT,
    max_discount_value  DECIMAL(10, 2),
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
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID,
    product_id UUID,
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
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    product_id UUID,
    tag_id     UUID,
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
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID          NOT NULL,
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
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(50) NOT NULL,
    capacity   INT NOT NULL,
    speed      INT NOT NULL,
    brand      VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1
);

CREATE INDEX idx_ram_name ON ram (name);
CREATE INDEX idx_ram_type ON ram (type);
CREATE INDEX idx_ram_capacity ON ram (capacity);
CREATE INDEX idx_ram_speed ON ram (speed);
CREATE INDEX idx_ram_brand ON ram (brand);
CREATE INDEX idx_ram_created_at ON ram (created_at);
CREATE INDEX idx_ram_updated_at ON ram (updated_at);
CREATE INDEX idx_ram_status ON ram (status);

CREATE TABLE hard_drives
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(50) NOT NULL,
    capacity   VARCHAR(50) NOT NULL,
    interface  VARCHAR(50) NOT NULL,
    brand      VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1
);

CREATE INDEX idx_hard_drives_name ON hard_drives (name);
CREATE INDEX idx_hard_drives_type ON hard_drives (type);
CREATE INDEX idx_hard_drives_capacity ON hard_drives (capacity);
CREATE INDEX idx_hard_drives_interface ON hard_drives (interface);
CREATE INDEX idx_hard_drives_brand ON hard_drives (brand);
CREATE INDEX idx_hard_drives_created_at ON hard_drives (created_at);
CREATE INDEX idx_hard_drives_updated_at ON hard_drives (updated_at);
CREATE INDEX idx_hard_drives_status ON hard_drives (status);

CREATE TABLE product_ram
(
    product_id UUID,
    ram_id     UUID,
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
    product_id UUID,
    hard_id    UUID,
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

CREATE TABLE carts
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_carts_user_id ON carts (user_id);
CREATE INDEX idx_carts_created_at ON carts (created_at);
CREATE INDEX idx_carts_updated_at ON carts (updated_at);
CREATE INDEX idx_carts_status ON carts (status);

CREATE TABLE cart_items
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id    UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     INT DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items (product_id);
CREATE INDEX idx_cart_items_created_at ON cart_items (created_at);
CREATE INDEX idx_cart_items_updated_at ON cart_items (updated_at);
CREATE INDEX idx_cart_items_status ON cart_items (status);

CREATE TABLE banners
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    location   TEXT NOT NULL,
    position   TEXT NOT NULL,
    status     INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_name ON banners (name);
CREATE INDEX idx_banners_created_at ON banners (created_at);
CREATE INDEX idx_banners_updated_at ON banners (updated_at);
CREATE INDEX idx_banners_status ON banners (status);

CREATE TABLE banner_images
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id  UUID NOT NULL,
    image_id   UUID NOT NULL,
    status     INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banner_id) REFERENCES banners (id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE
);

CREATE INDEX idx_banner_images_banner_id ON banner_images (banner_id);
CREATE INDEX idx_banner_images_image_id ON banner_images (image_id);
CREATE INDEX idx_banner_images_created_at ON banner_images (created_at);
CREATE INDEX idx_banner_images_updated_at ON banner_images (updated_at);
CREATE INDEX idx_banner_images_status ON banner_images (status);


CREATE TABLE displays
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    size        VARCHAR(50),
    resolution  VARCHAR(50),
    panel_type  VARCHAR(50),
    refresh_rate VARCHAR(20),
    status      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_displays_name ON displays (name);
CREATE INDEX idx_displays_status ON displays (status);
CREATE INDEX idx_displays_created_at ON displays (created_at);
CREATE INDEX idx_displays_updated_at ON displays (updated_at);

CREATE TABLE cpus
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    brand       VARCHAR(50),
    model       VARCHAR(50),
    cores       INT,
    threads     INT,
    base_clock  VARCHAR(20),
    boost_clock VARCHAR(20),
    cache       VARCHAR(50),
    status      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cpus_name ON cpus (name);
CREATE INDEX idx_cpus_brand ON cpus (brand);
CREATE INDEX idx_cpus_status ON cpus (status);
CREATE INDEX idx_cpus_created_at ON cpus (created_at);
CREATE INDEX idx_cpus_updated_at ON cpus (updated_at);

CREATE TABLE graphics_cards
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    brand       VARCHAR(50),
    memory_size VARCHAR(20),
    memory_type VARCHAR(20),
    clock_speed VARCHAR(20),
    status      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_graphics_cards_name ON graphics_cards (name);
CREATE INDEX idx_graphics_cards_brand ON graphics_cards (brand);
CREATE INDEX idx_graphics_cards_status ON graphics_cards (status);
CREATE INDEX idx_graphics_cards_created_at ON graphics_cards (created_at);
CREATE INDEX idx_graphics_cards_updated_at ON graphics_cards (updated_at);

CREATE TABLE product_displays
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL,
    display_id  UUID NOT NULL,
    status      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (display_id) REFERENCES displays (id) ON DELETE CASCADE
);

CREATE TABLE product_cpus
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL,
    cpu_id      UUID NOT NULL,
    status      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (cpu_id) REFERENCES cpus (id) ON DELETE CASCADE
);

CREATE TABLE product_graphics_cards
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID NOT NULL,
    graphics_card_id UUID NOT NULL,
    status           INT NOT NULL DEFAULT 1,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (graphics_card_id) REFERENCES graphics_cards (id) ON DELETE CASCADE
);

CREATE TABLE settings
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    value      TEXT,
    status     INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_name ON settings(name);
CREATE INDEX idx_settings_status ON settings(status);
CREATE INDEX idx_settings_created_at ON settings(created_at);

INSERT INTO settings (name, value) VALUES
('site_name', 'Laptop Store'),
('site_description', 'Cửa hàng laptop chính hãng'),
('contact_email', 'contact@laptopstore.com'),
('contact_phone', '0123456789'),
('contact_address', 'Hà Nội, Việt Nam'),
('social_facebook', 'https://facebook.com/laptopstore'),
('social_instagram', 'https://instagram.com/laptopstore'),
('social_twitter', 'https://twitter.com/laptopstore'),
('maintenance_mode', 'false'),
('currency', 'VND');

INSERT INTO settings (name, value) VALUES
('security_login_attempts', '5'),
('security_lockout_duration', '30'),
('security_password_expiry', '90'),
('security_password_length', '8'),
('security_password_complexity', 'true'),
('security_session_timeout', '60'),
('security_2fa_enabled', 'false'),
('security_ip_whitelist', ''),
('security_ssl_required', 'true'),
('security_jwt_expiry', '24');

CREATE TABLE provinces
(
    id            SERIAL PRIMARY KEY,
    name          TEXT    NOT NULL,
    code          INTEGER NOT NULL,
    division_type TEXT    NOT NULL,
    codename      TEXT    NOT NULL,
    phone_code    INTEGER NOT NULL,
    districts     JSONB DEFAULT '[]'
);
CREATE TABLE districts
(
    id            SERIAL PRIMARY KEY,
    name          TEXT    NOT NULL,
    code          INTEGER NOT NULL,
    division_type TEXT    NOT NULL,
    codename      TEXT    NOT NULL,
    province_code INTEGER NOT NULL,
    wards         JSONB DEFAULT '[]'

);
CREATE TABLE wards
(
    id            SERIAL PRIMARY KEY,
    name          TEXT    NOT NULL,
    code          INTEGER NOT NULL,
    division_type TEXT    NOT NULL,
    codename      TEXT    NOT NULL,
    district_code INTEGER NOT NULL
);

CREATE TABLE user_delivery_addresses (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    delivery_addresses_id UUID NOT NULL,
    is_default       BOOLEAN DEFAULT FALSE,
    status           INT NOT NULL DEFAULT 1,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_addresses
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    province_code    INT NOT NULL,
    district_code    INTEGER NOT NULL,
    ward_code        INTEGER NOT NULL,
    postal_code      TEXT,
    address TEXT,
    phone_number     TEXT,
    status INT DEFAULT 1,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);
