
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class RolCrear(BaseModel):
    nombre_rol: str = Field(min_length=1, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=200)
    estado: bool = True


class RolActualizar(BaseModel):
    nombre_rol: Optional[str] = Field(default=None, min_length=1, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=200)
    estado: Optional[bool] = None


class RolRespuesta(BaseModel):
    id_rol: int
    nombre_rol: str
    descripcion: Optional[str]
    estado: bool

    model_config = ConfigDict(from_attributes=True)
