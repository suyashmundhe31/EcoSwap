from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict
import asyncio

from app.database import get_db
from app.services.solar_panel_service import SolarPanelService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/solar-panel/complete-analysis/{application_id}")
async def perform_complete_solar_analysis(
    application_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform complete solar analysis with satellite imagery and carbon credit calculation"""
    try:
        solar_service = SolarPanelService(db)
        
        # Perform the complete analysis
        result = await solar_service.perform_complete_solar_analysis(application_id, current_user.id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "message": "Complete solar analysis performed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/solar-panel/carbon-credits/{application_id}")
async def get_carbon_credits(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get carbon credit calculation for solar application"""
    try:
        solar_service = SolarPanelService(db)
        
        # Use the legacy method which now uses the complete analysis
        result = solar_service.calculate_carbon_credits(application_id, current_user.id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "message": "Carbon credit calculation completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Carbon credit calculation failed: {str(e)}")
