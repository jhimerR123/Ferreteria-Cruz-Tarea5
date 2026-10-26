
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# 1. ESQUEMA PARA REGISTRAR VENTAS
# ==========================================

class VentaCrear(BaseModel):
    id_cliente: Optional[int] = Field(
        default=None,
        gt=0
    )

    numero_venta: str = Field(
        min_length=1,
        max_length=40
    )

    total: Decimal = Field(
        ge=0,
        max_digits=14,
        decimal_places=2
    )


# ==========================================
# 2. ESQUEMA PARA ACTUALIZAR VENTAS
# ==========================================

class VentaActualizar(BaseModel):
    numero_venta: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=40
    )

    estado: Optional[str] = Field(
        default=None,
        max_length=20
    )


# ==========================================
# 3. ESQUEMA PARA MOSTRAR VENTAS
# ==========================================

class VentaRespuesta(BaseModel):
    id_venta: int
    id_cliente: Optional[int]
    id_usuario: int
    numero_venta: str
    fecha: datetime
    total: Decimal
    estado: str

    model_config = ConfigDict(
        from_attributes=True
    )
