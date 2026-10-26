
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.usuario import Usuario
from app.models.compra import Compra
from app.models.proveedor import Proveedor
from app.schemas.compra import (
    CompraCrear,
    CompraActualizar,
    CompraRespuesta
)


router = APIRouter(
    prefix="/api/v1/compras",
    tags=["Compras"],
    dependencies=[Depends(obtener_usuario_actual)]
)


# ==========================================
# 1. LISTAR TODAS LAS COMPRAS
# ==========================================

@router.get(
    "/",
    response_model=list[CompraRespuesta]
)
def listar_compras(
    db: Session = Depends(get_db)
):
    compras = db.query(Compra).order_by(
        Compra.id_compra.desc()
    ).all()

    return compras


# ==========================================
# 2. CONSULTAR COMPRA POR ID
# ==========================================

@router.get(
    "/{id_compra}",
    response_model=CompraRespuesta
)
def obtener_compra(
    id_compra: int,
    db: Session = Depends(get_db)
):
    compra = db.get(Compra, id_compra)

    if compra is None:
        raise HTTPException(
            status_code=404,
            detail="Compra no encontrada"
        )

    return compra


# ==========================================
# 3. REGISTRAR UNA COMPRA
# ==========================================

@router.post(
    "/",
    response_model=CompraRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_compra(
    datos: CompraCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    # Verificar que el proveedor exista
    proveedor = db.get(
        Proveedor,
        datos.id_proveedor
    )

    if proveedor is None:
        raise HTTPException(
            status_code=404,
            detail="El proveedor no existe"
        )

    # Verificar que el proveedor este activo
    if not proveedor.estado:
        raise HTTPException(
            status_code=400,
            detail="El proveedor esta inactivo"
        )

    # Verificar numero de compra duplicado
    existente = db.query(Compra).filter(
        Compra.numero_compra == datos.numero_compra
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="El numero de compra ya existe"
        )

    # Crear nueva compra
    nueva_compra = Compra(
        id_proveedor=datos.id_proveedor,
        id_usuario=usuario_actual.id_usuario,
        numero_compra=datos.numero_compra,
        total=datos.total,
        estado="BORRADOR"
   )

    try:
        db.add(nueva_compra)
        db.commit()
        db.refresh(nueva_compra)

    except IntegrityError as error:
        db.rollback()

        # Mostrar el error real en CMD
        print(
            "ERROR REAL DE COMPRA:",
            repr(error.orig)
        )

        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar la compra"
        )

    return nueva_compra


# ==========================================
# 4. ACTUALIZAR UNA COMPRA
# ==========================================

@router.put(
    "/{id_compra}",
    response_model=CompraRespuesta
)
def actualizar_compra(
    id_compra: int,
    datos: CompraActualizar,
    db: Session = Depends(get_db)
):

    compra = db.get(Compra, id_compra)

    if compra is None:
        raise HTTPException(
            status_code=404,
            detail="Compra no encontrada"
        )

    cambios = datos.model_dump(
        exclude_unset=True
    )

    # Verificar numero duplicado
    if "numero_compra" in cambios:
        existente = db.query(Compra).filter(
            Compra.numero_compra == cambios["numero_compra"],
            Compra.id_compra != id_compra
        ).first()

        if existente:
            raise HTTPException(
                status_code=409,
                detail="El numero de compra ya existe"
            )

    # Aplicar cambios
    for campo, valor in cambios.items():
        setattr(compra, campo, valor)

    try:
        db.commit()
        db.refresh(compra)

    except IntegrityError as error:
        db.rollback()

        print(
            "ERROR REAL AL ACTUALIZAR COMPRA:",
            repr(error.orig)
        )

        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar la compra"
        )

    return compra
