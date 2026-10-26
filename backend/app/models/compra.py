
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    func
)

from app.models.rol import Base
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor


class Compra(Base):
    __tablename__ = "compras"

    id_compra = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_proveedor = Column(
        Integer,
        ForeignKey("proveedores.id_proveedor"),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    numero_compra = Column(
        String(40),
        nullable=False
    )

    fecha = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    total = Column(
        Numeric(14, 2),
        nullable=False
    )

    estado = Column(
        String(20),
        nullable=False
    )
