from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.product import Product
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut, ProjectOutWithTasks, ProjectOutWithProduct

router = APIRouter(tags=["projects"])


def _enrich(project: Project) -> ProjectOut:
    out = ProjectOut.model_validate(project)
    out.task_count = len(project.tasks)
    out.task_done_count = sum(1 for t in project.tasks if t.status == "done")
    return out


def _enrich_with_tasks(project: Project) -> ProjectOutWithTasks:
    base = _enrich(project)
    return ProjectOutWithTasks(**base.model_dump(), tasks=project.tasks)


@router.get("/api/projects", response_model=list[ProjectOutWithProduct])
def list_all_projects(
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    projects = db.query(Project).order_by(Project.created_at).all()
    result = []
    for proj in projects:
        out = ProjectOutWithProduct(
            **_enrich(proj).model_dump(),
            product_name=proj.product.name,
            product_status=proj.product.status,
            product_priority=proj.product.priority,
        )
        result.append(out)
    return result


@router.get("/api/products/{product_id}/projects", response_model=list[ProjectOut])
def list_projects(
    product_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    if not db.get(Product, product_id):
        raise HTTPException(404, "Product not found")
    projects = (
        db.query(Project)
        .filter(Project.product_id == product_id)
        .order_by(Project.created_at)
        .all()
    )
    return [_enrich(p) for p in projects]


@router.post("/api/products/{product_id}/projects", response_model=ProjectOutWithTasks, status_code=201)
def create_project(
    product_id: int,
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    if not db.get(Product, product_id):
        raise HTTPException(404, "Product not found")
    project = Project(**payload.model_dump(), product_id=product_id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return _enrich_with_tasks(project)


@router.get("/api/projects/{project_id}", response_model=ProjectOutWithTasks)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return _enrich_with_tasks(project)


@router.put("/api/projects/{project_id}", response_model=ProjectOutWithTasks)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return _enrich_with_tasks(project)


@router.delete("/api/projects/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    db.delete(project)
    db.commit()
