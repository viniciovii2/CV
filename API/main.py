import os
import random
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from psycopg2.extras import RealDictCursor

app = FastAPI()

# Configuración de CORS - Permitir todo para pruebas iniciales
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Conexión PostgreSQL (Supabase)
# REEMPLAZA 'TU_PASSWORD' con la que acabas de crear
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:12369874Vc$284655@db.fvkzbpobspnrvesmpocy.supabase.co:5432/postgres")

def get_connection():
    # RealDictCursor devuelve los resultados como diccionarios automáticamente
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

# 1) Listar Provincias
@app.get("/provincia")
def get_provincias():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM tbl_provincia")
                return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}

# 2) Listar Cantones por Provincia
@app.get("/canton/{CodigoProvincia}")
def get_cantones(CodigoProvincia: str):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM tbl_canton WHERE CodigoProvincia = %s", (CodigoProvincia,))
                return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}

# 3) Listar Parroquias
@app.get("/parroquias/{CodigoProvincia}/{CodigoCanton}")
def get_parroquias(CodigoProvincia: str, CodigoCanton: str):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM tbl_parroquia WHERE CodigoProvincia = %s AND CodigoCanton = %s",
                    (CodigoProvincia, CodigoCanton)
                )
                return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}

# 4) Vista Previa
@app.get("/vistaPrevia/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}/{Profesion}")
def vista_previa(CodigoProvincia: str, CodigoCanton: str, CodigoParroquia: str, Sueldo: str, Profesion: str):
    try:
        sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"
        min_sueldo, max_sueldo = sueldo_range(Sueldo)
        prof = None if Profesion in ("", "NULL", "null", None) else Profesion

        query = "SELECT COUNT(*) as total FROM tbl_Cliente WHERE Sector = %s AND Sueldo BETWEEN %s AND %s"
        params = [sector, min_sueldo, max_sueldo]

        if prof:
            query += " AND Profesion = %s"
            params.append(prof)

        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                row = cursor.fetchone()
                return {"count": row['total'] if row else 0}
    except Exception as e:
        return {"error": str(e)}

# 5) Generar Campaña usando Función (SP)
@app.post("/generarCampania/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}/{FechaInicio}/{FechaFin}/{NombreCampania}/{Mensaje}/{Usuario}")
def generar_campania(CodigoProvincia: str, CodigoCanton: str, CodigoParroquia: str, Sueldo: str, 
                     FechaInicio: str, FechaFin: str, NombreCampania: str, Mensaje: str, Usuario: str):
    try:
        sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"
        min_sueldo, max_sueldo = sueldo_range(Sueldo)

        with get_connection() as conn:
            with conn.cursor() as cursor:
                # En Postgres usamos SELECT para ejecutar la función
                query = "SELECT sp_generar_campania(%s, %s, %s, %s, %s, %s, %s, %s)"
                params = (NombreCampania, Mensaje, FechaInicio, FechaFin, sector, min_sueldo, max_sueldo, Usuario)
                cursor.execute(query, params)
                conn.commit()
        return {"mensaje": "✅ Campaña generada exitosamente."}
    except Exception as e:
        return {"error": str(e)}

# 6) Consulta Saludo Aleatorio
@app.get("/consultaSaludo/{Tipo}")
def consulta_saludo(Tipo: str):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT descripcion, tipo FROM tbl_mensaje WHERE tipo = %s", (Tipo,))
                mensajes = cursor.fetchall()
                if not mensajes:
                    return {"error": f"No se encontraron mensajes de tipo '{Tipo}'"}
                return random.choice(mensajes)
    except Exception as e:
        return {"error": str(e)}

# 7) Actualizar Estado Cliente (Usando NOW())
@app.post("/actualizarEstadoCliente")
def actualizar_estado_cliente(data: dict):
    try:
        codigo_campania = data.get("CodigoCampania")
        cedula = data.get("Cedula")
        nuevo_estado = data.get("Estado", 2)

        query = """
            UPDATE tbl_campania_detalle
            SET Estado = %s, FechaEnvio = NOW()
            WHERE CodigoCampania = %s AND Cedula = %s
        """
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (nuevo_estado, codigo_campania, cedula))
                conn.commit()
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}

