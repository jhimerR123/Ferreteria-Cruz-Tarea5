
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.models.rol import Base


class RolPermiso(Base):
    __tablename__ = "rol_permiso"

    id_rol_permiso = Column(Integer, primary_key=True, index=True)

    id_rol = Column(
        Integer,
        ForeignKey("roles.id_rol"),
        nullable=False
    )

    id_permiso = Column(
        Integer,
        ForeignKey("permisos.id_permiso"),
        nullable=False
    )
