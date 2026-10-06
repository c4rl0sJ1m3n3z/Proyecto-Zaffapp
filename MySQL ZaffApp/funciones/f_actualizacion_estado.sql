USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_ultima_actualizacion_reporte(p_id_reporte INT)
RETURNS TIMESTAMP
DETERMINISTIC
BEGIN
    DECLARE v_ultima_fecha TIMESTAMP;
    SELECT MAX(fecha_hora) INTO v_ultima_fecha
    FROM historial_estado
    WHERE id_reporte = p_id_reporte;
    RETURN v_ultima_fecha;
END; //
DELIMITER ;

-- modo de uso 
-- SELECT id_reporte, fn_ultima_actualizacion_reporte("id_reporte") AS ultima_actualizacion
-- FROM reporte;