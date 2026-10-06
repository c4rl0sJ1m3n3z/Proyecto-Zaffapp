USE zaffapp;


DELIMITER //
CREATE FUNCTION fn_dias_desde_creacion (p_id_reporte INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_dias INT;
    SELECT DATEDIFF(NOW(), r.fecha_hora) INTO v_dias
    FROM reporte 
    WHERE id_reporte = p_id_reporte;

    RETURN IFNULL(v_dias, 0);
END; //
DELIMITER ;