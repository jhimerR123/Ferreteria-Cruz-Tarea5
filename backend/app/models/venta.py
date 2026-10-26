
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
from app.models.cliente import Cliente


class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_cliente = Column(
        Integer,
        ForeignKey("clientes.id_cliente"),
        nullable=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    numero_venta = Column(
        String(40),
        nullable=False
    )

    fecha = Column(
        DateTime(timezone=True),
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
