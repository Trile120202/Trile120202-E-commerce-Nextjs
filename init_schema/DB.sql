CREATE TABLE images (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        url VARCHAR(255) NOT NULL DEFAULT 'https://picsum.photos/2000/2000?random=12',
                        alt_text VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_url (url),
                        INDEX idx_created_at (created_at)
);


CREATE TABLE products (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(255) NOT NULL,
                          brand VARCHAR(100) NOT NULL,
                          model VARCHAR(100) NOT NULL,
                          price DECIMAL(10, 2) NOT NULL,
                          description TEXT,
                          stock_quantity INT NOT NULL DEFAULT 0,
                          thumbnail_id INT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (thumbnail_id) REFERENCES images(id) ON DELETE SET NULL,
                          INDEX idx_name (name),
                          INDEX idx_brand (brand),
                          INDEX idx_model (model),
                          INDEX idx_price (price),
                          INDEX idx_stock_quantity (stock_quantity),
                          INDEX idx_created_at (created_at),
                          INDEX idx_updated_at (updated_at)
);

CREATE TABLE product_images (
                                id INT PRIMARY KEY AUTO_INCREMENT,
                                product_id INT,
                                image_id INT,
                                display_order INT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                                FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
                                INDEX idx_product_id (product_id),
                                INDEX idx_image_id (image_id),
                                INDEX idx_display_order (display_order)
);

CREATE TABLE categories (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            name VARCHAR(100) NOT NULL,
                            content TEXT,
                            parent_id INT,
                            image_id INT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
                            FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL,
                            INDEX idx_name (name),
                            INDEX idx_parent_id (parent_id),
                            INDEX idx_created_at (created_at)
);

CREATE TABLE product_categories (
                                    product_id INT,
                                    category_id INT,
                                    PRIMARY KEY (product_id, category_id),
                                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                                    INDEX idx_product_id (product_id),
                                    INDEX idx_category_id (category_id)
);
CREATE TABLE carts(
                      id INT PRIMARY KEY AUTO_INCREMENT,
                      id_user INT NOT NULL,
                      total_price DECIMAL(10, 2) NOT NULL,
                      id_order INT NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,

                      FOREIGN KEY(id_order) REFERENCES orders(id)ON DELETE CASCADE

);
Create table cart_items(
                           id INT PRIMARY KEY AUTO_INCREMENT,
                           id_cart INT NOT NULL,
                           id_product INT NOT NULL,
                           quantity INT NOT NULL,               -- Số lượng sản phẩm
                           price DECIMAL(10, 2) NOT NULL,       -- Giá của sản phẩm
                           total_price DECIMAL(10, 2) NOT NULL,  -- Tổng giá (price * quantity)
                           FOREIGN KEY (id_cart) REFERENCES carts(id) ON DELETE CASCADE,
                           FOREIGN KEY (id_product) REFERENCES products(id) ON DELETE CASCADE

);
CREATE TABLE users (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       first_name VARCHAR(50),
                       last_name VARCHAR(50),
                       phone VARCHAR(20),
                       address TEXT,
                       avatar_id INT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (avatar_id) REFERENCES images(id) ON DELETE SET NULL,
                       INDEX idx_username (username),
                       INDEX idx_email (email),
                       INDEX idx_created_at (created_at)
);

CREATE TABLE roles (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       name VARCHAR(50) NOT NULL UNIQUE,
                       description TEXT,
                       INDEX idx_name (name)
);

CREATE TABLE user_roles (
                            user_id INT,
                            role_id INT,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                            INDEX idx_user_id (user_id),
                            INDEX idx_role_id (role_id)
);

CREATE TABLE permissions (
                             id INT PRIMARY KEY AUTO_INCREMENT,
                             name VARCHAR(50) NOT NULL UNIQUE,
                             description TEXT,
                             INDEX idx_name (name)
);

