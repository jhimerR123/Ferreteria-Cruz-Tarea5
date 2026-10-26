
from sqlalchemy import Column, Integer, String, Boolean
from app.models.rol import Base


class Proveedor(Base):
    __tablename__ = "proveedores"

    id_proveedor = Column(Integer, primary_key=True)
    nombre_proveedor = Column(String(150), nullable=False)
    nit = Column(String(30), nullable=True)
    telefono = Column(String(25), nullable=True)
    correo = Column(String(150), nullable=True)
    direccion = Column(String(250), nullable=True)
    descripcion = Column(String(250), nullable=True)
    estado = Column(Boolean, nullable=False)
