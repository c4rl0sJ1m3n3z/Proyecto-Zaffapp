USE zaffapp;

DELIMITER //
CREATE TRIGGER after_reporte_update
AFTER UPDATE ON reporte
FOR EACH ROW
BEGIN
    IF OLD.id_estado != NEW.id_estado THEN
        INSERT INTO historial_estado (id_estado, id_reporte, fecha_hora)
        VALUES (NEW.id_estado, NEW.id_reporte, CURRENT_TIMESTAMP);
    END IF;
END; //
DELIMITER ;