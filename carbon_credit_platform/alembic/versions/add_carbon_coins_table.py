"""Add carbon coins table

Revision ID: add_carbon_coins
Revises: 51afce80b5c9
Create Date: 2025-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_carbon_coins'
down_revision = '51afce80b5c9'  # Replace with your latest revision
branch_labels = None
depends_on = None

def upgrade():
    # Create enum type for coin source
    coin_source_enum = postgresql.ENUM('solar_panel', 'forestation', name='coinsource')
    coin_source_enum.create(op.get_bind())
    
    # Create carbon_coin_issues table
    op.create_table(
        'carbon_coin_issues',
        sa.Column('issue_id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('company_name', sa.String(), nullable=True),
        sa.Column('coins_issued', sa.Float(), nullable=False),
        sa.Column('source', coin_source_enum, nullable=False),
        sa.Column('source_application_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('calculation_method', sa.String(), nullable=True),
        sa.Column('issue_date', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes
    op.create_index('ix_carbon_coin_issues_user_id', 'carbon_coin_issues', ['user_id'])
    op.create_index('ix_carbon_coin_issues_source', 'carbon_coin_issues', ['source'])
    op.create_index('ix_carbon_coin_issues_issue_date', 'carbon_coin_issues', ['issue_date'])

def downgrade():
    # Drop table and indexes
    op.drop_index('ix_carbon_coin_issues_issue_date', 'carbon_coin_issues')
    op.drop_index('ix_carbon_coin_issues_source', 'carbon_coin_issues')
    op.drop_index('ix_carbon_coin_issues_user_id', 'carbon_coin_issues')
    op.drop_table('carbon_coin_issues')
    
    # Drop enum type
    coin_source_enum = postgresql.ENUM('solar_panel', 'forestation', name='coinsource')
    coin_source_enum.drop(op.get_bind())
