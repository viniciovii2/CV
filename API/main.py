import pyodbc
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# Configuración de CORS - permite conexiones desde estas URLs
origins = [
    "http://localhost:8081",
    "http://localhost",
    "http://192.168.6.218:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Conexión SQL Server
conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=192.168.0.48\\desaarrollo;"
    "DATABASE=CV_BDD;"
    "UID=sa;"
    "PWD=Me$$1Ars2oi8;"
)

def get_connection():
    return pyodbc.connect(conn_str)

# 1) Listar Provincias
@app.get("/provincia")
def get_provincias():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_provincia")
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return result

# 2) Listar Cantones por Provincia
@app.get("/canton/{CodigoProvincia}")
def get_cantones(CodigoProvincia: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_canton WHERE CodigoProvincia = ?", CodigoProvincia)
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return result

# 3) Listar Parroquias por Provincia y Cantón
@app.get("/parroquias/{CodigoProvincia}/{CodigoCanton}")
def get_parroquias(CodigoProvincia: str, CodigoCanton: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM tbl_parroquia WHERE CodigoProvincia = ? AND CodigoCanton = ?",
        CodigoProvincia,
        CodigoCanton
    )
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return result

@app.get("/vistaPrevia/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}")
def vista_previa(CodigoProvincia: str, CodigoCanton: str, CodigoParroquia: str, Sueldo: str):
    sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"

    min_sueldo, max_sueldo = sueldo_range(Sueldo)
    
    query = """
        SELECT COUNT(*) as total
        FROM tbl_Cliente
        WHERE Sector = ? AND Sueldo BETWEEN ? AND ?
    """
    print(query)
    print(sector)
    print(min_sueldo)
    print(max_sueldo)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, (sector, min_sueldo, max_sueldo))
        row = cursor.fetchone()
        total = row[0] if row else 0
    
    return {"count": total}

# Función auxiliar global
def sueldo_range(codigo_sueldo):
    if codigo_sueldo == "1":
        return 0, 500
    elif codigo_sueldo == "2":
        return 501, 1000
    elif codigo_sueldo == "3":
        return 1001, 1500
    elif codigo_sueldo == "4":
        return 1501, 1000000
    else:
        return 0, 1000000

# Consulta Campaña Activa  
@app.get("/consultaCampania/{FechaHoy}/{Usuario}")
def consulta_campania(FechaHoy: str, Usuario: str):
    try:
        fecha_obj = datetime.strptime(FechaHoy, "%Y-%m-%d")
        
        query = """
            SELECT Codigo, Nombre, Mensaje
            FROM tbl_campania
            WHERE Usuario = ? 
            AND FechaInicio <= ? 
            AND FechaFin >= ?
        """
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (Usuario, fecha_obj, fecha_obj))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description]
            result = [dict(zip(columns, row)) for row in rows]
            return result
    except Exception as e:
        return {"error": str(e)}
    
    # Consulta Clientes de Campaña
@app.get("/consultaClienteCampania/{Codigo}")
def consulta_campania(Codigo: str):
    try:
        query = """
            SELECT *
            FROM tbl_campania_detalle
            WHERE CodigoCampania = ? 
        """
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (Codigo))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description]
            result = [dict(zip(columns, row)) for row in rows]
            return result
    except Exception as e:
        return {"error": str(e)}

