CREATE DATABASE IF NOT EXISTS kuberone_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'kuberone'@'localhost' IDENTIFIED BY 'kuberone';
CREATE USER IF NOT EXISTS 'kuberone'@'127.0.0.1' IDENTIFIED BY 'kuberone';

GRANT ALL PRIVILEGES ON kuberone_dev.* TO 'kuberone'@'localhost';
GRANT ALL PRIVILEGES ON kuberone_dev.* TO 'kuberone'@'127.0.0.1';

FLUSH PRIVILEGES;