# 8) Historial de Campañas (Usando NOW())
@app.get("/historialCampania/{Filtro}/{Usuario}")
def historial_campania(Filtro: str, Usuario: str):
    try:
        hoy = datetime.now().date()
        fecha_desde = hoy - timedelta(days=int(Filtro)) if Filtro.isdigit() else datetime(2000, 1, 1).date()

        query = """
            SELECT 
                c.Codigo, c.Nombre, c.FechaInicio, c.FechaFin,
                COUNT(d.Cedula) AS Total,
                SUM(CASE WHEN d.Estado = 2 THEN 1 ELSE 0 END) AS Enviados,
                SUM(CASE WHEN d.Estado = 1 THEN 1 ELSE 0 END) AS Pendientes,
                CASE WHEN c.FechaFin < NOW() THEN 'Finalizada' ELSE 'Activa' END AS Estado
            FROM tbl_campania c
            LEFT JOIN tbl_campania_detalle d ON d.CodigoCampania = c.Codigo
            WHERE c.Usuario = %s AND c.FechaInicio >= %s
            GROUP BY c.Codigo, c.Nombre, c.FechaInicio, c.FechaFin
            ORDER BY c.FechaInicio DESC
        """
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (Usuario, fecha_desde))
                return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}

# Función auxiliar de sueldos
def sueldo_range(codigo_sueldo):
    ranges = {"1": (0, 500), "2": (501, 1000), "3": (1001, 1500), "4": (1501, 9999999)}
    return ranges.get(codigo_sueldo, (0, 9999999))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# import pyodbc
# import random
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from datetime import datetime, timedelta


# app = FastAPI()

# # Configuración de CORS - permite conexiones desde estas URLs
# origins = [
#     "http://localhost:8081",
#     "http://localhost",
#     "http://192.168.6.218:8081",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # 🔹 Conexión SQL Server
# conn_str = (
#     "DRIVER={ODBC Driver 17 for SQL Server};"
#     "SERVER=192.168.0.48\\desaarrollo;"
#     "DATABASE=CV_BDD;"
#     "UID=sa;"
#     "PWD=Me$$1Ars2oi8;"
# )

# def get_connection():
#     return pyodbc.connect(conn_str)

# # 1) Listar Provincias
# @app.get("/provincia")
# def get_provincias():
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM tbl_provincia")
#     rows = cursor.fetchall()
#     columns = [column[0] for column in cursor.description]
#     result = [dict(zip(columns, row)) for row in rows]
#     conn.close()
#     return result

# # 2) Listar Cantones por Provincia
# @app.get("/canton/{CodigoProvincia}")
# def get_cantones(CodigoProvincia: str):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM tbl_canton WHERE CodigoProvincia = ?", CodigoProvincia)
#     rows = cursor.fetchall()
#     columns = [column[0] for column in cursor.description]
#     result = [dict(zip(columns, row)) for row in rows]
#     conn.close()
#     return result

# # 3) Listar Parroquias por Provincia y Cantón
# @app.get("/parroquias/{CodigoProvincia}/{CodigoCanton}")
# def get_parroquias(CodigoProvincia: str, CodigoCanton: str):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT * FROM tbl_parroquia WHERE CodigoProvincia = ? AND CodigoCanton = ?",
#         CodigoProvincia,
#         CodigoCanton
#     )
#     rows = cursor.fetchall()
#     columns = [column[0] for column in cursor.description]
#     result = [dict(zip(columns, row)) for row in rows]
#     conn.close()
#     return result

# @app.get("/vistaPrevia/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}/{Profesion}")
# def vista_previa(CodigoProvincia: str, CodigoCanton: str, CodigoParroquia: str, Sueldo: str, Profesion: str):
#     sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"

#     # Convertir sueldo a rango
#     min_sueldo, max_sueldo = sueldo_range(Sueldo)

#     # Profesión: si viene '' entonces no filtrar
#     prof = None if Profesion in ("", "NULL", None) else Profesion

#     # SQL dinámico
#     query = """
#         SELECT COUNT(*) as total
#         FROM tbl_Cliente
#         WHERE Sector = ?
#           AND Sueldo BETWEEN ? AND ?
#     """

#     params = [sector, min_sueldo, max_sueldo]

#     if prof:
#         query += " AND Profesion = ?"
#         params.append(prof)

