from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductOutWithProjects
from app.schemas.project import ProjectOut

router = APIRouter(prefix="/api/products", tags=["products"])


def _enrich(product: Product, db: Session) -> ProductOut:
    out = ProductOut.model_validate(product)
    if product.category:
        out.category_name = product.category.name
        out.category_color = product.category.color
    out.project_count = len(product.projects)
    out.task_count = sum(len(p.tasks) for p in product.projects)
    out.task_done_count = sum(
        1 for p in product.projects for t in p.tasks if t.status == "done"
    )
    return out


def _enrich_with_projects(product: Product, db: Session) -> ProductOutWithProjects:
    base = _enrich(product, db)
    projects = [
        ProjectOut(
            id=p.id,
            product_id=p.product_id,
            name=p.name,
            description=p.description,
            status=p.status,
            priority=p.priority,
            task_count=len(p.tasks),
            task_done_count=sum(1 for t in p.tasks if t.status == "done"),
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in product.projects
    ]
    return ProductOutWithProjects(**base.model_dump(), projects=projects)


@router.get("", response_model=list[ProductOutWithProjects])
def list_products(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
    sort: str = Query("updated_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    query = db.query(Product)

    if status:
        query = query.filter(Product.status == status)
    if priority:
        query = query.filter(Product.priority == priority)
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    if q:
        query = query.filter(
            Product.name.ilike(f"%{q}%") | Product.description.ilike(f"%{q}%")
        )

    sort_col = getattr(Product, sort, Product.updated_at)
    if order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    return [_enrich_with_projects(p, db) for p in query.all()]


@router.post("", response_model=ProductOutWithProjects, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return _enrich_with_projects(product, db)


@router.get("/{product_id}", response_model=ProductOutWithProjects)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return _enrich_with_projects(product, db)


@router.put("/{product_id}", response_model=ProductOutWithProjects)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)
    return _enrich_with_projects(product, db)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
