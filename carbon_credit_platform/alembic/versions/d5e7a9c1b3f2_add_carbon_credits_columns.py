"""add_carbon_credits_columns

Revision ID: d5e7a9c1b3f2
Revises: b4d79425bd1d
Create Date: 2023-11-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5e7a9c1b3f2'
down_revision = 'b4d79425bd1d'
branch_labels = None
depends_on = None


def upgrade():
    # Add the missing columns to solar_panel_applications table
    op.add_column('solar_panel_applications', sa.Column('carbon_credits_data', sa.Text(), nullable=True))
    op.add_column('solar_panel_applications', sa.Column('carbon_coins_issued', sa.Float(), nullable=True, server_default='0'))
    op.add_column('solar_panel_applications', sa.Column('calculation_date', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    # Remove the columns if needed
    op.drop_column('solar_panel_applications', 'carbon_credits_data')
    op.drop_column('solar_panel_applications', 'carbon_coins_issued')
    op.drop_column('solar_panel_applications', 'calculation_date')