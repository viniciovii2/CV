

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


------- CATALOGO
CREATE TABLE tbl_provincia
(
	Codigo varchar(10),
	Provincia varchar(50)
)

CREATE TABLE tbl_canton
(
	Codigo varchar(10),
	CodigoProvincia varchar(10),
	Canton varchar(50)
)

CREATE TABLE tbl_parroquia
(
	Codigo varchar(10),
	CodigoProvincia varchar(10),
	CodigoCanton varchar(10),
	Parroquia varchar(50)
)

--/////////////////////////////////////////////
CREATE TABLE tbp_estado_campania
(
	Codigo INT,
	Descripcion varchar(20)
)

INSERT INTO tbp_estado_campania VALUES(1,'Activo')
INSERT INTO tbp_estado_campania VALUES(2,'Inactivo')

CREATE TABLE tbl_campania
(
	Codigo INT,
	Nombre varchar(50),
	FechaInicio DATETIME,
	FechaFin DATETIME,
	Estado int,
	Usuario varchar(20)

)

CREATE TABLE tbp_estado_campania_detalle
(
	Codigo INT,
	Descripcion varchar(20)
)

INSERT INTO tbp_estado_campania_detalle VALUES(1,'Enviado')
INSERT INTO tbp_estado_campania_detalle VALUES(2,'Pendiente')

CREATE TABLE tbl_campania_detalle
(
	CodigoCampania INT,
	Cedula varchar(20),
	Nombre varchar(100),
	Telefono varchar(20),
	Mail varchar(250),
	Estado INT,
	FechaEnvio DATETIME
)

--/////////////////////////////////////////////

CREATE TABLE tbl_mensaje
(
	Descripcion varchar(100),
	Tipo varchar(20)
)

INSERT INTO tbl_mensaje VALUES('Hola {nombre}, espero que estes teniendo un excelente dia.','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Buenas {nombre}!','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Hola {nombre}! Un gusto saludarte.','Saludo')
INSERT INTO tbl_mensaje VALUES('Estimado/a {nombre}, te enviamos un cordial saludo.','Saludo')
INSERT INTO tbl_mensaje VALUES('Buen dia {nombre}, espero que todo marche bien contigo.','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Qué gusto saludarte {nombre}!','Saludo')
INSERT INTO tbl_mensaje VALUES('Hola {nombre}, deseamos que te encuentres muy bien.','Saludo')
INSERT INTO tbl_mensaje VALUES('{nombre}, ¡Buenas ! Te saludamos con aprecio.','Saludo')
INSERT INTO tbl_mensaje VALUES('Estimado/a {nombre}, gracias por tomarte un momento para leer este mensaje.','Saludo')
INSERT INTO tbl_mensaje VALUES('Hola {nombre}, un placer poder comunicarme contigo.','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Muy buenas {nombre}!','Saludo')
INSERT INTO tbl_mensaje VALUES('{nombre}, te saludamos cordialmente desde nuestro equipo.','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Hola {nombre}! Esperamos que tu semana vaya excelente.','Saludo')
INSERT INTO tbl_mensaje VALUES('Buenas tardes {nombre}, confiamos en que todo este marchando bien.','Saludo')
INSERT INTO tbl_mensaje VALUES('Hola {nombre}, te extendemos un afectuoso saludo.','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Saludos {nombre}! Esperamos que estes disfrutando tu dia.','Saludo')
INSERT INTO tbl_mensaje VALUES('{nombre}, muy buenas, gracias por tu tiempo.','Saludo')
INSERT INTO tbl_mensaje VALUES('¡Hola {nombre}! Queriamos tomarnos un momento para saludarte.','Saludo')
INSERT INTO tbl_mensaje VALUES('Hola {nombre}, deseamos que tengas un gran dia.','Saludo')
INSERT INTO tbl_mensaje VALUES('Estimado/a {nombre}, esperamos que te encuentres con buena energia hoy.','Saludo')

INSERT INTO tbl_mensaje VALUES('¡Que tengas un excelente dia!','Despedida')
INSERT INTO tbl_mensaje VALUES('Agradecemos tu atencion, ¡hasta pronto!','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Saludos cordiales y gracias por tu tiempo!','Despedida')
INSERT INTO tbl_mensaje VALUES('Esperamos tu respuesta, quedamos atentos','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Un abrazo y que todo marche bien!','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Gracias por leernos, que tengas una gran semana!','Despedida')
INSERT INTO tbl_mensaje VALUES('Quedamos pendientes ante cualquier consulta.','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Hasta luego y exito en tus actividades!','Despedida')
INSERT INTO tbl_mensaje VALUES('Gracias por tu tiempo, ¡seguimos en contacto!','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Nos alegra poder comunicarnos contigo!','Despedida')
INSERT INTO tbl_mensaje VALUES('Que tengas un día lleno de buenas noticias.','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Muchas gracias y que todo te vaya excelente!','Despedida')
INSERT INTO tbl_mensaje VALUES('Seguimos a tus ordenes para cualquier duda.','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Te deseamos un gran resto de dia!','Despedida')
INSERT INTO tbl_mensaje VALUES('Con gusto estaremos atentos a tu respuesta.','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Hasta pronto y que todo salga muy bien!','Despedida')
INSERT INTO tbl_mensaje VALUES('Agradecemos tu atencion, estamos para servirte.','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Nos despedimos deseandote lo mejor!','Despedida')
INSERT INTO tbl_mensaje VALUES('¡Cuidate mucho y que tengas un buen dia!','Despedida')
INSERT INTO tbl_mensaje VALUES('Gracias por tu atencion, ¡seguimos en contacto!','Despedida')