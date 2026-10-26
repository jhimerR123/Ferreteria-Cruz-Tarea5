
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from app.models.rol import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)

    id_rol = Column(
        Integer,
        ForeignKey("roles.id_rol"),
        nullable=False
    )

    nombre_completo = Column(String(120), nullable=False)
    telefono = Column(String(25), nullable=True)
    correo = Column(String(150), nullable=True)
    usuario = Column(String(60), nullable=False)
    clave = Column(String(255), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )
