"""Add missing columns to credit_transactions table

Revision ID: 4e4660f3f711
Revises: 8e4c326a75ae
Create Date: 2025-09-28 05:48:28.696135

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4e4660f3f711'
down_revision = '8e4c326a75ae'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing columns to credit_transactions table
    with op.batch_alter_table('credit_transactions') as batch_op:
        batch_op.add_column(sa.Column('retirement_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('credits_amount', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('coins_amount', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('transaction_metadata', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove added columns
    with op.batch_alter_table('credit_transactions') as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('transaction_metadata')
        batch_op.drop_column('description')
        batch_op.drop_column('coins_amount')
        batch_op.drop_column('credits_amount')
        batch_op.drop_column('retirement_id')
