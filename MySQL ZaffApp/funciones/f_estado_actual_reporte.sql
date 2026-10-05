USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_obtener_estado_reporte(p_id_reporte INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
DECLARE v_nombre_estado VARCHAR(50);

    SELECT e.nombre_estado INTO v_nombre_estado
    FROM reporte r
    JOIN estado e ON r.id_estado = e.id_estado
    WHERE r.id_reporte = p_id_reporte;

    RETURN v_nombre_estado;
END; //
DELIMITER ;