# --- Generar Campaña usando SP ---
@app.post("/generarCampania/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}/{FechaInicio}/{FechaFin}/{NombreCampania}/{Mensaje}/{Usuario}")
def generar_campania(
    CodigoProvincia: str,
    CodigoCanton: str,
    CodigoParroquia: str,
    Sueldo: str,
    FechaInicio: str,
    FechaFin: str,
    NombreCampania: str,
    Mensaje: str,
    Usuario: str
):
    """
    Ejecuta el SP sp_generar_campania para crear una nueva campaña.
    No devuelve datos del SP, solo confirma éxito o error.
    """
    try:
        sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"
        min_sueldo, max_sueldo = sueldo_range(Sueldo)

        # Convertir fechas a datetime
        fecha_inicio_dt = datetime.strptime(FechaInicio, "%Y-%m-%d")
        fecha_fin_dt = datetime.strptime(FechaFin, "%Y-%m-%d")

        print(" Ejecutando SP sp_generar_campania:")
        print(f"  - Nombre: {NombreCampania}")
        print(f"  - Mensaje: {Mensaje}")
        print(f"  - Fechas: {FechaInicio} → {FechaFin}")
        print(f"  - Sector: {sector}")
        print(f"  - Rango sueldo: {min_sueldo}-{max_sueldo}")
        print(f"  - Usuario: {Usuario}")

        with get_connection() as conn:
            cursor = conn.cursor()
            query = "{CALL sp_generar_campania(?, ?, ?, ?, ?, ?, ?, ?)}"
            cursor.execute(
                query, 
                (NombreCampania,Mensaje, fecha_inicio_dt, fecha_fin_dt, sector, min_sueldo, max_sueldo, Usuario)
            )
            conn.commit()

        # Si llegó aquí, todo fue bien
        return {
            "mensaje": "✅ Campaña generada exitosamente.",
            "sector": sector,
            "rango_sueldo": {"min": min_sueldo, "max": max_sueldo},
            "fecha_inicio": FechaInicio,
            "fecha_fin": FechaFin,
            "nombre": NombreCampania,
            "usuario": Usuario
        }

    except Exception as e:
        print(" ERROR en generar_campania:", str(e))
        return {"error": f"Error al generar la campaña: {str(e)}"}

# Consulta Saludo o Despedida aleatorio
@app.get("/consultaSaludo/{Tipo}")
def consulta_saludo(Tipo: str):
    try:
        query = """
            SELECT Descripcion, Tipo
            FROM tbl_mensaje
            WHERE Tipo = ? 
        """
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (Tipo,))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description]
            mensajes = [dict(zip(columns, row)) for row in rows]

            if not mensajes:
                return {"error": f"No se encontraron mensajes de tipo '{Tipo}'"}

            # Elegir uno al azar
            mensaje_aleatorio = random.choice(mensajes)
            return mensaje_aleatorio

    except Exception as e:
        return {"error": str(e)}
    
    # Actualizar estado y fecha de envío de un cliente en una campaña
@app.post("/actualizarEstadoCliente")
def actualizar_estado_cliente(data: dict):
    try:
        codigo_campania = data.get("CodigoCampania")
        cedula = data.get("Cedula")
        nuevo_estado = data.get("Estado", 2)  # 2 = Enviado por defecto

        query = """
            UPDATE tbl_campania_detalle
            SET Estado = ?, FechaEnvio = GETDATE()
            WHERE CodigoCampania = ? AND Cedula = ?
        """

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (nuevo_estado, codigo_campania, cedula))
            conn.commit()

        return {"success": True, "message": "Estado actualizado correctamente"}

    except Exception as e:
        return {"error": str(e)}
    
    # --- Estadísticas de seguimiento de campaña ---
@app.get("/estadisticaCampania/{CodigoCampania}")
def estadistica_campania(CodigoCampania: int):
    """
    Devuelve resumen de clientes gestionados y pendientes
    dentro de una campaña específica.
    """
    try:
        query = """
            SELECT 
                COUNT(*) AS Total,
                SUM(CASE WHEN Estado = 2 THEN 1 ELSE 0 END) AS Gestionados,
                SUM(CASE WHEN Estado <> 2 THEN 1 ELSE 0 END) AS Pendientes
            FROM tbl_campania_detalle
            WHERE CodigoCampania = ?
        """

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (CodigoCampania,))
            row = cursor.fetchone()

            # Si no hay datos, devuelve 0
            total = row[0] if row and row[0] else 0
            gestionados = row[1] if row and row[1] else 0
            pendientes = row[2] if row and row[2] else 0

        return {
            "Total": int(total),
            "Gestionados": int(gestionados),
            "Pendientes": int(pendientes)
        }

    except Exception as e:
        print("❌ Error en /estadisticaCampania:", str(e))
        return {"error": str(e)}
