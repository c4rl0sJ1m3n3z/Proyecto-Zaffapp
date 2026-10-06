USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_rol_tiene_permiso(p_rol_id INT, p_nombre_permiso VARCHAR(100))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_existe INT DEFAULT 0;

    SELECT COUNT(*) INTO v_existe
    FROM ROL_PERMISO rp
    JOIN permiso p ON rp.permiso_id = p.permiso_id
    WHERE rp.rol_id = p_rol_id AND p.nombre_permiso = p_nombre_permiso;

    RETURN (v_existe > 0);
END; //
DELIMITER ;

-- modo de uso 
-- SELECT fn_rol_tiene_permiso(1, 'Eliminar Reportes') AS tiene_permiso;