
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductoCrear(BaseModel):
    id_marca: int = Field(gt=0)
    id_categoria: int = Field(gt=0)
    id_unidad_de_medida: int = Field(gt=0)

    codigo: str = Field(min_length=1, max_length=50)
    nombre_producto: str = Field(min_length=1, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=250)

    precio_venta: Decimal = Field(
        ge=0, max_digits=14, decimal_places=2
    )
    precio_compra: Decimal = Field(
        ge=0, max_digits=14, decimal_places=2
    )
    costo_promedio: Decimal = Field(
        default=Decimal("0"),
        ge=0, max_digits=14, decimal_places=4
    )


class ProductoActualizar(BaseModel):
    codigo: Optional[str] = Field(
        default=None, min_length=1, max_length=50
    )
    nombre_producto: Optional[str] = Field(
        default=None, min_length=1, max_length=150
    )
    descripcion: Optional[str] = Field(
        default=None, max_length=250
    )
    precio_venta: Optional[Decimal] = Field(
        default=None, ge=0, max_digits=14, decimal_places=2
    )
    precio_compra: Optional[Decimal] = Field(
        default=None, ge=0, max_digits=14, decimal_places=2
    )


class ProductoRespuesta(ProductoCrear):
    id_producto: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)
