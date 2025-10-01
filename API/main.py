from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pyodbc

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

@app.get("/vistaprevia/{CodigoProvincia}/{CodigoCanton}/{CodigoParroquia}/{Sueldo}")
def vista_previa(CodigoProvincia: str, CodigoCanton: str, CodigoParroquia: str, Sueldo: str):
    sector = f"{CodigoProvincia}{CodigoCanton}{CodigoParroquia}"

    # Mapear el código de sueldo a rango
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

