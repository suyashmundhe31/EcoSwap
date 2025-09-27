import React, { useState, useEffect } from 'react';
import FadeInUp from '../animations/FadeInUp';

const CarbonCoinMintingSuccess = ({ 
  carbonCredits, 
  coordinates, 
  onClose, 
  onMintMore 
}) => {
  const [mintingStatus, setMintingStatus] = useState('minting');
  const [mintingResult, setMintingResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Simulate minting process
    const mintingTimer = setTimeout(() => {
      setMintingStatus('success');
    }, 2000);

    return () => clearTimeout(mintingTimer);
  }, []);

  const handleMintCoins = async () => {
    try {
      setMintingStatus('minting');
      
      // Determine if this is solar panel or forestation minting
      const isSolarPanel = carbonCredits.annual_energy_mwh !== undefined;
      
      if (isSolarPanel) {
        // Solar Panel Minting
        const solarPanelApiService = (await import('../../services/solarPanelApi')).default;
        
        const mintingData = {
          latitude: coordinates?.latitude || 13.0827,
          longitude: coordinates?.longitude || 77.5877,
          annual_energy_mwh: carbonCredits.annual_energy_mwh,
          annual_co2_avoided_tonnes: carbonCredits.annual_co2_avoided_tonnes,
          annual_carbon_credits: carbonCredits.annual_carbon_credits,
          calculation_method: carbonCredits.calculation_method,
          issuer_name: 'Solar Panel Owner',
          description: `Solar panel carbon credits - ${carbonCredits.annual_energy_mwh} MWh annual production`,
          price_per_coin: 15.0
        };

        const result = await solarPanelApiService.mintCarbonCoins(mintingData);
        
        if (result.success) {
          setMintingResult(result.data);
          setMintingStatus('success');
        } else {
          setMintingStatus('error');
        }
      } else {
        // Forestation Minting
        const forestationApiService = (await import('../../services/forestationApi')).default;
        
        const mintingData = {
          issuer_name: 'Forestation Owner',
          description: `Forestation carbon credits - ${carbonCredits.annual_carbon_coins} coins annually`,
          price_per_coin: 20.0
        };

        // For forestation, we need the application ID - this should be passed as a prop
        const applicationId = carbonCredits.application_id || 1; // fallback
        
        const result = await forestationApiService.mintCoins(applicationId, mintingData);
        
        if (result.success) {
          setMintingResult(result.data);
          setMintingStatus('success');
        } else {
          setMintingStatus('error');
        }
      }
    } catch (error) {
      console.error('Minting error:', error);
      setMintingStatus('error');
    }
  };

  const renderMintingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Spinning coin animation */}
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-spin">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-200">
            <span className="text-2xl font-bold text-yellow-900">₵</span>
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
          MINTING CARBON COINS...
        </h3>
        <p className="text-sm text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>
          Processing your environmental impact
        </p>
      </div>
    </div>
  );

  const renderSuccessResult = () => (
    <div className="py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
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
        
        <h2 className="text-3xl font-bold text-green-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
          🪙 CARBON COINS MINTED!
        </h2>
        <p className="text-lg text-green-700" style={{fontFamily: 'Space Mono, monospace'}}>
          Your environmental impact has been tokenized
        </p>
      </div>

      {/* Carbon Coins Summary */}
      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-yellow-300 shadow-lg mb-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-yellow-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
            🎉 MINTING SUCCESSFUL
          </h3>
          <div className="text-sm font-bold text-yellow-700 bg-yellow-200 px-4 py-2 rounded-full inline-block" style={{fontFamily: 'Space Mono, monospace'}}>
            CONVERSION RATE: 1 TON CO₂ = 1 CARBON COIN
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Annual Coins */}
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border-2 border-yellow-200">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {carbonCredits.carbon_coins?.annual || carbonCredits.annual_co2_avoided_tonnes} coins
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
              Annual Carbon Coins
            </div>
            <div className="text-xs text-gray-500" style={{fontFamily: 'Space Mono, monospace'}}>
              = {carbonCredits.annual_co2_avoided_tonnes} tons CO₂ avoided per year
            </div>
          </div>
          
          {/* 10-Year Coins */}
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border-2 border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {carbonCredits.carbon_coins?.ten_year || (carbonCredits.annual_co2_avoided_tonnes * 10)} coins
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
              10-Year Projection
            </div>
            <div className="text-xs text-gray-500" style={{fontFamily: 'Space Mono, monospace'}}>
              = {(carbonCredits.annual_co2_avoided_tonnes * 10).toFixed(2)} tons CO₂ avoided
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        {mintingResult?.carbon_coins?.transaction_id && (
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
            <div className="text-center">
              <div className="text-sm font-bold text-yellow-800 mb-1" style={{fontFamily: 'Space Mono, monospace'}}>
                🔗 TRANSACTION ID
              </div>
              <div className="text-xs text-yellow-700 font-mono bg-yellow-200 px-3 py-1 rounded" style={{fontFamily: 'Space Mono, monospace'}}>
                {mintingResult.carbon_coins.transaction_id}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Impact */}
      {mintingResult?.environmental_impact && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 shadow-lg mb-6">
          <h4 className="text-xl font-bold text-green-800 mb-4 text-center" style={{fontFamily: 'Space Mono, monospace'}}>
            🌍 ENVIRONMENTAL IMPACT
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {mintingResult.environmental_impact.co2_avoided_per_year}
              </div>
              <div className="text-sm font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>
                CO₂ Avoided
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {mintingResult.environmental_impact.equivalent_trees_planted}
              </div>
              <div className="text-sm font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>
                Trees Equivalent
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {mintingResult.environmental_impact.cars_off_road_equivalent}
              </div>
              <div className="text-sm font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>
                Cars Off Road
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          style={{fontFamily: 'Space Mono, monospace'}}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        <button
          onClick={onMintMore}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          style={{fontFamily: 'Space Mono, monospace'}}
        >
          Mint More Coins
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          style={{fontFamily: 'Space Mono, monospace'}}
        >
          Close
        </button>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h5 className="text-lg font-bold text-gray-800 mb-4" style={{fontFamily: 'Space Mono, monospace'}}>
            📊 DETAILED CALCULATION DATA
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Energy Generation:</p>
              <p className="text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>{carbonCredits.annual_energy_mwh} MWh/year</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Calculation Method:</p>
              <p className="text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>{carbonCredits.calculation_method}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Coordinates:</p>
              <p className="text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>
                {coordinates?.latitude?.toFixed(6)}, {coordinates?.longitude?.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700" style={{fontFamily: 'Space Mono, monospace'}}>Issue Date:</p>
              <p className="text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>
                {mintingResult?.carbon_coins?.issue_date ? 
                  new Date(mintingResult.carbon_coins.issue_date).toLocaleDateString() : 
                  new Date().toLocaleDateString()
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="py-8 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-red-800 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
        MINTING FAILED
      </h3>
      <p className="text-red-600 mb-6" style={{fontFamily: 'Space Mono, monospace'}}>
        There was an error minting your carbon coins. Please try again.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleMintCoins}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          style={{fontFamily: 'Space Mono, monospace'}}
        >
          Retry Minting
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          style={{fontFamily: 'Space Mono, monospace'}}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <FadeInUp>
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
        {mintingStatus === 'minting' && renderMintingAnimation()}
        {mintingStatus === 'success' && renderSuccessResult()}
        {mintingStatus === 'error' && renderErrorState()}
      </div>
    </FadeInUp>
  );
};

export default CarbonCoinMintingSuccess;
