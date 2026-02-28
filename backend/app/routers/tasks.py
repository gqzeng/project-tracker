from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.project import Project
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskOutWithContext, ReorderItem

router = APIRouter(tags=["tasks"])


@router.get("/api/tasks", response_model=list[TaskOutWithContext])
def list_all_tasks(
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    tasks = db.query(Task).order_by(Task.sort_order).all()
    return [
        TaskOutWithContext(
            **TaskOut.model_validate(t).model_dump(),
            project_name=t.project.name,
            product_id=t.project.product_id,
            product_name=t.project.product.name,
        )
        for t in tasks
    ]


@router.get("/api/projects/{project_id}/tasks", response_model=list[TaskOut])
def list_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    if not db.get(Project, project_id):
        raise HTTPException(404, "Project not found")
    return (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.sort_order)
        .all()
    )


@router.post("/api/projects/{project_id}/tasks", response_model=TaskOut, status_code=201)
def create_task(
    project_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    if not db.get(Project, project_id):
        raise HTTPException(404, "Project not found")
    max_order = db.query(Task).filter(Task.project_id == project_id).count()
    task = Task(**payload.model_dump(exclude={"sort_order"}), project_id=project_id, sort_order=max_order)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/api/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task)
    db.commit()


@router.post("/api/tasks/reorder", status_code=204)
def reorder_tasks(
    items: list[ReorderItem],
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    for item in items:
        db.query(Task).filter(Task.id == item.id).update({"sort_order": item.sort_order})
    db.commit()
