
from sqlalchemy import Column, Integer, String, Boolean
from app.models.rol import Base


class Marca(Base):
    __tablename__ = "marca"

    id_marca = Column(Integer, primary_key=True)
    nombre_marca = Column(String(100), nullable=False)
    descripcion = Column(String(200), nullable=True)
    estado = Column(Boolean, nullable=False)
