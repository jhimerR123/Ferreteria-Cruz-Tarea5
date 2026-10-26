
from sqlalchemy import Column, Integer, String, Boolean
from app.models.rol import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True)
    nombre_completo = Column(String(150), nullable=False)
    ci_nit = Column(String(30), nullable=True)
    telefono = Column(String(25), nullable=True)
    direccion = Column(String(250), nullable=True)
    estado = Column(Boolean, nullable=False)
