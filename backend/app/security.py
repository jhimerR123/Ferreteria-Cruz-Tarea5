
import os
from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.permiso import Permiso
from app.models.rol_permiso import RolPermiso

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_EXPIRE_MINUTES", "60")
)

if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise RuntimeError(
        "Configura una JWT_SECRET_KEY segura en .env"
    )

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


def verificar_clave(clave_plana: str, clave_hash: str):
    try:
        return password_hash.verify(clave_plana, clave_hash)
    except (ValueError, TypeError):
        return False


def crear_token(datos: dict):
    contenido = datos.copy()

    expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    contenido.update({"exp": expiracion})

    return jwt.encode(
        contenido,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    error_credenciales = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la autenticacion",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        datos = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        identificador = datos.get("sub")

        if identificador is None:
            raise error_credenciales

        id_usuario = int(identificador)

    except (InvalidTokenError, ValueError, TypeError):
        raise error_credenciales

    usuario = db.get(Usuario, id_usuario)

    if usuario is None or not usuario.estado:
        raise error_credenciales

    rol = db.get(Rol, usuario.id_rol)

    if rol is None or not rol.estado:
        raise HTTPException(
            status_code=403,
            detail="El rol del usuario esta inactivo"
        )

    return usuario


def requerir_permiso(nombre_permiso: str):
    def verificar_permiso(
        usuario: Usuario = Depends(obtener_usuario_actual),
        db: Session = Depends(get_db)
    ):
        permiso = (
            db.query(Permiso)
            .join(
                RolPermiso,
                RolPermiso.id_permiso == Permiso.id_permiso
            )
            .filter(
                RolPermiso.id_rol == usuario.id_rol,
                Permiso.nombre_permiso == nombre_permiso,
                Permiso.estado.is_(True)
            )
            .first()
        )

        if permiso is None:
            raise HTTPException(
                status_code=403,
                detail="No tiene permiso para realizar esta accion"
            )

        return usuario

    return verificar_permiso
