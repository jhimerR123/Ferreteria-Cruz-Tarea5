
from sqlalchemy import Column, Integer, String, Boolean
from app.models.rol import Base


class UnidadMedida(Base):
    __tablename__ = "unidad_de_medida"

    id_unidad_de_medida = Column(
        Integer,
        primary_key=True
    )

    nombre_medida = Column(String(80), nullable=False)
    abreviatura = Column(String(15), nullable=False)
    descripcion = Column(String(200), nullable=True)
    estado = Column(Boolean, nullable=False)
