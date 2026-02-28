from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="in_garage")
    priority: Mapped[str] = mapped_column(String(10), nullable=False, default="medium")

    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    staging_url: Mapped[Optional[str]] = mapped_column(String(500))
    live_url: Mapped[Optional[str]] = mapped_column(String(500))
    code_repo: Mapped[Optional[str]] = mapped_column(String(500))
    hosting_platform: Mapped[Optional[str]] = mapped_column(String(100))
    network_access: Mapped[Optional[str]] = mapped_column(String(100))
    tech_stack: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    doc_url: Mapped[Optional[str]] = mapped_column(String(500))
    features: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    category: Mapped[Optional["Category"]] = relationship(back_populates="products")
    projects: Mapped[list["Project"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="Project.created_at",
    )
