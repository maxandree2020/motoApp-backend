CREATE DATABASE IF NOT EXISTS renta_motos;
USE renta_motos;

CREATE TABLE clientes (
  id INT unsigned AUTO_INCREMENT PRIMARY KEY,
  dni varchar(10) not null,
  nombre VARCHAR(100),
  email VARCHAR(100),
  cel VARCHAR(20),
  dir varchar(100)
);
CREATE TABLE motos (
  id INT unsigned AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) not null,
  descrip varchar(100),
  tipo ENUM('venta', 'alquiler'),
  precio DECIMAL(10, 2),
  disponible BOOLEAN DEFAULT true
);
CREATE TABLE alquileres (
  id INT unsigned AUTO_INCREMENT PRIMARY KEY,
  moto_id INT unsigned ,
  cliente_id INT unsigned,
  fecha_inicio DATE,
  fecha_fin DATE,
  precio_total DECIMAL(10, 2),
  FOREIGN KEY (moto_id) REFERENCES motos(id) on update cascade on delete cascade,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) on update cascade on delete restrict
);

	CREATE TABLE ventas (
	  id INT AUTO_INCREMENT PRIMARY KEY,
	  moto_id INT unsigned,
	  cliente_id INT unsigned,
	  fecha_venta DATE,
	  precio DECIMAL(10, 2),
	  FOREIGN KEY (moto_id) REFERENCES motos(id) on update cascade ON DELETE CASCADE,
	  FOREIGN KEY (cliente_id) REFERENCES clientes(id) on update cascade ON DELETE RESTRICT
	);

CREATE TABLE moto_imagenes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    moto_id INT UNSIGNED NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (moto_id) REFERENCES motos(id) ON DELETE CASCADE
);
