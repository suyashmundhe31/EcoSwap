import React, { useState } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import MapComponent from '../../components/maps/MapComponent';
import CarbonCoinMintingSuccess from '../../components/marketplace/CarbonCoinMintingSuccess';
import forestationApiService from '../../services/forestationApi';
import forestImage from '../../assets/treespanel.png';

const ForestationForm = ({ navigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    ownershipDocument: null,
    geotagPhoto: null,
    fullName: '',
    aadharCardNumber: ''
  });
  
  const [showMaps, setShowMaps] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [extractedLat, setExtractedLat] = useState(13.0827);
  const [extractedLon, setExtractedLon] = useState(77.5877);
  const [showMintingSuccess, setShowMintingSuccess] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState(null);
  const [mintingResult, setMintingResult] = useState(null);

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMintingClose = () => {
    setShowMintingSuccess(false);
    // Navigate to carbon coin history or dashboard
    navigate('/user/carbon-coins');
  };

  const handleMintMore = () => {
    setShowMintingSuccess(false);
    // Reset to step 1 to start new application
    setCurrentStep(1);
    setFormData({
      ownershipDocument: null,
      geotagPhoto: null,
      fullName: '',
      aadharCardNumber: ''
    });
    setApplicationResult(null);
    setAnalysisResult(null);
    setCarbonCredits(null);
    setMintingResult(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.aadharCardNumber.trim()) {
      setError('Please enter your Aadhar card number');
      return false;
    }
    return true;
  };

  const submitToBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await forestationApiService.createApplication(formData);
      setApplicationResult(result);
      setSuccess('Application submitted successfully!');
      
      // Extract coordinates if available
      if (result.latitude && result.longitude) {
        setExtractedLat(result.latitude);
        setExtractedLon(result.longitude);
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (currentStep === 1) {
      if (!validateForm()) {
        return;
      }
      
      await submitToBackend();
      if (!error) {
        setCurrentStep(2);
        setShowMaps(true);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
      setShowMaps(false);
      setShowFinalResult(true);
    }
  };

  const performForestAnalysis = async () => {
    if (!applicationResult?.id) {
      setError('No application found to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await forestationApiService.performForestAnalysis(applicationResult.id);
      setAnalysisResult(result);
      
      // Extract carbon credits for minting
      if (result.carbon_credit_calculations) {
        setCarbonCredits({
          success: true,
          data: {
            annual_carbon_coins: result.carbon_credit_calculations.annual_carbon_coins,
            annual_co2_avoided_tonnes: result.carbon_credit_calculations.annual_sequestration_tonnes_co2,
            calculation_method: result.carbon_credit_calculations.calculation_method || 'IPCC Forest Carbon Sequestration Guidelines',
            application_id: applicationResult.id // Pass application ID for minting
          }
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to perform forest analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mintCarbonCoins = async () => {
    if (!applicationResult?.id || !analysisResult?.carbon_credit_calculations) {
      setError('No analysis data available for minting');
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const issuerName = formData.fullName || 'Forestation Project';
      const description = `Forestation carbon credits - ${formData.fullName} - ${analysisResult.carbon_credit_calculations.total_forest_area_ha || 0} hectares`;
      
      const result = await forestationApiService.mintCarbonCoins(
        applicationResult.id,
        issuerName,
        description
      );

      setMintingResult(result);
      
      // Update carbon credits with minting info
      setCarbonCredits(prev => ({
        ...prev,
        mintingResult: result,
        issueId: result.data?.issue_id
      }));
      
      setShowMintingSuccess(true);
      setSuccess(`Successfully minted ${result.data?.carbon_coins?.annual || 0} carbon coins!`);
      
    } catch (err) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint carbon coins');
    } finally {
      setIsMinting(false);
    }
  };

  const renderMapsView = () => {
    // Show carbon coin minting success interface if available
    if (showMintingSuccess && carbonCredits && mintingResult) {
      return (
        <CarbonCoinMintingSuccess
          carbonCredits={{
            ...carbonCredits,
            mintingResult: mintingResult,
            type: 'forestation'
          }}
          coordinates={{ latitude: extractedLat, longitude: extractedLon }}
          onClose={handleMintingClose}
          onMintMore={handleMintMore}
        />
      );
    }

    return (
      <FadeInUp>
        <div className="bg-gray-200 rounded-2xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
              Extracted GPS Coordinates from Geotagged Photo
            </h3>
            <p className="text-sm text-gray-600">
              Latitude: {extractedLat.toFixed(6)}, Longitude: {extractedLon.toFixed(6)}
            </p>
            {extractedLat === 13.0827 && extractedLon === 77.5877 && (
              <p className="text-xs text-amber-600 mt-1">
                ℹ️ Using default coordinates. Enable location services for accurate mapping.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street View Map */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="p-2 bg-gray-100">
                <h4 className="text-sm font-medium text-gray-700 text-center">Street View</h4>
              </div>
              <MapComponent 
                latitude={extractedLat} 
                longitude={extractedLon} 
                mapType="street" 
                title="Forestation Site"
                height="300px"
              />
            </div>

            {/* Satellite View Map */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="p-2 bg-gray-100">
                <h4 className="text-sm font-medium text-gray-700 text-center">Satellite View</h4>
              </div>
              <MapComponent 
                latitude={extractedLat} 
                longitude={extractedLon} 
                mapType="satellite" 
                title="Forestation Site"
                height="300px"
              />
            </div>
          </div>

          {/* Carbon Coins Calculation Display */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-green-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                🌳 FORESTATION CARBON COINS
              </h4>
              <div className="text-sm font-bold text-green-700 bg-green-200 px-3 py-1 rounded-full inline-block" style={{fontFamily: 'Space Mono, monospace'}}>
                CONVERSION RATE: 1 TON CO2 = 1 CARBON COIN
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ~8 coins/year
                </div>
                <div className="text-sm font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>
                  Per Hectare (Temperate)
                </div>
                <div className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Space Mono, monospace'}}>
                  = ~8 tons CO₂ sequestered
                </div>
              </div>
              
              {analysisResult?.carbon_credit_calculations && (
                <div className="bg-white rounded-lg p-4 text-center shadow-sm border-2 border-green-400">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {analysisResult.carbon_credit_calculations.annual_carbon_coins || 0}
                  </div>
                  <div className="text-sm font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>
                    Calculated Coins/Year
                  </div>
                  <div className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Space Mono, monospace'}}>
                    From your forest area
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-green-200 rounded-lg border border-green-400">
              <div className="text-center">
                <div className="text-sm font-bold text-green-800 mb-1" style={{fontFamily: 'Space Mono, monospace'}}>
                  💰 CARBON COIN CONVERSION
                </div>
                <div className="text-xs text-green-700" style={{fontFamily: 'Space Mono, monospace'}}>
                  Every 1 ton of CO₂ sequestered = 1 Carbon Coin earned
                </div>
              </div>
            </div>
          </div>

          {/* Forest Analysis Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-300">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-blue-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                🤖 AI-POWERED FOREST ANALYSIS
              </h4>
              <p className="text-sm text-blue-700" style={{fontFamily: 'Space Mono, monospace'}}>
                Advanced satellite imagery analysis with computer vision tree counting
              </p>
            </div>
            
            <div className="text-center">
              <button
                onClick={performForestAnalysis}
                disabled={isAnalyzing}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isAnalyzing 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Forest...</span>
                  </div>
                ) : (
                  '🌲 Analyze Forest & Calculate Carbon Credits'
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300">
              <h4 className="text-lg font-bold text-green-800 mb-4 text-center" style={{fontFamily: 'Space Mono, monospace'}}>
                📊 FOREST ANALYSIS RESULTS
              </h4>
              
              {/* Computer Vision Analysis */}
              {analysisResult.computer_vision_analysis && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                    🔬 Computer Vision Analysis
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">Vegetation Coverage:</span> {analysisResult.computer_vision_analysis.total_vegetation_coverage}%
                    </div>
                    <div>
                      <span className="font-semibold">Total Area:</span> {analysisResult.computer_vision_analysis.total_vegetation_area_sqm} m²
                    </div>
                    <div>
                      <span className="font-semibold">Tree Count:</span> {analysisResult.computer_vision_analysis.estimated_tree_count}
                    </div>
                    <div>
                      <span className="font-semibold">Confidence:</span> {analysisResult.computer_vision_analysis.analysis_confidence}
                    </div>
                  </div>
                </div>
              )}

              {/* Carbon Credit Calculations */}
              {analysisResult.carbon_credit_calculations && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                    💰 Carbon Credit Calculations
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">Forest Type:</span> {analysisResult.carbon_credit_calculations.forest_type}
                    </div>
                    <div>
                      <span className="font-semibold">Forest Area:</span> {analysisResult.carbon_credit_calculations.total_forest_area_ha} ha
                    </div>
                    <div>
                      <span className="font-semibold">Annual CO₂:</span> {analysisResult.carbon_credit_calculations.annual_sequestration_tonnes_co2} tons
                    </div>
                    <div>
                      <span className="font-semibold">Annual Coins:</span> {analysisResult.carbon_credit_calculations.annual_carbon_coins}
                    </div>
                  </div>
                </div>
              )}

              {/* Weather Data */}
              {analysisResult.weather_data && !analysisResult.weather_data.error && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                    🌡️ Current Weather Conditions
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">Temperature:</span> {analysisResult.weather_data.temperature}°C
                    </div>
                    <div>
                      <span className="font-semibold">Humidity:</span> {analysisResult.weather_data.humidity}%
                    </div>
                    <div>
                      <span className="font-semibold">Cloud Cover:</span> {analysisResult.weather_data.cloud_cover}%
                    </div>
                    <div>
                      <span className="font-semibold">Wind Speed:</span> {analysisResult.weather_data.wind_speed} km/h
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mint Carbon Coins Button */}
          {analysisResult && analysisResult.carbon_credit_calculations && !mintingResult && (
            <div className="mt-6 text-center">
              <button
                onClick={mintCarbonCoins}
                disabled={isMinting}
                className={`px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                  isMinting 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white hover:from-green-600 hover:via-emerald-600 hover:to-green-700'
                }`}
                style={{fontFamily: 'Space Mono, monospace'}}
              >
                {isMinting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Minting Coins...</span>
                  </div>
                ) : (
                  '🪙 MINT CARBON COINS NOW'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2" style={{fontFamily: 'Space Mono, monospace'}}>
                Convert your forestation impact into digital carbon coins
              </p>
            </div>
          )}

          {/* Show Minted Coins Result */}
          {mintingResult && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400">
              <div className="text-center">
                <h4 className="text-lg font-bold text-green-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                  ✅ CARBON COINS MINTED SUCCESSFULLY!
                </h4>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {mintingResult.data?.carbon_coins?.annual || 0} Carbon Coins
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Issue ID: {mintingResult.data?.issue_id}
                </p>
                <button
                  onClick={() => setShowMintingSuccess(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowFinalResult(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Proceed to Final Results
            </button>
          </div>
        </div>
      </FadeInUp>
    );
  };

  const renderStepContent = () => {
    if (showFinalResult) {
      return (
        <FadeInUp>
          <div className="bg-gray-200 rounded-2xl p-8 text-center">
            <div className="bg-white rounded-xl p-12 mb-6 inline-block">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-28 h-28 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center border-4 border-green-200">
                    <svg className="w-16 h-16 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-300 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-2xl font-bold text-gray-900" style={{fontFamily: 'Space Mono, monospace'}}>
              <div className="w-8 h-8 bg-green-400 rounded-full"></div>
              <span>APPLICATION COMPLETED</span>
            </div>
            
            {applicationResult && (
              <div className="mt-4 text-sm text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>
                <p>Application ID: {applicationResult.id}</p>
                <p>Status: {applicationResult.status}</p>
                <p>Submitted: {new Date(applicationResult.created_at).toLocaleDateString()}</p>
                {mintingResult && (
                  <p className="text-green-600 font-bold mt-2">
                    Carbon Coins Minted: {mintingResult.data?.carbon_coins?.annual || 0}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/user/carbon-coins')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-3"
              >
                View Carbon Coin History
              </button>
              <button
                onClick={handleMintMore}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start New Application
              </button>
            </div>
          </div>
        </FadeInUp>
      );
    }

    if (showMaps) {
      return renderMapsView();
    }

    return (
      <FadeInUp>
        <div className="bg-gray-200 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                style={{fontFamily: 'Space Mono, monospace'}}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>Aadhar card number</label>
              <input
                type="text"
                value={formData.aadharCardNumber}
                onChange={(e) => handleInputChange('aadharCardNumber', e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                style={{fontFamily: 'Space Mono, monospace'}}
                placeholder="Enter Aadhar card number"
                maxLength="12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-4" style={{fontFamily: 'Space Mono, monospace'}}>Ownership Document</h3>
              <div className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="ownership-forest"
                  className="hidden"
                  onChange={(e) => handleFileUpload('ownershipDocument', e.target.files[0])}
                />
                <label htmlFor="ownership-forest" className="cursor-pointer">
                  <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500" style={{fontFamily: 'Space Mono, monospace'}}>Upload or PDF here</p>
                </label>
                {formData.ownershipDocument && (
                  <div className="mt-3 text-xs text-green-600 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
                    ✓ {formData.ownershipDocument.name}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-4" style={{fontFamily: 'Space Mono, monospace'}}>Geotag Photo</h3>
              <div className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="geotag-forest"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('geotagPhoto', e.target.files[0])}
                />
                <label htmlFor="geotag-forest" className="cursor-pointer">
                  <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500" style={{fontFamily: 'Space Mono, monospace'}}>Upload or PDF here</p>
                </label>
                {formData.geotagPhoto && (
                  <div className="mt-3 text-xs text-green-600 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
                    ✓ {formData.geotagPhoto.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl" style={{ fontFamily: 'Space Mono, monospace' }}>
      {/* Header with Navigation */}
      <FadeInUp>
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => navigate('/user/issue-coins/solar')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
            style={{fontFamily: 'Space Mono, monospace'}}
          >
            Solar Panel
          </button>
          <button 
            className="bg-black text-white px-8 py-3 rounded-full font-medium"
            style={{fontFamily: 'Space Mono, monospace'}}
          >
            Forestation
          </button>
        </div>
      </FadeInUp>

      {/* Carbon Coin Conversion Banner */}
      <FadeInUp delay={50}>
        <div className="bg-gradient-to-r from-green-100 via-blue-100 to-green-100 rounded-2xl p-6 mb-6 border-2 border-green-300 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
              🌳 CARBON COIN SYSTEM
            </h2>
            <div className="text-lg font-bold text-green-700 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
              CONVERSION RATE: 1 TON CO₂ = 1 CARBON COIN
            </div>
            <p className="text-sm text-green-600" style={{fontFamily: 'Space Mono, monospace'}}>
              Earn Carbon Coins by sequestering CO₂ through forestation projects
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Forest Hero Image */}
      <FadeInUp delay={100}>
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-lg">
          {forestImage ? (
            <img 
              src={forestImage} 
              alt="Forest Conservation" 
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-0 left-0 right-0 h-32">
                <svg viewBox="0 0 400 100" className="w-full h-full fill-green-900 opacity-60">
                  <polygon points="0,100 0,60 20,40 40,60 60,30 80,50 100,20 120,40 140,10 160,30 180,50 200,25 220,45 240,35 260,55 280,30 300,50 320,40 340,60 360,35 380,55 400,45 400,100" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20"></div>
            </div>
          )}
          
          <div className="absolute bottom-6 right-6 bg-white px-6 py-3 rounded-full shadow-lg">
            <span className="font-semibold text-gray-900" style={{fontFamily: 'Space Mono, monospace'}}>Forestation</span>
          </div>
        </div>
      </FadeInUp>

      {/* Progress Steps */}
      <FadeInUp delay={200}>
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              currentStep >= 1 ? 'bg-black' : 'bg-gray-300'
            }`} style={{fontFamily: 'Space Mono, monospace'}}>
              1
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Details</div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              currentStep >= 2 ? 'bg-black' : 'bg-gray-300'
            }`} style={{fontFamily: 'Space Mono, monospace'}}>
              2
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Verification</div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              currentStep >= 3 ? 'bg-black' : 'bg-gray-300'
            }`} style={{fontFamily: 'Space Mono, monospace'}}>
              3
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Issued Coin</div>
          </div>
        </div>
      </FadeInUp>

      {/* Error Message */}
      {error && (
        <FadeInUp delay={300}>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span style={{fontFamily: 'Space Mono, monospace'}}>{error}</span>
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Success Message */}
      {success && (
        <FadeInUp delay={300}>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span style={{fontFamily: 'Space Mono, monospace'}}>{success}</span>
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Submit Button */}
      {!showFinalResult && !showMaps && (
        <FadeInUp delay={400}>
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`px-12 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              style={{fontFamily: 'Space Mono, monospace'}}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {currentStep === 1 ? 'Submitting...' : 'Processing...'}
                </div>
              ) : (
                currentStep === 1 ? 'Submit Application' : 'Continue'
              )}
            </button>
          </div>
        </FadeInUp>
      )}
    </div>
  );
};

export default ForestationForm;