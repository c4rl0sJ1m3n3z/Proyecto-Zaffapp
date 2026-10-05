USE zaffapp;

DELIMITER //
CREATE TRIGGER tgr_validar_correo_usuario
BEFORE INSERT ON usuario
FOR EACH ROW
BEGIN
    IF NEW.correo NOT LIKE '%@%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo electrónico no es válido.';
    END IF;
END; //
DELIMITER ;