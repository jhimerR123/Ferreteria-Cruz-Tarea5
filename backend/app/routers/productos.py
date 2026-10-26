
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import obtener_usuario_actual
from app.models.producto import Producto
from app.schemas.producto import (
    ProductoCrear,
    ProductoActualizar,
    ProductoRespuesta
)

router = APIRouter(
    prefix="/api/v1/productos",
    tags=["Productos"],
    dependencies=[Depends(obtener_usuario_actual)]
)


# LISTAR PRODUCTOS
@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(Producto).order_by(
        Producto.id_producto
    ).all()


# BUSCAR PRODUCTO POR ID
@router.get("/{id_producto}", response_model=ProductoRespuesta)
def obtener_producto(
    id_producto: int,
    db: Session = Depends(get_db)
):
    producto = db.get(Producto, id_producto)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return producto


# REGISTRAR PRODUCTO
@router.post(
    "/",
    response_model=ProductoRespuesta,
    status_code=status.HTTP_201_CREATED
)
def registrar_producto(
    datos: ProductoCrear,
    db: Session = Depends(get_db)
):
    existente = db.query(Producto).filter(
        Producto.codigo == datos.codigo
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="El codigo del producto ya existe"
        )

    nuevo_producto = Producto(
        **datos.model_dump(),
        estado=True
    )

    try:
        db.add(nuevo_producto)
        db.commit()
        db.refresh(nuevo_producto)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar. Verifique los ID de marca, categoria y unidad de medida."
        )

    return nuevo_producto


# ACTUALIZAR PRODUCTO
@router.put(
    "/{id_producto}",
    response_model=ProductoRespuesta
)
def actualizar_producto(
    id_producto: int,
    datos: ProductoActualizar,
    db: Session = Depends(get_db)
):
    producto = db.get(Producto, id_producto)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    cambios = datos.model_dump(exclude_unset=True)

    if "codigo" in cambios:
        existente = db.query(Producto).filter(
            Producto.codigo == cambios["codigo"],
            Producto.id_producto != id_producto
        ).first()

        if existente:
            raise HTTPException(
                status_code=409,
                detail="El codigo ya pertenece a otro producto"
            )

    for campo, valor in cambios.items():
        setattr(producto, campo, valor)

    try:
        db.commit()
        db.refresh(producto)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar el producto"
        )

    return producto


# DESACTIVAR PRODUCTO
@router.patch(
    "/{id_producto}/desactivar",
    response_model=ProductoRespuesta
)
def desactivar_producto(
    id_producto: int,
    db: Session = Depends(get_db)
):
    producto = db.get(Producto, id_producto)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto.estado = False
    db.commit()
    db.refresh(producto)

    return producto
