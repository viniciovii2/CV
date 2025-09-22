from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pyodbc

app = FastAPI()

# Configuración de CORS - permite conexiones desde estas URLs
origins = [
    "http://localhost:8081",
    "http://localhost",
    "http://192.168.6.218:8081",
    # agrega aquí otros orígenes que uses, ej: app en otro equipo o puerto
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # permite estos orígenes
    allow_credentials=True,
    allow_methods=["*"],            # permite todos los métodos HTTP (GET, POST, etc)
    allow_headers=["*"],            # permite todos los headers
)

# 🔹 Conexión SQL Server (ajusta SERVER, DATABASE, UID, PWD según tu SQL)
conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=192.168.0.48\\desaarrollo;"  # Nota: usa doble backslash para evitar escape en Python
    "DATABASE=CV_BDD;"
    "UID=sa;"
    "PWD=Me$$1Ars2oi8;"
)

def get_connection():
    return pyodbc.connect(conn_str)

# 1) Cliente por cédula
@app.get("/cliente/{cedula}")
def get_cliente(cedula: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_Cliente WHERE Cedula = ?", cedula)
    row = cursor.fetchone()
    if row:
        columns = [column[0] for column in cursor.description]
        result = dict(zip(columns, row))
        conn.close()
        return result
    conn.close()
    return {"mensaje": "Cliente no encontrado"}

# 2) Teléfonos por cédula
@app.get("/telefono/{cedula}")
def get_telefono(cedula: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_telefono WHERE Cedula = ?", cedula)
    rows = cursor.fetchall()
    if rows:
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in rows]
        conn.close()
        return result
    conn.close()
    return {"mensaje": "Teléfonos no encontrados"}

# 3) Mails por cédula
@app.get("/mail/{cedula}")
def get_mail(cedula: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_mail WHERE Cedula = ?", cedula)
    rows = cursor.fetchall()
    if rows:
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in rows]
        conn.close()
        return result
    conn.close()
    return {"mensaje": "Mails no encontrados"}