#     with get_connection() as conn:
#         cursor = conn.cursor()
#         cursor.execute(query, params)
#         row = cursor.fetchone()
#         total = row[0] if row else 0

#     return {"count": total}


# # Función auxiliar global
# def sueldo_range(codigo_sueldo):
#     if codigo_sueldo == "1":
#         return 0, 500
#     elif codigo_sueldo == "2":
#         return 501, 1000
#     elif codigo_sueldo == "3":
#         return 1001, 1500
#     elif codigo_sueldo == "4":
#         return 1501, 1000000
#     else:
#         return 0, 1000000

# # Consulta Campaña Activa  
# @app.get("/consultaCampania/{FechaHoy}/{Usuario}")
# def consulta_campania(FechaHoy: str, Usuario: str):
#     try:
#         fecha_obj = datetime.strptime(FechaHoy, "%Y-%m-%d")
        
#         query = """
#             SELECT Codigo, Nombre, Mensaje
#             FROM tbl_campania
#             WHERE Usuario = ? 
#             AND FechaInicio <= ? 
#             AND FechaFin >= ?
#         """
#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query, (Usuario, fecha_obj, fecha_obj))
#             rows = cursor.fetchall()
#             columns = [column[0] for column in cursor.description]
#             result = [dict(zip(columns, row)) for row in rows]
#             return result
#     except Exception as e:
#         return {"error": str(e)}
    
#     # Consulta Clientes de Campaña
# @app.get("/consultaClienteCampania/{Codigo}")
# def consulta_cliente_campania(Codigo: str):
#     try:
#         query = """
#             SELECT *
#             FROM tbl_campania_detalle
#             WHERE CodigoCampania = ? 
#         """
#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query, (Codigo))
#             rows = cursor.fetchall()
#             columns = [column[0] for column in cursor.description]
#             result = [dict(zip(columns, row)) for row in rows]
#             return result
#     except Exception as e:
#         return {"error": str(e)}

# # --- Generar Campaña usando SP ---
# @app.post("/generarCampania/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}/{FechaInicio}/{FechaFin}/{NombreCampania}/{Mensaje}/{Usuario}")
# def generar_campania(
#     CodigoProvincia: str,
#     CodigoCanton: str,
#     CodigoParroquia: str,
#     Sueldo: str,
#     FechaInicio: str,
#     FechaFin: str,
#     NombreCampania: str,
#     Mensaje: str,
#     Usuario: str
# ):
#     """
#     Ejecuta el SP sp_generar_campania para crear una nueva campaña.
#     No devuelve datos del SP, solo confirma éxito o error.
#     """
#     try:
#         sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"
#         min_sueldo, max_sueldo = sueldo_range(Sueldo)

#         # Convertir fechas a datetime
#         fecha_inicio_dt = datetime.strptime(FechaInicio, "%Y-%m-%d")
#         fecha_fin_dt = datetime.strptime(FechaFin, "%Y-%m-%d")

#         print(" Ejecutando SP sp_generar_campania:")
#         print(f"  - Nombre: {NombreCampania}")
#         print(f"  - Mensaje: {Mensaje}")
#         print(f"  - Fechas: {FechaInicio} → {FechaFin}")
#         print(f"  - Sector: {sector}")
#         print(f"  - Rango sueldo: {min_sueldo}-{max_sueldo}")
#         print(f"  - Usuario: {Usuario}")

#         with get_connection() as conn:
#             cursor = conn.cursor()
#             query = "{CALL sp_generar_campania(?, ?, ?, ?, ?, ?, ?, ?)}"
#             cursor.execute(
#                 query, 
#                 (NombreCampania,Mensaje, fecha_inicio_dt, fecha_fin_dt, sector, min_sueldo, max_sueldo, Usuario)
#             )
#             conn.commit()

#         # Si llegó aquí, todo fue bien
#         return {
#             "mensaje": "✅ Campaña generada exitosamente.",
#             "sector": sector,
#             "rango_sueldo": {"min": min_sueldo, "max": max_sueldo},
#             "fecha_inicio": FechaInicio,
#             "fecha_fin": FechaFin,
#             "nombre": NombreCampania,
#             "usuario": Usuario
#         }

#     except Exception as e:
#         print(" ERROR en generar_campania:", str(e))
#         return {"error": f"Error al generar la campaña: {str(e)}"}

