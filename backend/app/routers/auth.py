
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.schemas.auth import (
    TokenRespuesta,
    DatosUsuarioActual
)
from app.security import (
    verificar_clave,
    crear_token,
    obtener_usuario_actual,
    requerir_permiso
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticacion JWT"]
)


@router.post("/login", response_model=TokenRespuesta)
def iniciar_sesion(
    datos: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(
        Usuario.usuario == datos.username
    ).first()

    error_login = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuario o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if usuario is None:
        raise error_login

    if not verificar_clave(datos.password, usuario.clave):
        raise error_login

    if not usuario.estado:
        raise HTTPException(
            status_code=403,
            detail="El usuario esta inactivo"
        )

    rol = db.get(Rol, usuario.id_rol)

    if rol is None or not rol.estado:
        raise HTTPException(
            status_code=403,
            detail="El rol esta inactivo"
        )

    token = crear_token({
        "sub": str(usuario.id_usuario)
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get(
    "/mi-perfil",
    response_model=DatosUsuarioActual
)
def consultar_perfil(
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    return usuario


@router.get("/verificar-permiso-usuarios")
def verificar_permiso_usuarios(
    usuario: Usuario = Depends(
        requerir_permiso("Registrar usuarios")
    )
):
    return {
        "mensaje": "Acceso autorizado",
        "usuario": usuario.usuario,
        "permiso": "Registrar usuarios"
    }
