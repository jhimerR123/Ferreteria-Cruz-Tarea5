
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UsuarioCrear(BaseModel):
    id_rol: int = Field(gt=0)
    nombre_completo: str = Field(min_length=1, max_length=120)
    telefono: Optional[str] = Field(default=None, max_length=25)
    correo: Optional[str] = Field(default=None, max_length=150)
    usuario: str = Field(min_length=3, max_length=60)
    clave: str = Field(min_length=8, max_length=128)


class UsuarioActualizar(BaseModel):
    id_rol: Optional[int] = Field(default=None, gt=0)
    nombre_completo: Optional[str] = Field(
        default=None, min_length=1, max_length=120
    )
    telefono: Optional[str] = Field(default=None, max_length=25)
    correo: Optional[str] = Field(default=None, max_length=150)
    usuario: Optional[str] = Field(
        default=None, min_length=3, max_length=60
    )


class UsuarioRespuesta(BaseModel):
    id_usuario: int
    id_rol: int
    nombre_completo: str
    telefono: Optional[str]
    correo: Optional[str]
    usuario: str
    estado: bool
    fecha_registro: datetime

    model_config = ConfigDict(from_attributes=True)