# # Consulta Saludo o Despedida aleatorio
# @app.get("/consultaSaludo/{Tipo}")
# def consulta_saludo(Tipo: str):
#     try:
#         query = """
#             SELECT Descripcion, Tipo
#             FROM tbl_mensaje
#             WHERE Tipo = ? 
#         """
#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query, (Tipo,))
#             rows = cursor.fetchall()
#             columns = [column[0] for column in cursor.description]
#             mensajes = [dict(zip(columns, row)) for row in rows]

#             if not mensajes:
#                 return {"error": f"No se encontraron mensajes de tipo '{Tipo}'"}

#             # Elegir uno al azar
#             mensaje_aleatorio = random.choice(mensajes)
#             return mensaje_aleatorio

#     except Exception as e:
#         return {"error": str(e)}
    
#     # Actualizar estado y fecha de envío de un cliente en una campaña
# @app.post("/actualizarEstadoCliente")
# def actualizar_estado_cliente(data: dict):
#     try:
#         codigo_campania = data.get("CodigoCampania")
#         cedula = data.get("Cedula")
#         nuevo_estado = data.get("Estado", 2)  # 2 = Enviado por defecto

#         query = """
#             UPDATE tbl_campania_detalle
#             SET Estado = ?, FechaEnvio = GETDATE()
#             WHERE CodigoCampania = ? AND Cedula = ?
#         """

#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query, (nuevo_estado, codigo_campania, cedula))
#             conn.commit()

#         return {"success": True, "message": "Estado actualizado correctamente"}

#     except Exception as e:
#         return {"error": str(e)}
    
#     # --- Estadísticas de seguimiento de campaña ---
# @app.get("/estadisticaCampania/{CodigoCampania}")
# def estadistica_campania(CodigoCampania: int):
#     """
#     Devuelve resumen de clientes gestionados y pendientes
#     dentro de una campaña específica.
#     """
#     try:
#         query = """
#             SELECT 
#                 COUNT(*) AS Total,
#                 SUM(CASE WHEN Estado = 2 THEN 1 ELSE 0 END) AS Gestionados,
#                 SUM(CASE WHEN Estado <> 2 THEN 1 ELSE 0 END) AS Pendientes
#             FROM tbl_campania_detalle
#             WHERE CodigoCampania = ?
#         """

#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query, (CodigoCampania,))
#             row = cursor.fetchone()

#             # Si no hay datos, devuelve 0
#             total = row[0] if row and row[0] else 0
#             gestionados = row[1] if row and row[1] else 0
#             pendientes = row[2] if row and row[2] else 0

#         return {
#             "Total": int(total),
#             "Gestionados": int(gestionados),
#             "Pendientes": int(pendientes)
#         }

#     except Exception as e:
#         print("❌ Error en /estadisticaCampania:", str(e))
#         return {"error": str(e)}

# #  --- Listar Profesiones ---
# @app.get("/profesion")
# def get_profesion():
#     try:
#         query = "SELECT * FROM tbl_profesion"

#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query)
#             rows = cursor.fetchall()
#             columns = [column[0] for column in cursor.description]
#             result = [dict(zip(columns, row)) for row in rows]

#         return result

#     except Exception as e:
#         return {"error": str(e)}

# # --- Historial de Campañas ---
# @app.get("/historialCampania/{Filtro}/{Usuario}")
# def historial_campania(Filtro: str, Usuario: str):
#     """
#     Devuelve el historial de campañas del usuario:
#     - Ultimos 30 días
#     - Últimos 90 días
#     - Todo el historial
#     """
#     try:
#         # Determinar rango de fechas
#         hoy = datetime.now().date()

#         if Filtro == "30":
#             fecha_desde = hoy.replace() - timedelta(days=30)
#         elif Filtro == "90":
#             fecha_desde = hoy.replace() - timedelta(days=90)
#         else:
#             fecha_desde = datetime(2000, 1, 1).date()   # historial total

