from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

VALID_COLORS = [
    "violet", "sky", "teal", "rose", "amber",
    "lime", "orange", "pink", "cyan", "indigo",
]


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(30), nullable=False, default="sky")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    products: Mapped[list["Product"]] = relationship(
        back_populates="category",
        passive_deletes=True,
    )
