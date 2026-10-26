
from pydantic import BaseModel


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str


class DatosUsuarioActual(BaseModel):
    id_usuario: int
    nombre_completo: str
    usuario: str
    id_rol: int
    estado: bool
