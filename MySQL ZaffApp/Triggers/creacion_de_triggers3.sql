USE zaffapp;

DELIMITER //
CREATE TRIGGER trg_limpiar_ciudadano_insert
BEFORE INSERT ON ciudadano
FOR EACH ROW
BEGIN
SET NEW.ciud_nombre = TRIM(NEW.ciud_nombre);
SET NEW.ciud_telefono = TRIM(NEW.ciud_telefono);
END; //
DELIMITER ;