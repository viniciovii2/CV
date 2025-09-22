

CREATE TABLE tbl_Cliente
(
	Cedula varchar(20),
	Nombre varchar(100),
	Direccion varchar(250),
	Sector varchar(20),
	Sueldo DECIMAL(10,2),
	Cargo varchar(100),
	RucEmpresa varchar(20),
	SucursalEmpresa varchar(20),
	TipoEmpresa varchar(100),
	Empresa varchar(100),
	TelefonoEmpresa varchar(20),
	DireccionEmpresa varchar(250),
	FechaEmpresa varchar(20),
	FechaCreado varchar(20)
)
--select * from tbl_Cliente

CREATE TABLE tbl_telefono
(
	Cedula varchar(20),
	Numero varchar(20),
	Tipo varchar(20),
	Estado varchar(20),
	Principal varchar(20)
)
--select * from tbl_telefono

CREATE TABLE tbl_mail
(
	Cedula varchar(20),
	Mail varchar(250),
	Tipo varchar(20),
	Estado varchar(20),
	Principal varchar(20)
)
--select * from tbl_mail


