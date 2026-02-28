from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.schemas.task import TaskOut

PROJECT_STATUS_VALUES = {"active", "planned", "paused", "completed"}
PRIORITY_VALUES = {"low", "medium", "high"}


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "planned"
    priority: str = "medium"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in PROJECT_STATUS_VALUES:
            raise ValueError(f"status must be one of {PROJECT_STATUS_VALUES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in PRIORITY_VALUES:
            raise ValueError(f"priority must be one of {PRIORITY_VALUES}")
        return v


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PROJECT_STATUS_VALUES:
            raise ValueError(f"status must be one of {PROJECT_STATUS_VALUES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PRIORITY_VALUES:
            raise ValueError(f"priority must be one of {PRIORITY_VALUES}")
        return v


class ProjectOut(ProjectBase):
    id: int
    product_id: int
    task_count: int = 0
    task_done_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectOutWithTasks(ProjectOut):
    tasks: list[TaskOut] = []


class ProjectOutWithProduct(ProjectOut):
    product_name: str
    product_status: str
    product_priority: str
