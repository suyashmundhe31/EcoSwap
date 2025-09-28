# app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1 import users, credits, projects, bounties, forestation, marketplace, coins
from app.api.endpoints import carbon_coins
from app.api.v1.solar_panel import router as solar_panel_router
from app.api.v1.endpoints import credit_purchase
from app.api.v1.credit_retirement import router as credit_retirement_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(users.router)
api_router.include_router(credits.router)
api_router.include_router(projects.router)
api_router.include_router(bounties.router)
api_router.include_router(solar_panel_router)  # Our new solar panel router
api_router.include_router(forestation.router)
api_router.include_router(credit_purchase.router, prefix="/credit-purchase", tags=["credit-purchase"])
api_router.include_router(credit_retirement_router, prefix="/credit-retirement", tags=["credit-retirement"])
# We'll remove solar_analysis since it's now integrated in solar_panel
api_router.include_router(marketplace.router)
api_router.include_router(coins.router)
api_router.include_router(carbon_coins.router)