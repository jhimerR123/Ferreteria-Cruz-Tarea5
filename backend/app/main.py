
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    roles,
    permisos,
    rol_permisos,
    usuarios,
    auth,
    productos,
    compras,
    ventas,
    stock
)


# ==========================================
# CONFIGURACION DE FASTAPI
# ==========================================

app = FastAPI(
    title="Sistema Web Ferreteria Cruz",
    description="API REST para la gestion de compras, ventas e inventario",
    version="1.0.0"
)


# ==========================================
# CONFIGURACION DE CORS
# ==========================================


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ferreteria-cruz-tarea5.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# RUTA PRINCIPAL
# ==========================================

@app.get("/")
def inicio():
    return {
        "mensaje": "Bienvenido al Sistema Web Ferreteria Cruz",
        "estado": "Activo"
    }


# ==========================================
# VERIFICAR ESTADO DE LA API
# ==========================================

@app.get("/api/v1/estado")
def verificar_estado():
    return {
        "sistema": "Ferreteria Cruz",
        "estado": "Funcionando",
        "version": "1.0.0"
    }


# ==========================================
# MODULO DE ROLES
# ==========================================

app.include_router(roles.router)


# ==========================================
# MODULO DE PERMISOS
# ==========================================

app.include_router(permisos.router)


# ==========================================
# ASIGNACION DE PERMISOS A ROLES
# ==========================================

app.include_router(rol_permisos.router)


# ==========================================
# MODULO DE USUARIOS
# ==========================================

app.include_router(usuarios.router)


# ==========================================
# AUTENTICACION JWT
# ==========================================

app.include_router(auth.router)


# ==========================================
# MODULO DE PRODUCTOS
# ==========================================

app.include_router(productos.router)


# ==========================================
# MODULO DE COMPRAS
# ==========================================

app.include_router(compras.router)


# ==========================================
# MODULO DE VENTAS
# ==========================================

app.include_router(ventas.router)


# ==========================================
# MODULO DE STOCK
# ==========================================

app.include_router(stock.router)
