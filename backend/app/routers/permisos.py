
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.permiso import Permiso
from app.schemas.permiso import (
    PermisoCrear,
    PermisoActualizar,
    PermisoRespuesta
)

router = APIRouter(
    prefix="/api/v1/permisos",
    tags=["Permisos"],
    dependencies=[Depends(obtener_usuario_actual)]
)


@router.get("/", response_model=list[PermisoRespuesta])
def listar_permisos(db: Session = Depends(get_db)):
    return db.query(Permiso).order_by(Permiso.id_permiso).all()


@router.get("/{id_permiso}", response_model=PermisoRespuesta)
def obtener_permiso(
    id_permiso: int,
    db: Session = Depends(get_db)
):
    permiso = db.get(Permiso, id_permiso)

    if permiso is None:
        raise HTTPException(
            status_code=404,
            detail="Permiso no encontrado"
        )

    return permiso


@router.post(
    "/",
    response_model=PermisoRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_permiso(
    datos: PermisoCrear,
    db: Session = Depends(get_db)
):
    nuevo_permiso = Permiso(**datos.model_dump())

    try:
        db.add(nuevo_permiso)
        db.commit()
        db.refresh(nuevo_permiso)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar el permiso"
        )

    return nuevo_permiso


@router.put("/{id_permiso}", response_model=PermisoRespuesta)
def actualizar_permiso(
    id_permiso: int,
    datos: PermisoActualizar,
    db: Session = Depends(get_db)
):
    permiso = db.get(Permiso, id_permiso)

    if permiso is None:
        raise HTTPException(
            status_code=404,
            detail="Permiso no encontrado"
        )

    cambios = datos.model_dump(exclude_unset=True)

    for campo, valor in cambios.items():
        setattr(permiso, campo, valor)

    try:
        db.commit()
        db.refresh(permiso)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar el permiso"
        )

    return permiso


@router.patch(
    "/{id_permiso}/desactivar",
    response_model=PermisoRespuesta
)
def desactivar_permiso(
    id_permiso: int,
    db: Session = Depends(get_db)
):
    permiso = db.get(Permiso, id_permiso)

    if permiso is None:
        raise HTTPException(
            status_code=404,
            detail="Permiso no encontrado"
        )

    permiso.estado = False
    db.commit()
    db.refresh(permiso)

    return permiso
