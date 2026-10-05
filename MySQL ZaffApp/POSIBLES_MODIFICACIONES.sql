USE zaffapp;

ALTER TABLE `rol`
MODIFY `rol_id` INT AUTO_INCREMENT;

ALTER TABLE `administrador`
MODIFY `tipo_admin` VARCHAR(50) NOT NULL;