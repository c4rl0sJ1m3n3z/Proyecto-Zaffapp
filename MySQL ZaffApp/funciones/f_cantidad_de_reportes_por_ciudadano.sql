USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_total_reportes_ciudadano(p_ciud_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM reporte
    WHERE ciud_id = p_ciud_id;

    RETURN total;
END; //
DELIMITER ;