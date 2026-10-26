
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual

from app.models.stock import Stock
from app.models.producto import Producto
from app.models.ferreteria import Ferreteria

from app.schemas.stock import (
    StockCrear,
    StockActualizar,
    StockRespuesta
)


router = APIRouter(
    prefix="/api/v1/stock",
    tags=["Stock"],
    dependencies=[Depends(obtener_usuario_actual)]
)


# ==========================================
# 1. LISTAR TODO EL STOCK
# ==========================================

@router.get(
    "/",
    response_model=list[StockRespuesta]
)
def listar_stock(
    db: Session = Depends(get_db)
):
    return db.query(Stock).order_by(
        Stock.id_stock.desc()
    ).all()


# ==========================================
# 2. CONSULTAR STOCK POR ID
# ==========================================

@router.get(
    "/{id_stock}",
    response_model=StockRespuesta
)
def obtener_stock(
    id_stock: int,
    db: Session = Depends(get_db)
):
    stock = db.get(Stock, id_stock)

    if stock is None:
        raise HTTPException(
            status_code=404,
            detail="Registro de stock no encontrado"
        )

    return stock


# ==========================================
# 3. REGISTRAR STOCK
# ==========================================

@router.post(
    "/",
    response_model=StockRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_stock(
    datos: StockCrear,
    db: Session = Depends(get_db)
):

    # Verificar que el producto exista
    producto = db.get(
        Producto,
        datos.id_producto
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="El producto no existe"
        )

    if not producto.estado:
        raise HTTPException(
            status_code=400,
            detail="El producto esta inactivo"
        )

    # Verificar que la ferreteria exista
    ferreteria = db.get(
        Ferreteria,
        datos.id_ferreteria
    )

    if ferreteria is None:
        raise HTTPException(
            status_code=404,
            detail="La ferreteria no existe"
        )

    if not ferreteria.estado:
        raise HTTPException(
            status_code=400,
            detail="La ferreteria esta inactiva"
        )

    # Evitar duplicar stock del mismo producto
    # en la misma ferreteria
    existente = db.query(Stock).filter(
        Stock.id_producto == datos.id_producto,
        Stock.id_ferreteria == datos.id_ferreteria
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe stock para este producto en esta ferreteria"
        )

    nuevo_stock = Stock(
        id_producto=datos.id_producto,
        id_ferreteria=datos.id_ferreteria,
        stock_actual=datos.stock_actual,
        stock_minimo=datos.stock_minimo,
        ubicacion=datos.ubicacion,
        pasillo=datos.pasillo,
        estante=datos.estante,
        fecha_actualizacion=datetime.now(timezone.utc)
    )

    try:
        db.add(nuevo_stock)
        db.commit()
        db.refresh(nuevo_stock)

    except IntegrityError as error:
        db.rollback()

        print(
            "ERROR REAL DE STOCK:",
            repr(error.orig)
        )

        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar el stock"
        )

    return nuevo_stock


# ==========================================
# 4. ACTUALIZAR STOCK
# ==========================================

@router.put(
    "/{id_stock}",
    response_model=StockRespuesta
)
def actualizar_stock(
    id_stock: int,
    datos: StockActualizar,
    db: Session = Depends(get_db)
):

    stock = db.get(Stock, id_stock)

    if stock is None:
        raise HTTPException(
            status_code=404,
            detail="Registro de stock no encontrado"
        )

    cambios = datos.model_dump(
        exclude_unset=True
    )

    for campo, valor in cambios.items():
        setattr(stock, campo, valor)

    stock.fecha_actualizacion = datetime.now(
        timezone.utc
    )

    try:
        db.commit()
        db.refresh(stock)

    except IntegrityError as error:
        db.rollback()

        print(
            "ERROR REAL AL ACTUALIZAR STOCK:",
            repr(error.orig)
        )

        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar el stock"
        )

    return stock


# ==========================================
# 5. CONSULTAR PRODUCTOS CON STOCK BAJO
# ==========================================

@router.get(
    "/alertas/bajo-minimo",
    response_model=list[StockRespuesta]
)
def consultar_stock_bajo(
    db: Session = Depends(get_db)
):
    return db.query(Stock).filter(
        Stock.stock_actual <= Stock.stock_minimo
    ).all()
