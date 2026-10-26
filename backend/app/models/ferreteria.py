
from sqlalchemy import Column, Integer, String, Boolean

from app.models.rol import Base


class Ferreteria(Base):
    __tablename__ = "ferreteria"

    id_ferreteria = Column(
        Integer,
        primary_key=True
    )

    nombre_ferreteria = Column(
        String(150),
        nullable=False
    )

    nit = Column(String(30), nullable=True)
    telefono = Column(String(25), nullable=True)
    direccion = Column(String(250), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado = Column(Boolean, nullable=False)
    descripcion = Column(String(250), nullable=True)
