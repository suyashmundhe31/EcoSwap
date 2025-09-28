"""Merge multiple heads

Revision ID: 8e4c326a75ae
Revises: 4b023cda65ae, add_carbon_coins, xxx
Create Date: 2025-09-28 05:47:15.719243

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8e4c326a75ae'
down_revision = ('4b023cda65ae', 'add_carbon_coins', 'xxx')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
