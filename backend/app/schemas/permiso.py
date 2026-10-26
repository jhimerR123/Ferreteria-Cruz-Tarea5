
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class PermisoCrear(BaseModel):
    nombre_permiso: str = Field(min_length=1, max_length=100)
    modulo: str = Field(min_length=1, max_length=50)
    submenu: Optional[str] = Field(default=None, max_length=80)
    estado: bool = True
    descripcion: Optional[str] = Field(default=None, max_length=200)


class PermisoActualizar(BaseModel):
    nombre_permiso: Optional[str] = Field(
        default=None, min_length=1, max_length=100
    )
    modulo: Optional[str] = Field(
        default=None, min_length=1, max_length=50
    )
    submenu: Optional[str] = Field(default=None, max_length=80)
    estado: Optional[bool] = None
    descripcion: Optional[str] = Field(default=None, max_length=200)


class PermisoRespuesta(BaseModel):
    id_permiso: int
    nombre_permiso: str
    modulo: str
    submenu: Optional[str]
    estado: bool
    descripcion: Optional[str]

    model_config = ConfigDict(from_attributes=True)
