
ALTER PROCEDURE sp_generar_campania
	@nombre varchar(50),
	@mensaje varchar(250),
	@fechaInicio DATETIME,
	@fechaFin DATETIME,
    @sector varchar(20),
    @min_sueldo INT,
	@max_sueldo INT,
	@usuario varchar(20)
AS
BEGIN
    SET NOCOUNT ON;  -- Evita mensajes de filas afectadas, mejora rendimiento

	-- Temporal de los clientes
	SELECT *
	INTO #tmp_cliente
	FROM tbl_Cliente
	WHERE Sector = @sector AND Sueldo BETWEEN @min_sueldo AND @max_sueldo

	-- Extrae el id Campaña
	DECLARE @id INT
	SET @id = (SELECT ISNULL(MAX(Codigo),0) + 1 FROM tbl_campania)

	
	-- Arma el detalle de los telefono a la tmp_cliente
	ALTER TABLE #tmp_cliente ADD Telefono varchar(20)
	ALTER TABLE #tmp_cliente ADD Mail varchar(250)

	UPDATE a SET a.Telefono = b.Numero
	FROM #tmp_cliente a, tbl_telefono b
	WHERE a.Cedula = b.Cedula
	AND b.Estado = 'Activo'
	AND b.Principal = 'Si'
	AND b.Tipo = 'Celular'

	UPDATE a SET a.Mail = b.Mail
	FROM #tmp_cliente a, tbl_mail b
	WHERE a.Cedula = b.Cedula
	AND b.Estado = 'Activo'
	AND b.Principal = 'Si'
	AND b.Tipo = 'Personal'

	-- Almacena en las tablas de campaña
	-- Almacena la cabecera
	INSERT INTO tbl_campania (Codigo,Nombre,FechaInicio,FechaFin,Estado,Usuario)
	VALUES (@id,@nombre,@fechaInicio,@fechaFin,1,@usuario)

	-- Almacena el Detalle
	INSERT INTO tbl_campania_detalle (CodigoCampania,Cedula,Nombre,Telefono,Mail,Estado,FechaEnvio) 
	SELECT 
		@id,
		Cedula,
		Nombre,
		Telefono,
		Mail,
		1, -- Estado 1 es Pendiente
		NULL
	FROM #tmp_cliente

END;
GO
