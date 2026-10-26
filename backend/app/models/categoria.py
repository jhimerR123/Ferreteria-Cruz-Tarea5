
from sqlalchemy import Column, Integer, String, Boolean
from app.models.rol import Base


class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria = Column(Integer, primary_key=True)
    nombre_categoria = Column(String(100), nullable=False)
    descripcion = Column(String(200), nullable=True)
    estado = Column(Boolean, nullable=False)
