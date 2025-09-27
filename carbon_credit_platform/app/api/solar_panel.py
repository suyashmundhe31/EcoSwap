@router.post("/solar-panel/applications")
async def create_application(
    full_name: str = Form(...),
    aadhar_card: str = Form(...),
    api_link: str = Form(...),
    company_name: str = Form(None),
    ownership_document: UploadFile = File(...),
    energy_certification: UploadFile = File(...),
    geotag_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create solar panel application with automatic carbon credit calculation"""
    try:
        service = SolarPanelService(db)
        
        # Create application
        application = service.create_application(
            user_id=current_user.id,
            application_data={
                'full_name': full_name,
                'company_name': company_name,
                'aadhar_card': aadhar_card,
                'api_link': api_link
            },
            ownership_document=ownership_document,
            energy_certification=energy_certification,
            geotag_photo=geotag_photo
        )
        
        # Calculate carbon credits
        credits_result = service.calculate_carbon_credits(
            application.id,
            current_user.id
        )
        
        # Return result with coordinates
        return {
            'id': application.id,
            'status': 'approved' if credits_result.get('success') else 'pending',
            'created_at': application.created_at.isoformat(),
            'latitude': application.latitude or 13.0827,
            'longitude': application.longitude or 77.5877,
            'carbon_credits': credits_result.get('data') if credits_result.get('success') else None
        }
        
    except Exception as e:
        print(f"Error in create_application: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/solar-panel/applications/{application_id}/calculate-carbon-credits")
async def calculate_carbon_credits(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Calculate carbon credits for an application"""
    try:
        service = SolarPanelService(db)
        result = service.calculate_carbon_credits(application_id, current_user.id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        print(f"Error calculating carbon credits: {e}")
        raise HTTPException(status_code=500, detail=str(e))