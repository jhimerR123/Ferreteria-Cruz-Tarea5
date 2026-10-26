
from pydantic import BaseModel, ConfigDict, Field


class RolPermisoCrear(BaseModel):
    id_rol: int = Field(gt=0)
    id_permiso: int = Field(gt=0)


class RolPermisoRespuesta(BaseModel):
    id_rol_permiso: int
    id_rol: int
    id_permiso: int

    model_config = ConfigDict(from_attributes=True)
