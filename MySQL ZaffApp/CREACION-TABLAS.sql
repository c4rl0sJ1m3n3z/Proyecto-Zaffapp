USE zaffapp;

-- Primero creamos la tabla rol
CREATE TABLE `rol` (
    `rol_id` INT NOT NULL AUTO_INCREMENT,
    `nombre_rol` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`rol_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Después creamos ciudadano
CREATE TABLE `ciudadano` (
    `ciud_id` INT NOT NULL AUTO_INCREMENT,
    `ciud_nombre` VARCHAR(100) NOT NULL,
    `ciud_telefono` VARCHAR(20) NOT NULL,
    `ciud_ubicacion` VARCHAR(150) NULL,
    `rol_id` INT,
    PRIMARY KEY (`ciud_id`),
    CONSTRAINT `ciudadano_rol_id_foreign`
    FOREIGN KEY (`rol_id`) REFERENCES `rol`(`rol_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `categoria`(
    `id_categoria` INT AUTO_INCREMENT,
    `nombre_categoria` VARCHAR(80) NOT NULL UNIQUE,
    PRIMARY KEY(`id_categoria`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `estado`(
    `id_estado` INT AUTO_INCREMENT,
    `nombre_estado` VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (`id_estado`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ubicacion` (
    `id_ubicacion` INT AUTO_INCREMENT,
    `localidad` VARCHAR(100q) NOT NULL,
    `calle` VARCHAR (150) NOT NULL,
    `barrio` VARCHAR (100) NOT NULL,
    PRIMARY KEY (`id_ubicacion`)

)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reporte` (
    `id_reporte` INT AUTO_INCREMENT,
    `ciud_id` INT NOT NULL,
    `id_estado` INT NOT NULL,
    `id_ubicacion` INT NULL,
    `id_categoria` INT NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_reporte`),
    CONSTRAINT `reporte_ciud_id_foreign`
    FOREIGN KEY (`ciud_id`) REFERENCES `ciudadano`(`ciud_id`),
    CONSTRAINT `reporte_id_estado_foreign`
    FOREIGN KEY (`id_estado`) REFERENCES `estado`(`id_estado`),
    CONSTRAINT `reporte_id_ubicacion_foreign`
    FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion`(`id_ubicacion`),
    CONSTRAINT `reporte_id_categoria_foreign`
    FOREIGN KEY (`id_categoria`) REFERENCES `categoria`(`id_categoria`)
) 
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `evidencia`(
    `id_evidencia` INT AUTO_INCREMENT,
    `tipo` VARCHAR(30),
    `id_reporte` INT,
    `fecha_carga` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ruta_archivo` VARCHAR(500),
    PRIMARY KEY (`id_evidencia`),
    CONSTRAINT `evidencia_id_reporte_foreign`
    FOREIGN KEY (`id_reporte`) REFERENCES `reporte`(`id_reporte`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permiso` (
    `permiso_id` INT AUTO_INCREMENT,
    `nombre_permiso` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`permiso_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ROL_PERMISO` (
    `rol_id` INT,
    `permiso_id` INT,
    PRIMARY KEY (`rol_id`,`permiso_id`),
    CONSTRAINT `ROL_PERMISO_rol_id_foreign`
    FOREIGN KEY (`rol_id`) REFERENCES `rol` (`rol_id`),
    CONSTRAINT `ROL_PERMISO_permiso_id_foreign`
    FOREIGN KEY (`permiso_id`) REFERENCES `permiso` (`permiso_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `administrador` (
    `admin_id` INT AUTO_INCREMENT ,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo_admin` VARCHAR(50),
    `rol_id` INT,
    `id_usuario` INT,
     PRIMARY KEY (`admin_id`),
     CONSTRAINT `administrador_rol_id_foreign`
     FOREIGN KEY (`rol_id`) REFERENCES `rol`(`rol_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario` (
    `id_usuario` INT NOT NULL AUTO_INCREMENT,
    `admin_id` INT,
    `correo` VARCHAR(150) NOT NULL UNIQUE,
    `estado` BOOLEAN DEFAULT TRUE,
    `nombre` VARCHAR(100),

    PRIMARY KEY (`id_usuario`),
    CONSTRAINT `usuario_admin_id_foreign`
    FOREIGN KEY (`admin_id`)
        REFERENCES `administrador`(`admin_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historial_estado` (
    `id_historial` INT AUTO_INCREMENT,
    `id_estado` INT,
    `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `id_reporte` INT,
    `admin_id` INT,
    PRIMARY KEY (`id_historial`),
    CONSTRAINT `historial_estado_id_estado_foreign`
    FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
    CONSTRAINT `historial_estado_admin_id_foreign`
    FOREIGN KEY (`admin_id`) REFERENCES  `administrador`(`admin_id`),
    CONSTRAINT `historial_estado_id_reporte_foreign` 
    FOREIGN KEY (`id_reporte`) REFERENCES `reporte` (`id_reporte`)
    )
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mapa` (
    `id_mapa` INT AUTO_INCREMENT,
    `nombre_mapa` VARCHAR(100),
    `Vista_previa` VARCHAR (500),
    PRIMARY KEY (`id_mapa`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `visualizacion` (
    `id_visual` INT AUTO_INCREMENT,
    `id_usuario` INT,
    `id_reporte` INT,
    `id_mapa` INT,
    `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_visual`),
    CONSTRAINT `visualizacion_id_usurio_foreign`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`),
    CONSTRAINT `visulizacion_id_reporte_foreign`
    FOREIGN KEY (`id_reporte`) REFERENCES `reporte`(`id_reporte`),
    CONSTRAINT `visualizacion_id_mapa_foreign`
    FOREIGN KEY (`id_mapa`) REFERENCES `mapa` (`id_mapa`)
    )
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `REPORTE_ADMIN`(
    `id_reporte` INT,
    `admin_id` INT,
    PRIMARY KEY (`id_reporte`,`admin_id`),
    CONSTRAINT `REPORTE_ADMIN_id_reporte_foreign`
    FOREIGN KEY (`id_reporte`) REFERENCES `reporte`(`id_reporte`),
    CONSTRAINT `REPORTE_ADMIN_admin_id_foreign`
    FOREIGN KEY (`admin_id`) REFERENCES `administrador`(`admin_id`)
)
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ACTIV_ADMIN` (
    `id_visual` INT,
    `admin_id` INT,
    PRIMARY KEY(`id_visual`,`admin_id`),
    CONSTRAINT `ACTIV_ADMIN_id_visual_foreign`
    FOREIGN KEY(`id_visual`) REFERENCES `visualizacion`(`id_visual`),
    CONSTRAINT `ACTIV_ADMIN_admin_id_foreign`
    FOREIGN KEY (`admin_id`) REFERENCES `administrador`(`admin_id`)
 )
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