CREATE TABLE role_permissions (
                                  role_id INT,
                                  permission_id INT,
                                  PRIMARY KEY (role_id, permission_id),
                                  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                                  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
                                  INDEX idx_role_id (role_id),
                                  INDEX idx_permission_id (permission_id)
);
CREATE TABLE order_status (
                              status_id INT AUTO_INCREMENT PRIMARY KEY,
                              status_name VARCHAR(50) NOT NULL,
                              description VARCHAR(255),
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status_details (
                                      detail_id INT AUTO_INCREMENT PRIMARY KEY,
                                      order_id INT NOT NULL,
                                      status_id INT NOT NULL,
                                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      remarks VARCHAR(255),

                                      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                                      FOREIGN KEY (status_id) REFERENCES order_status(status_id) ON DELETE CASCADE
);
CREATE TABLE orders (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        user_id INT,
                        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        total_amount DECIMAL(10, 2) NOT NULL,
                        coupon_id INT ,
                        shipping_address TEXT,
                        payment_method VARCHAR(50),
                        FOREIGN KEY (coupon_id) REFERENCES coupons(id)ON DELETE SET NULL,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                        INDEX idx_user_id (user_id),
                        INDEX idx_order_date (order_date),

                        INDEX idx_total_amount (total_amount)
);

CREATE TABLE order_items (
                             id INT PRIMARY KEY AUTO_INCREMENT,
                             order_id INT,
                             product_id INT,
                             quantity INT NOT NULL,
                             price DECIMAL(10, 2) NOT NULL,
                             FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
                             INDEX idx_order_id (order_id),
                             INDEX idx_product_id (product_id)
);

CREATE TABLE reviews (
                         id INT PRIMARY KEY AUTO_INCREMENT,
                         product_id INT,
                         user_id INT,
                         rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         comment TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                         INDEX idx_product_id (product_id),
                         INDEX idx_user_id (user_id),
                         INDEX idx_rating (rating),
                         INDEX idx_created_at (created_at)
);

CREATE TABLE coupons (
                         id INT PRIMARY KEY AUTO_INCREMENT,
                         code VARCHAR(50) UNIQUE NOT NULL,
                         discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
                         discount_value DECIMAL(10, 2) NOT NULL,
                         start_date DATE,
                         end_date DATE,
                         min_purchase_amount DECIMAL(10, 2), --so tien toi thieu de có the su dung
                         max_usage INT, --so lan su dung toi da
                         is_active BOOLEAN DEFAULT TRUE,
                         INDEX idx_code (code),
                         INDEX idx_discount_type (discount_type),
                         INDEX idx_start_date (start_date),
                         INDEX idx_end_date (end_date),
                         INDEX idx_is_active (is_active)
);

CREATE TABLE wishlist (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          user_id INT,
                          product_id INT,
                          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                          UNIQUE KEY (user_id, product_id),
                          INDEX idx_user_id (user_id),
                          INDEX idx_product_id (product_id),
                          INDEX idx_added_at (added_at)
);

CREATE TABLE tags (
                      id INT PRIMARY KEY AUTO_INCREMENT,
                      name VARCHAR(50) NOT NULL UNIQUE,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      INDEX idx_name (name),
                      INDEX idx_created_at (created_at)
);

CREATE TABLE product_tags (
                              product_id INT,
                              tag_id INT,
                              PRIMARY KEY (product_id, tag_id),
                              FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                              FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
                              INDEX idx_product_id (product_id),
                              INDEX idx_tag_id (tag_id)
);
CREATE TABLE ram_specifications(
                                   id INT PRIMARY KEY AUTO_INCREMENT,
                                   product_id INT NOT NULL,
                                   name VARCHAR(255) NOT NULL,
                                   capacity VARCHAR(50),
                                   type VARCHAR(50),
                                   speed VARCHAR(50),
                                   FOREIGN KEY (id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE screen_specifications(
                                      id INT AUTO_INCREMENT PRIMARY KEY,
                                      product_id INT NOT NULL,
                                      size VARCHAR(255),
                                      resolution VARCHAR(50),
                                      panel_type VARCHAR(50),
                                      refresh_rate VARCHAR(50),
                                      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE cpu_specifications (
                                    cpu_id INT AUTO_INCREMENT PRIMARY KEY,
                                    product_id INT NOT NULL,
                                    model VARCHAR(50),              -- tên model CPU
                                    cores INT,                      -- số lượng nhân
                                    threads INT,                    -- số lượng luồng
                                    base_clock VARCHAR(50),         -- tốc độ xung nhịp cơ bản (GHz)
                                    boost_clock VARCHAR(50),        -- tốc độ xung nhịp tối đa (GHz)
                                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE battery_specifications (
                                        battery_id INT AUTO_INCREMENT PRIMARY KEY,
                                        product_id INT NOT NULL,
                                        capacity VARCHAR(50),           -- dung lượng pin (Wh hoặc mAh)
                                        type VARCHAR(50),               -- loại pin (Li-Ion, Li-Polymer,...)
                                        battery_life VARCHAR(50),       -- thời lượng pin (ví dụ: 10 giờ)
                                        charging_time VARCHAR(50),      -- thời gian sạc (ví dụ: 2 giờ)
                                        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE vga_specifications (
                                    vga_id INT AUTO_INCREMENT PRIMARY KEY,
                                    product_id INT NOT NULL,
                                    model VARCHAR(50),              -- tên model VGA
                                    vram VARCHAR(50),               -- dung lượng VRAM (ví dụ: 4GB)
                                    type VARCHAR(50),               -- loại bộ nhớ (GDDR5, GDDR6,...)
                                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE storage_specifications (
                                        storage_id INT AUTO_INCREMENT PRIMARY KEY,
                                        product_id INT NOT NULL,
                                        type VARCHAR(50),               -- loại ổ cứng (SSD, HDD)
                                        capacity VARCHAR(50),           -- dung lượng (ví dụ: 512GB)
                                        interface VARCHAR(50),          -- giao diện (SATA, NVMe,...)
                                        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE connectivity_ports (
                                    port_id INT AUTO_INCREMENT PRIMARY KEY,
                                    product_id INT NOT NULL,
                                    port_type VARCHAR(50),          -- loại cổng (USB, HDMI, Thunderbolt,...)
                                    quantity INT,                   -- số lượng cổng
                                    version VARCHAR(50),            -- phiên bản (ví dụ: USB 3.0, HDMI 2.1)
                                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);