#         query = """
#             SELECT 
#                 c.Codigo,
#                 c.Nombre,
#                 c.FechaInicio,
#                 c.FechaFin,
#                 COUNT(d.Cedula) AS Total,
#                 SUM(CASE WHEN d.Estado = 2 THEN 1 ELSE 0 END) AS Enviados,
#                 SUM(CASE WHEN d.Estado = 1 THEN 1 ELSE 0 END) AS Pendientes,
#                 CASE 
#                     WHEN c.FechaFin < GETDATE() THEN 'Finalizada'
#                     ELSE 'Activa'
#                 END AS Estado
#             FROM tbl_campania c
#             LEFT JOIN tbl_campania_detalle d ON d.CodigoCampania = c.Codigo
#             WHERE c.Usuario = ?
#               AND c.FechaInicio >= ?
#             GROUP BY 
#                 c.Codigo, c.Nombre, c.FechaInicio, c.FechaFin
#             ORDER BY c.FechaInicio DESC
#         """

#         with get_connection() as conn:
#             cursor = conn.cursor()
#             cursor.execute(query, (Usuario, fecha_desde))
#             rows = cursor.fetchall()
#             columns = [col[0] for col in cursor.description]

#             result = []
#             for row in rows:
#                 item = dict(zip(columns, row))

#                 # Convertir fechas a string
#                 if isinstance(item["FechaInicio"], datetime):
#                     item["FechaInicio"] = item["FechaInicio"].strftime("%Y-%m-%d")
#                 if isinstance(item["FechaFin"], datetime):
#                     item["FechaFin"] = item["FechaFin"].strftime("%Y-%m-%d")

#                 result.append(item)

#         return result

#     except Exception as e:
#         print("❌ Error en historialCampania:", str(e))
#         return {"error": str(e)}

# @app.get("/historialDetalleCampania/{CodigoCampania}")
# def detalle_campania(CodigoCampania: int):
#     """
#     Devuelve información completa de una campaña:
#     - Datos generales
#     - Totales (enviados/pendientes)
#     - Lista de clientes
#     """
#     try:
#         with get_connection() as conn:
#             cursor = conn.cursor()

#             # 1) Datos de la campaña
#             cursor.execute("""
#                 SELECT Codigo, Nombre, Mensaje, FechaInicio, FechaFin, Usuario
#                 FROM tbl_campania
#                 WHERE Codigo = ?
#             """, (CodigoCampania,))
#             row = cursor.fetchone()

#             if not row:
#                 return {"error": "Campaña no encontrada"}

#             columns = [col[0] for col in cursor.description]
#             campania = dict(zip(columns, row))

#             # Convertir fechas
#             for key in ["FechaInicio", "FechaFin"]:
#                 if isinstance(campania[key], datetime):
#                     campania[key] = campania[key].strftime("%Y-%m-%d")

#             # 2) Totales
#             cursor.execute("""
#                 SELECT 
#                     COUNT(*) AS Total,
#                     SUM(CASE WHEN Estado = 2 THEN 1 ELSE 0 END) AS Enviados,
#                     SUM(CASE WHEN Estado <> 2 THEN 1 ELSE 0 END) AS Pendientes
#                 FROM tbl_campania_detalle
#                 WHERE CodigoCampania = ?
#             """, (CodigoCampania,))

#             row = cursor.fetchone()
#             total = row[0] or 0
#             enviados = row[1] or 0
#             pendientes = row[2] or 0

#             # 3) Lista de clientes
#             cursor.execute("""
#                 SELECT Cedula, Nombre, Telefono, Mail, Estado, FechaEnvio
#                 FROM tbl_campania_detalle
#                 WHERE CodigoCampania = ?
#                 ORDER BY Nombre
#             """, (CodigoCampania,))

#             rows = cursor.fetchall()
#             columns = [col[0] for col in cursor.description]
#             clientes = [dict(zip(columns, r)) for r in rows]

#             # Convertir fechas
#             for c in clientes:
#                 if isinstance(c["FechaEnvio"], datetime):
#                     c["FechaEnvio"] = c["FechaEnvio"].strftime("%Y-%m-%d %H:%M")

#         return {
#             "Campania": campania,
#             "Totales": {
#                 "Total": total,
#                 "Enviados": enviados,
#                 "Pendientes": pendientes,
#                 "Porcentaje": round((enviados / total * 100), 2) if total > 0 else 0
#             },
#             "Clientes": clientes
#         }

#     except Exception as e:
#         print("❌ Error en detalleCampania:", str(e))
#         return {"error": str(e)}
