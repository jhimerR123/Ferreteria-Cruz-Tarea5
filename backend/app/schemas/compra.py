
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CompraCrear(BaseModel):
    id_proveedor: int = Field(gt=0)
    numero_compra: str = Field(
        min_length=1,
        max_length=40
    )
    total: Decimal = Field(
        ge=0,
        max_digits=14,
        decimal_places=2
    )


class CompraActualizar(BaseModel):
    numero_compra: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=40
    )
    estado: Optional[str] = Field(
        default=None,
        max_length=20
    )


class CompraRespuesta(BaseModel):
    id_compra: int
    id_proveedor: int
    id_usuario: int
    numero_compra: str
    fecha: datetime
    total: Decimal
    estado: str

    model_config = ConfigDict(from_attributes=True)
