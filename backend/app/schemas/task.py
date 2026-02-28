from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator

TASK_STATUS_VALUES = {"todo", "in_progress", "done", "blocked"}
PRIORITY_VALUES = {"low", "medium", "high"}


class TaskBase(BaseModel):
    title: str
    status: str = "todo"
    priority: str = "medium"
    sort_order: int = 0

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in TASK_STATUS_VALUES:
            raise ValueError(f"status must be one of {TASK_STATUS_VALUES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in PRIORITY_VALUES:
            raise ValueError(f"priority must be one of {PRIORITY_VALUES}")
        return v


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    sort_order: Optional[int] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in TASK_STATUS_VALUES:
            raise ValueError(f"status must be one of {TASK_STATUS_VALUES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PRIORITY_VALUES:
            raise ValueError(f"priority must be one of {PRIORITY_VALUES}")
        return v


class TaskOut(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskOutWithContext(TaskOut):
    project_name: str
    product_id: int
    product_name: str


class ReorderItem(BaseModel):
    id: int
    sort_order: int
