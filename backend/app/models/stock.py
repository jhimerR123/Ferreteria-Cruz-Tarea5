
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    func
)

from app.models.rol import Base
from app.models.producto import Producto
from app.models.ferreteria import Ferreteria


class Stock(Base):
    __tablename__ = "stock"

    id_stock = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        nullable=False
    )

    id_ferreteria = Column(
        Integer,
        ForeignKey("ferreteria.id_ferreteria"),
        nullable=False
    )

    stock_actual = Column(
        Integer,
        nullable=False
    )

    stock_minimo = Column(
        Integer,
        nullable=False
    )

    ubicacion = Column(
        String(120),
        nullable=True
    )

    pasillo = Column(
        String(50),
        nullable=True
    )

    estante = Column(
        String(50),
        nullable=True
    )

    fecha_actualizacion = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )
