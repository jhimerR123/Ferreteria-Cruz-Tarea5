
from sqlalchemy import Column, Integer, String, Boolean, Numeric, ForeignKey
from app.models.rol import Base

from app.models.marca import Marca
from app.models.categoria import Categoria
from app.models.unidad_medida import UnidadMedida

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)

    id_marca = Column(
        Integer,
        ForeignKey("marca.id_marca"),
        nullable=False
    )

    id_categoria = Column(
        Integer,
        ForeignKey("categoria.id_categoria"),
        nullable=False
    )

    id_unidad_de_medida = Column(
        Integer,
        ForeignKey("unidad_de_medida.id_unidad_de_medida"),
        nullable=False
    )

    codigo = Column(String(50), nullable=False)
    nombre_producto = Column(String(150), nullable=False)
    descripcion = Column(String(250), nullable=True)

    precio_venta = Column(Numeric(14, 2), nullable=False)
    precio_compra = Column(Numeric(14, 2), nullable=False)
    costo_promedio = Column(Numeric(14, 4), nullable=False)

    estado = Column(Boolean, nullable=False, default=True)
