USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_total_visualizaciones_reporte_mapa(p_id_reporte INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_total INT;
    SELECT COUNT(*) INTO v_total
    FROM visualizacion 
    WHERE id_reporte = p_id_reporte;

    RETURN IFNULL(v_total, 0);
END; //
DELIMITER ;