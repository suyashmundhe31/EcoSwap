import React, { useState } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';

import forestImage from '../../assets/treespanel.png';

const ForestationForm = ({ navigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    ownershipDocument: null,
    geotagPhoto: null,
    fullName: '',
    aadharCardNumber: ''
  });
  const [showMaps, setShowMaps] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  const handleFileUpload = (field, file) => {
    // Check if photo is geotagged (mock validation)
    if (field === 'geotagPhoto' && file) {
      // Mock geotag validation - in real app, check EXIF data
      const hasGeotag = Math.random() > 0.3; // 70% chance of having geotag
      if (!hasGeotag) {
        alert('⚠️ This photo is not geotagged. Please upload a photo with location data.');
        return;
      }
    }
    
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

  const handleSubmit = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setShowMaps(true);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      setShowMaps(false);
      setShowFinalResult(true);
    }
  };

  const renderStepContent = () => {
    if (showFinalResult) {
      return (
        <FadeInUp>
          <div className="bg-gray-200 rounded-2xl p-8 text-center">
            <div className="bg-white rounded-xl p-12 mb-6 inline-block">
              {/* Golden Coin Icon */}
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-28 h-28 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-4 border-yellow-200">
                    <span className="text-4xl font-bold text-yellow-900">$</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-2xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
              <span>2350 ISSUED</span>
            </div>
          </div>
        </FadeInUp>
      );
    }

    if (showMaps) {
      return (
        <FadeInUp>
          <div className="bg-gray-200 rounded-2xl p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Extracted Co-ordinates Summary (13.874957858, -310.454364430)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street View Map Placeholder */}
              <div className="bg-gray-300 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="bg-black text-white px-3 py-1 rounded text-sm font-medium">
                    Street View
                  </div>
                </div>
              </div>

              {/* Satellite View Map Placeholder */}
              <div className="bg-gray-300 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="bg-black text-white px-3 py-1 rounded text-sm font-medium">
                    Satellite View
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
      );
    }

    return (
      <FadeInUp>
        <div className="bg-gray-200 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Aadhar Card Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar card number</label>
              <input
                type="text"
                value={formData.aadharCardNumber}
                onChange={(e) => handleInputChange('aadharCardNumber', e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="Enter Aadhar card number"
                maxLength="12"
              />
            </div>
          </div>

          {/* File Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ownership Document */}
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ownership Document</h3>
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
                  <p className="text-sm text-gray-500">Upload or PDF here</p>
                </label>
              </div>
            </div>

            {/* Geotag Photo */}
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Geotag Photo</h3>
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
                  <p className="text-sm text-gray-500">Upload or PDF here</p>
                </label>
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header with Navigation */}
      <FadeInUp>
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => {
              console.log('Navigating to Solar Panel');
              navigate('/user/issue-coins/solar');
            }}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
          >
            Solar Panel
          </button>
          <button className="bg-black text-white px-8 py-3 rounded-full font-medium">
            Forestation
          </button>
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
            // Fallback forest illustration
            <div className="w-full h-64 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              {/* Forest silhouette pattern */}
              <div className="absolute bottom-0 left-0 right-0 h-32">
                <svg viewBox="0 0 400 100" className="w-full h-full fill-green-900 opacity-60">
                  <polygon points="0,100 0,60 20,40 40,60 60,30 80,50 100,20 120,40 140,10 160,30 180,50 200,25 220,45 240,35 260,55 280,30 300,50 320,40 340,60 360,35 380,55 400,45 400,100" />
                </svg>
              </div>
              {/* Mist effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20"></div>
            </div>
          )}
          
          {/* Forestation Label */}
          <div className="absolute bottom-6 right-6 bg-white px-6 py-3 rounded-full shadow-lg">
            <span className="font-semibold text-gray-900">Forestation</span>
          </div>
        </div>
      </FadeInUp>

      {/* Progress Steps */}
      <FadeInUp delay={200}>
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              currentStep >= 1 ? 'bg-black' : 'bg-gray-300'
            }`}>
              1
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700">Details</div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              currentStep >= 2 ? 'bg-black' : 'bg-gray-300'
            }`}>
              2
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700">Verification</div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              currentStep >= 3 ? 'bg-black' : 'bg-gray-300'
            }`}>
              3
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700">Issued Coin</div>
          </div>
        </div>
      </FadeInUp>

      {/* Step Content */}
      {renderStepContent()}

      {/* Submit Button */}
      {!showFinalResult && (
        <FadeInUp delay={400}>
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleSubmit}
              className="bg-black text-white px-12 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              Submit
            </button>
          </div>
        </FadeInUp>
      )}
    </div>
  );
};

export default ForestationForm;