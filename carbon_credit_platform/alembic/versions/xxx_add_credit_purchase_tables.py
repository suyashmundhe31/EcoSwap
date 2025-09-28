"""Add credit purchase tables

Revision ID: xxx
Revises: previous_revision
Create Date: 2024-xx-xx

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxx'
down_revision = 'b4b3a1bbc5b0'
branch_labels = None
depends_on = None

def upgrade():
    # Create user_wallets table
    op.create_table('user_wallets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_coins', sa.Float(), nullable=True, default=2500.0),
        sa.Column('available_coins', sa.Float(), nullable=True, default=2500.0),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_wallets_id'), 'user_wallets', ['id'], unique=False)
    op.create_index(op.f('ix_user_wallets_user_id'), 'user_wallets', ['user_id'], unique=True)

    # Create credit_transactions table
    op.create_table('credit_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transaction_id', sa.String(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('credit_id', sa.Integer(), nullable=True),
        sa.Column('credits_purchased', sa.Float(), nullable=True),
        sa.Column('coins_spent', sa.Float(), nullable=True),
        sa.Column('transaction_type', sa.Enum('PURCHASE', 'MINT', 'TRANSFER', name='transactiontype'), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'COMPLETED', 'FAILED', name='transactionstatus'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['credit_id'], ['marketplace_credits.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_transactions_id'), 'credit_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_credit_transactions_transaction_id'), 'credit_transactions', ['transaction_id'], unique=True)

def downgrade():
    op.drop_index(op.f('ix_credit_transactions_transaction_id'), table_name='credit_transactions')
    op.drop_index(op.f('ix_credit_transactions_id'), table_name='credit_transactions')
    op.drop_table('credit_transactions')
    op.drop_index(op.f('ix_user_wallets_user_id'), table_name='user_wallets')
    op.drop_index(op.f('ix_user_wallets_id'), table_name='user_wallets')
    op.drop_table('user_wallets')