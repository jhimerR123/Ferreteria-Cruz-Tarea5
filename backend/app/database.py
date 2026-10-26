
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Cargar las variables del archivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "ERROR: No se encontró DATABASE_URL en el archivo .env"
    )

# Configurar conexión con PostgreSQL en Supabase
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10}
)

# Configurar sesiones de base de datos
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Obtener sesión para los endpoints de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Verificar la conexión con PostgreSQL
def verificar_conexion():
    with engine.connect() as conexion:
        resultado = conexion.execute(
            text("SELECT current_database()")
        )
        return resultado.scalar()
