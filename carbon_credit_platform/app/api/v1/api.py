from fastapi import APIRouter
from app.api.v1 import users, credits, projects, bounties, solar_panel, forestation, solar_analysis, marketplace

api_router = APIRouter()

# Include all route modules
api_router.include_router(users.router)
api_router.include_router(credits.router)
api_router.include_router(projects.router)
api_router.include_router(bounties.router)
api_router.include_router(solar_panel.router)
api_router.include_router(forestation.router)
api_router.include_router(solar_analysis.router)
api_router.include_router(marketplace.router)
