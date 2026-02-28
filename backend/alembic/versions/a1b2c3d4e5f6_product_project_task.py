"""Add products/projects/tasks hierarchy

Revision ID: a1b2c3d4e5f6
Revises: 4d84264c2c9e
Create Date: 2026-02-27

Renames:
  projects  → products   (keeps all rich-metadata columns)
  features  → tasks      (FK moves from products to new lightweight projects)

Adds:
  projects  (new, lightweight: product_id FK, name, description, status, priority)
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '4d84264c2c9e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create products table (full metadata, same columns as old projects) ──
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('priority', sa.String(length=10), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('staging_url', sa.String(length=500), nullable=True),
        sa.Column('live_url', sa.String(length=500), nullable=True),
        sa.Column('code_repo', sa.String(length=500), nullable=True),
        sa.Column('hosting_platform', sa.String(length=100), nullable=True),
        sa.Column('network_access', sa.String(length=100), nullable=True),
        sa.Column('tech_stack', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('products') as batch_op:
        batch_op.create_index('ix_products_id', ['id'], unique=False)
        batch_op.create_index('ix_products_name', ['name'], unique=False)
        batch_op.create_index('ix_products_category_id', ['category_id'], unique=False)

    # ── 2. Copy all existing projects → products (map old status → product stage) ──
    op.execute(
        "INSERT INTO products "
        "(id, name, description, status, priority, category_id, staging_url, live_url, "
        " code_repo, hosting_platform, network_access, tech_stack, notes, created_at, updated_at) "
        "SELECT id, name, description, "
        "  CASE status "
        "    WHEN 'active'    THEN 'in_kitchen' "
        "    WHEN 'planned'   THEN 'in_garage' "
        "    WHEN 'paused'    THEN 'in_garage' "
        "    WHEN 'completed' THEN 'in_dining_room' "
        "    ELSE 'in_garage' "
        "  END, "
        "  priority, category_id, staging_url, live_url, "
        "  code_repo, hosting_platform, network_access, tech_stack, notes, created_at, updated_at "
        "FROM projects"
    )

    # ── 3. Drop old projects table (SQLite won't enforce FK from features) ──
    #    features.project_id still holds product IDs — we map them in step 7.
    op.execute("DROP TABLE projects")

    # ── 4. Create new lightweight projects table ───────────────────────────
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='planned'),
        sa.Column('priority', sa.String(length=10), nullable=False, server_default='medium'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('projects') as batch_op:
        batch_op.create_index('ix_projects_id', ['id'], unique=False)
        batch_op.create_index('ix_projects_product_id', ['product_id'], unique=False)

    # ── 5. Insert one default "Main" project for every product ─────────────
    op.execute(
        "INSERT INTO projects (product_id, name, status, priority, created_at, updated_at) "
        "SELECT id, 'Main', 'planned', 'medium', created_at, updated_at FROM products"
    )

    # ── 6. Add new_project_id column to features (nullable staging column) ─
    with op.batch_alter_table('features') as batch_op:
        batch_op.add_column(sa.Column('new_project_id', sa.Integer(), nullable=True))

    # ── 7. Map each feature to its product's default project ───────────────
    #    features.project_id currently holds a product_id value;
    #    find the project whose product_id matches.
    op.execute(
        "UPDATE features SET new_project_id = ("
        "  SELECT p.id FROM projects p WHERE p.product_id = features.project_id"
        ")"
    )

    # ── 8. Create tasks table with correct FK (→ new projects) ────────────
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('priority', sa.String(length=10), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.create_index('ix_tasks_id', ['id'], unique=False)
        batch_op.create_index('ix_tasks_project_id', ['project_id'], unique=False)

    # ── 9. Copy features → tasks using the new project_id mapping ─────────
    op.execute(
        "INSERT INTO tasks (id, project_id, title, status, priority, sort_order, created_at, updated_at) "
        "SELECT f.id, COALESCE(f.new_project_id, (SELECT p.id FROM projects p LIMIT 1)), "
        "       f.title, f.status, f.priority, f.sort_order, f.created_at, f.updated_at "
        "FROM features f"
    )

    # ── 10. Drop features table ────────────────────────────────────────────
    op.execute("DROP TABLE features")


def downgrade() -> None:
    raise NotImplementedError(
        "Downgrade not supported for this migration. "
        "Restore from a database backup if needed."
    )
