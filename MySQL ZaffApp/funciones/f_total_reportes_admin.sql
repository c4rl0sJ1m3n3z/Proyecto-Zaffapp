USE zaffapp;

DELIMITER //
CREATE FUNCTION fn_total_reportes_admin(p_admin_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_total INT;
    
    SELECT COUNT(*) INTO v_total
    FROM REPORTE_ADMIN
    WHERE admin_id = p_admin_id;
    
    RETURN IFNULL(v_total, 0);
END; //
DELIMITER ;

-- modo de uso
-- SELECT admin_id, nombre, fn_total_reportes_admin(admin_id) AS cantidad_asignada
-- FROM administrador;