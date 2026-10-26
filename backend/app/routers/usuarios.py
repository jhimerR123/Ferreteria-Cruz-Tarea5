
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.schemas.usuario import (
    UsuarioCrear,
    UsuarioActualizar,
    UsuarioRespuesta
)

router = APIRouter(
    prefix="/api/v1/usuarios",
    tags=["Usuarios"],
    dependencies=[Depends(obtener_usuario_actual)]
)

password_hash = PasswordHash.recommended()


@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).order_by(Usuario.id_usuario).all()


@router.get("/{id_usuario}", response_model=UsuarioRespuesta)
def obtener_usuario(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    usuario = db.get(Usuario, id_usuario)

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return usuario


@router.post(
    "/",
    response_model=UsuarioRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_usuario(
    datos: UsuarioCrear,
    db: Session = Depends(get_db)
):
    rol = db.get(Rol, datos.id_rol)

    if rol is None or not rol.estado:
        raise HTTPException(
            status_code=400,
            detail="El rol seleccionado no existe o está inactivo"
        )

    existente = db.query(Usuario).filter(
        Usuario.usuario == datos.usuario
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="El nombre de usuario ya está registrado"
        )

    datos_usuario = datos.model_dump(exclude={"clave"})

    nuevo_usuario = Usuario(
        **datos_usuario,
        clave=password_hash.hash(datos.clave),
        estado=True
    )

    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar el usuario"
        )

    return nuevo_usuario


@router.put("/{id_usuario}", response_model=UsuarioRespuesta)
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioActualizar,
    db: Session = Depends(get_db)
):
    usuario = db.get(Usuario, id_usuario)

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    cambios = datos.model_dump(exclude_unset=True)

    if "id_rol" in cambios:
        rol = db.get(Rol, cambios["id_rol"])

        if rol is None or not rol.estado:
            raise HTTPException(
                status_code=400,
                detail="El rol seleccionado no existe o está inactivo"
            )

    if "usuario" in cambios:
        existente = db.query(Usuario).filter(
            Usuario.usuario == cambios["usuario"],
            Usuario.id_usuario != id_usuario
        ).first()

        if existente:
            raise HTTPException(
                status_code=409,
                detail="El nombre de usuario ya está registrado"
            )

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    try:
        db.commit()
        db.refresh(usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar el usuario"
        )

    return usuario


@router.patch(
    "/{id_usuario}/desactivar",
    response_model=UsuarioRespuesta
)
def desactivar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    usuario = db.get(Usuario, id_usuario)

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.estado = False
    db.commit()
    db.refresh(usuario)

    return usuario
	