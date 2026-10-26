
from sqlalchemy import Column, Integer, String, Boolean
from app.models.rol import Base


class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso = Column(Integer, primary_key=True, index=True)
    nombre_permiso = Column(String(100), nullable=False)
    modulo = Column(String(50), nullable=False)
    submenu = Column(String(80), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    descripcion = Column(String(200), nullable=True)
