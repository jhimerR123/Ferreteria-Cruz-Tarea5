
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.usuario import Usuario
from app.models.venta import Venta
from app.models.cliente import Cliente
from app.schemas.venta import (
    VentaCrear,
    VentaActualizar,
    VentaRespuesta
)


router = APIRouter(
    prefix="/api/v1/ventas",
    tags=["Ventas"],
    dependencies=[Depends(obtener_usuario_actual)]
)


# ==========================================
# 1. LISTAR TODAS LAS VENTAS
# ==========================================

@router.get(
    "/",
    response_model=list[VentaRespuesta]
)
def listar_ventas(
    db: Session = Depends(get_db)
):
    ventas = db.query(Venta).order_by(
        Venta.id_venta.desc()
    ).all()

    return ventas


# ==========================================
# 2. CONSULTAR VENTA POR ID
# ==========================================

@router.get(
    "/{id_venta}",
    response_model=VentaRespuesta
)
def obtener_venta(
    id_venta: int,
    db: Session = Depends(get_db)
):
    venta = db.get(Venta, id_venta)

    if venta is None:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    return venta


# ==========================================
# 3. REGISTRAR UNA VENTA
# ==========================================

@router.post(
    "/",
    response_model=VentaRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_venta(
    datos: VentaCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    # Verificar cliente si se proporciona
    if datos.id_cliente is not None:

        cliente = db.get(
            Cliente,
            datos.id_cliente
        )

        if cliente is None:
            raise HTTPException(
                status_code=404,
                detail="El cliente no existe"
            )

        if not cliente.estado:
            raise HTTPException(
                status_code=400,
                detail="El cliente esta inactivo"
            )

    # Verificar numero de venta duplicado
    existente = db.query(Venta).filter(
        Venta.numero_venta == datos.numero_venta
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="El numero de venta ya existe"
        )

    # Crear nueva venta
    nueva_venta = Venta(
        id_cliente=datos.id_cliente,
        id_usuario=usuario_actual.id_usuario,
        numero_venta=datos.numero_venta,
        total=datos.total,
        estado="BORRADOR"
    )

    try:
        db.add(nueva_venta)
        db.commit()
        db.refresh(nueva_venta)

    except IntegrityError as error:
        db.rollback()

        print(
            "ERROR REAL DE VENTA:",
            repr(error.orig)
        )

        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar la venta"
        )

    return nueva_venta


# ==========================================
# 4. ACTUALIZAR UNA VENTA
# ==========================================

@router.put(
    "/{id_venta}",
    response_model=VentaRespuesta
)
def actualizar_venta(
    id_venta: int,
    datos: VentaActualizar,
    db: Session = Depends(get_db)
):

    venta = db.get(Venta, id_venta)

    if venta is None:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    cambios = datos.model_dump(
        exclude_unset=True
    )

    # Verificar numero duplicado
    if "numero_venta" in cambios:

        existente = db.query(Venta).filter(
            Venta.numero_venta == cambios["numero_venta"],
            Venta.id_venta != id_venta
        ).first()

        if existente:
            raise HTTPException(
                status_code=409,
                detail="El numero de venta ya existe"
            )

    # Aplicar cambios
    for campo, valor in cambios.items():
        setattr(venta, campo, valor)

    try:
        db.commit()
        db.refresh(venta)

    except IntegrityError as error:
        db.rollback()

        print(
            "ERROR REAL AL ACTUALIZAR VENTA:",
            repr(error.orig)
        )

        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar la venta"
        )

    return venta
