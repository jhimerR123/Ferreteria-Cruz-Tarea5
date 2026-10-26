
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.rol import Rol
from app.schemas.rol import (
    RolCrear,
    RolActualizar,
    RolRespuesta
)

router = APIRouter(
    prefix="/api/v1/roles",
    tags=["Roles"],
    dependencies=[Depends(obtener_usuario_actual)]
)


@router.get("/", response_model=list[RolRespuesta])
def listar_roles(db: Session = Depends(get_db)):
    return db.query(Rol).order_by(Rol.id_rol).all()


@router.get("/{id_rol}", response_model=RolRespuesta)
def obtener_rol(id_rol: int, db: Session = Depends(get_db)):
    rol = db.get(Rol, id_rol)

    if rol is None:
        raise HTTPException(
            status_code=404,
            detail="Rol no encontrado"
        )

    return rol


@router.post(
    "/",
    response_model=RolRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_rol(
    datos: RolCrear,
    db: Session = Depends(get_db)
):
    nuevo_rol = Rol(**datos.model_dump())

    try:
        db.add(nuevo_rol)
        db.commit()
        db.refresh(nuevo_rol)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar el rol. Verifique los datos."
        )

    return nuevo_rol


@router.put("/{id_rol}", response_model=RolRespuesta)
def actualizar_rol(
    id_rol: int,
    datos: RolActualizar,
    db: Session = Depends(get_db)
):
    rol = db.get(Rol, id_rol)

    if rol is None:
        raise HTTPException(
            status_code=404,
            detail="Rol no encontrado"
        )

    cambios = datos.model_dump(exclude_unset=True)

    for campo, valor in cambios.items():
        setattr(rol, campo, valor)

    try:
        db.commit()
        db.refresh(rol)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar el rol."
        )

    return rol


@router.patch("/{id_rol}/desactivar", response_model=RolRespuesta)
def desactivar_rol(
    id_rol: int,
    db: Session = Depends(get_db)
):
    rol = db.get(Rol, id_rol)

    if rol is None:
        raise HTTPException(
            status_code=404,
            detail="Rol no encontrado"
        )

    rol.estado = False
    db.commit()
    db.refresh(rol)

    return rol
