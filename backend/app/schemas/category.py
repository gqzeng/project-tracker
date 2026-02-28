from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.category import VALID_COLORS


class CategoryBase(BaseModel):
    name: str
    color: str = "sky"

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        if v not in VALID_COLORS:
            raise ValueError(f"color must be one of {VALID_COLORS}")
        return v


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_COLORS:
            raise ValueError(f"color must be one of {VALID_COLORS}")
        return v


class CategoryOut(CategoryBase):
    id: int
    created_at: datetime
    product_count: int = 0

    model_config = {"from_attributes": True}
