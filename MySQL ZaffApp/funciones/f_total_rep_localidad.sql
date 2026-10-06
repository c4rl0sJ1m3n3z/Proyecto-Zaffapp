USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_total_reportes_localidad(p_localidad VARCHAR(100))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_total INT;
    SELECT COUNT(r.id_reporte) INTO v_total
    FROM reporte r
    JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
    WHERE u.localidad = p_localidad;

    RETURN IFNULL(v_total, 0);
END; //
DELIMITER ;

-- modo de uso 
-- SELECT fn_total_reportes_localidad('Nombre de la localidad') AS reportes_en_"localidad";