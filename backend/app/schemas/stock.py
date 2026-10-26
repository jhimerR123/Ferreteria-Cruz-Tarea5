
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# 1. ESQUEMA PARA REGISTRAR STOCK
# ==========================================

class StockCrear(BaseModel):
    id_producto: int = Field(gt=0)

    id_ferreteria: int = Field(gt=0)

    stock_actual: int = Field(ge=0)

    stock_minimo: int = Field(ge=0)

    ubicacion: Optional[str] = Field(
        default=None,
        max_length=120
    )

    pasillo: Optional[str] = Field(
        default=None,
        max_length=50
    )

    estante: Optional[str] = Field(
        default=None,
        max_length=50
    )


# ==========================================
# 2. ESQUEMA PARA ACTUALIZAR STOCK
# ==========================================

class StockActualizar(BaseModel):
    stock_actual: Optional[int] = Field(
        default=None,
        ge=0
    )

    stock_minimo: Optional[int] = Field(
        default=None,
        ge=0
    )

    ubicacion: Optional[str] = Field(
        default=None,
        max_length=120
    )

    pasillo: Optional[str] = Field(
        default=None,
        max_length=50
    )

    estante: Optional[str] = Field(
        default=None,
        max_length=50
    )


# ==========================================
# 3. ESQUEMA PARA MOSTRAR STOCK
# ==========================================

class StockRespuesta(BaseModel):
    id_stock: int
    id_producto: int
    id_ferreteria: int
    stock_actual: int
    stock_minimo: int
    ubicacion: Optional[str]
    pasillo: Optional[str]
    estante: Optional[str]
    fecha_actualizacion: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
