USE zaffapp;

DELIMITER //
CREATE TRIGGER before_ciudadano_insert
BEFORE INSERT ON ciudadano
FOR EACH ROW
BEGIN
    DECLARE rol_defecto INT;
    
    IF NEW.rol_id IS NULL THEN
    SELECT rol_id INTO rol_defecto FROM rol WHERE nombre = 'ciudadano' LIMIT 1;
    END IF;
END; //
DELIMITER ;