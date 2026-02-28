from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.schemas.project import ProjectOut

PRODUCT_STATUS_VALUES = {"in_garage", "in_kitchen", "in_dining_room", "in_living_room"}
PRIORITY_VALUES = {"low", "medium", "high"}


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "in_garage"
    priority: str = "medium"
    category_id: Optional[int] = None
    staging_url: Optional[str] = None
    live_url: Optional[str] = None
    code_repo: Optional[str] = None
    hosting_platform: Optional[str] = None
    network_access: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    doc_url: Optional[str] = None
    features: Optional[list[str]] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in PRODUCT_STATUS_VALUES:
            raise ValueError(f"status must be one of {PRODUCT_STATUS_VALUES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in PRIORITY_VALUES:
            raise ValueError(f"priority must be one of {PRIORITY_VALUES}")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category_id: Optional[int] = None
    staging_url: Optional[str] = None
    live_url: Optional[str] = None
    code_repo: Optional[str] = None
    hosting_platform: Optional[str] = None
    network_access: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    doc_url: Optional[str] = None
    features: Optional[list[str]] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PRODUCT_STATUS_VALUES:
            raise ValueError(f"status must be one of {PRODUCT_STATUS_VALUES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PRIORITY_VALUES:
            raise ValueError(f"priority must be one of {PRIORITY_VALUES}")
        return v


class ProductOut(ProductBase):
    id: int
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    project_count: int = 0
    task_count: int = 0
    task_done_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductOutWithProjects(ProductOut):
    projects: list[ProjectOut] = []
