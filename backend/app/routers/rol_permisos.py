
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.rol import Rol
from app.models.permiso import Permiso
from app.models.rol_permiso import RolPermiso
from app.schemas.rol_permiso import (
    RolPermisoCrear,
    RolPermisoRespuesta
)

router = APIRouter(
    prefix="/api/v1/rol-permisos",
    tags=["Asignacion de Permisos"],
    dependencies=[Depends(obtener_usuario_actual)]
)


@router.get("/", response_model=list[RolPermisoRespuesta])
def listar_asignaciones(db: Session = Depends(get_db)):
    return db.query(RolPermiso).order_by(
        RolPermiso.id_rol_permiso
    ).all()


@router.get(
    "/rol/{id_rol}",
    response_model=list[RolPermisoRespuesta]
)
def permisos_de_un_rol(
    id_rol: int,
    db: Session = Depends(get_db)
):
    rol = db.get(Rol, id_rol)

    if rol is None:
        raise HTTPException(
            status_code=404,
            detail="El rol no existe"
        )

    return db.query(RolPermiso).filter(
        RolPermiso.id_rol == id_rol
    ).all()


@router.post(
    "/",
    response_model=RolPermisoRespuesta,
    status_code=status.HTTP_201_CREATED
)
def asignar_permiso(
    datos: RolPermisoCrear,
    db: Session = Depends(get_db)
):
    rol = db.get(Rol, datos.id_rol)
    permiso = db.get(Permiso, datos.id_permiso)

    if rol is None:
        raise HTTPException(
            status_code=404,
            detail="El rol no existe"
        )

    if permiso is None:
        raise HTTPException(
            status_code=404,
            detail="El permiso no existe"
        )

    if not rol.estado or not permiso.estado:
        raise HTTPException(
            status_code=400,
            detail="El rol y el permiso deben estar activos"
        )

    existente = db.query(RolPermiso).filter(
        RolPermiso.id_rol == datos.id_rol,
        RolPermiso.id_permiso == datos.id_permiso
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="El permiso ya está asignado a este rol"
        )

    asignacion = RolPermiso(**datos.model_dump())

    try:
        db.add(asignacion)
        db.commit()
        db.refresh(asignacion)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo asignar el permiso"
        )

    return asignacion


@router.delete("/{id_rol_permiso}")
def quitar_permiso(
    id_rol_permiso: int,
    db: Session = Depends(get_db)
):
    asignacion = db.get(RolPermiso, id_rol_permiso)

    if asignacion is None:
        raise HTTPException(
            status_code=404,
            detail="La asignacion no existe"
        )

    db.delete(asignacion)
    db.commit()

    return {
        "mensaje": "Permiso retirado correctamente del rol"
    }
