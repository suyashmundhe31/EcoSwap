import React, { useState } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import solarPanelApiService from '../../services/solarPanelApi';

import solarImage from '../../assets/solarpanel.png';

const SolarPanelForm = ({ navigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    ownershipDocument: null,
    energyCertification: null,
    geotagPhoto: null,
    fullName: '',
    companyName: '',
    aadharCard: '',
    apiLink: ''
  });
  const [showMaps, setShowMaps] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [applicationResult, setApplicationResult] = useState(null);

  const handleFileUpload = (field, file) => {
    if (!file) return;
    
    // Create a new File object to avoid file locking issues on Windows
    const newFile = new File([file], file.name, {
      type: file.type,
      lastModified: file.lastModified
    });
    
    setFormData(prev => ({
      ...prev,
      [field]: newFile
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'aadharCard', 'apiLink'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate URL format
    if (formData.apiLink) {
      let url = formData.apiLink.trim();
      // Auto-prepend https:// if no protocol is provided
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        setFormData(prev => ({ ...prev, apiLink: url }));
      }
      
      // Basic URL validation
      try {
        new URL(url);
      } catch {
        setError('Please enter a valid URL for the API link');
        return false;
      }
    }

    if (!formData.ownershipDocument) {
      setError('Please upload an ownership document');
      return false;
    }

    if (!formData.energyCertification) {
      setError('Please upload an energy certification document');
      return false;
    }

    if (!formData.geotagPhoto) {
      setError('Please upload a geotagged photo');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked, current step:', currentStep);
    
    if (currentStep === 1) {
      if (!validateForm()) {
        return;
      }
      
      setCurrentStep(2);
      setShowMaps(true);
      setError(null);
    } else if (currentStep === 2) {
      // Submit the application
      console.log('Submitting application with data:', formData);
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await solarPanelApiService.createApplication(formData);
        console.log('API response:', result);
        setApplicationResult(result);
        setCurrentStep(3);
        setShowMaps(false);
        setShowFinalResult(true);
        setSuccess('Application submitted successfully!');
      } catch (err) {
        console.error('API error:', err);
        setError(`Failed to submit application: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    if (showFinalResult) {
      return (
        <FadeInUp>
          <div className="bg-gray-200 rounded-2xl p-8 text-center">
            <div className="bg-white rounded-xl p-12 mb-6 inline-block">
              {/* Success Icon */}
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
              <span>APPLICATION SUBMITTED</span>
            </div>
            
            {applicationResult && (
              <div className="mt-4 text-sm text-gray-600" style={{fontFamily: 'Space Mono, monospace'}}>
                <p>Application ID: {applicationResult.id}</p>
                <p>Status: {applicationResult.status}</p>
                <p>Submitted: {new Date(applicationResult.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </FadeInUp>
      );
    }

    if (showMaps) {
      return (
        <FadeInUp>
          <div className="bg-gray-200 rounded-2xl p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
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
                  <div className="bg-black text-white px-3 py-1 rounded text-sm font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
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
                  <div className="bg-black text-white px-3 py-1 rounded text-sm font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
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
        <div className="bg-gray-200 rounded-2xl p-8">
          {/* Form Fields Section */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-150 pb-3" style={{fontFamily: 'Space Mono, monospace'}}>
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3" style={{fontFamily: 'Space Mono, monospace'}}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full p-4 bg-gray-25 border-2 border-gray-150 rounded-lg text-gray-800 placeholder-gray-350 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  style={{fontFamily: 'Space Mono, monospace'}}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Company Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3" style={{fontFamily: 'Space Mono, monospace'}}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full p-4 bg-gray-25 border-2 border-gray-150 rounded-lg text-gray-800 placeholder-gray-350 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  style={{fontFamily: 'Space Mono, monospace'}}
                  placeholder="Enter company name (optional)"
                />
              </div>

              {/* Aadhar Card Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3" style={{fontFamily: 'Space Mono, monospace'}}>
                  Aadhar Card Number *
                </label>
                <input
                  type="text"
                  value={formData.aadharCard}
                  onChange={(e) => handleInputChange('aadharCard', e.target.value)}
                  className="w-full p-4 bg-gray-25 border-2 border-gray-150 rounded-lg text-gray-800 placeholder-gray-350 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  style={{fontFamily: 'Space Mono, monospace'}}
                  placeholder="XXXX XXXX XXXX"
                  maxLength="14"
                  required
                />
              </div>

              {/* API Link Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3" style={{fontFamily: 'Space Mono, monospace'}}>
                  Google HRW API Link *
                </label>
                <input
                  type="url"
                  value={formData.apiLink}
                  onChange={(e) => handleInputChange('apiLink', e.target.value)}
                  className="w-full p-4 bg-gray-25 border-2 border-gray-150 rounded-lg text-gray-800 placeholder-gray-350 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  style={{fontFamily: 'Space Mono, monospace'}}
                  placeholder="https://api.google.com/..."
                  required
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-150 pb-3" style={{fontFamily: 'Space Mono, monospace'}}>
              Required Documents
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Ownership Document */}
              <div className="text-center">
                <label className="block text-sm font-semibold text-gray-700 mb-4" style={{fontFamily: 'Space Mono, monospace'}}>
                  Ownership Document *
                </label>
                <div className="bg-gray-25 rounded-xl p-8 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-75 transition-all cursor-pointer group">
                  <input
                    type="file"
                    id="ownership"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('ownershipDocument', e.target.files[0])}
                  />
                  <label htmlFor="ownership" className="cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-350 group-hover:text-gray-400 transition-colors">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                      Upload PDF or DOC
                    </p>
                    <p className="text-xs text-gray-300" style={{fontFamily: 'Space Mono, monospace'}}>
                      Property ownership proof
                    </p>
                  </label>
                  {formData.ownershipDocument && (
                    <div className="mt-3 text-xs text-green-600 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
                      ✓ {formData.ownershipDocument.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Renewable Energy Certification */}
              <div className="text-center">
                <label className="block text-sm font-semibold text-gray-700 mb-4" style={{fontFamily: 'Space Mono, monospace'}}>
                  Energy Certification *
                </label>
                <div className="bg-gray-25 rounded-xl p-8 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-75 transition-all cursor-pointer group">
                  <input
                    type="file"
                    id="certification"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('energyCertification', e.target.files[0])}
                  />
                  <label htmlFor="certification" className="cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-350 group-hover:text-gray-400 transition-colors">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                      Upload PDF or DOC
                    </p>
                    <p className="text-xs text-gray-300" style={{fontFamily: 'Space Mono, monospace'}}>
                      Renewable energy certificate
                    </p>
                  </label>
                  {formData.energyCertification && (
                    <div className="mt-3 text-xs text-green-600 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
                      ✓ {formData.energyCertification.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Geotag Photo */}
              <div className="text-center">
                <label className="block text-sm font-semibold text-gray-700 mb-4" style={{fontFamily: 'Space Mono, monospace'}}>
                  Geotagged Photo *
                </label>
                <div className="bg-gray-25 rounded-xl p-8 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-75 transition-all cursor-pointer group">
                  <input
                    type="file"
                    id="geotag"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('geotagPhoto', e.target.files[0])}
                  />
                  <label htmlFor="geotag" className="cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-350 group-hover:text-gray-400 transition-colors">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 mb-2" style={{fontFamily: 'Space Mono, monospace'}}>
                      Upload Image
                    </p>
                    <p className="text-xs text-gray-300" style={{fontFamily: 'Space Mono, monospace'}}>
                      Photo with location data
                    </p>
                  </label>
                  {formData.geotagPhoto && (
                    <div className="mt-3 text-xs text-green-600 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
                      ✓ {formData.geotagPhoto.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Helper Text */}
            <div className="mt-6 p-4 bg-blue-25 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700" style={{fontFamily: 'Space Mono, monospace'}}>
                <span className="font-semibold">Note:</span> All documents marked with * are required. 
                Ensure your photo contains GPS location data for verification.
              </p>
            </div>
          </div>
        </div>
      </FadeInUp>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl" style={{fontFamily: 'Space Mono, monospace'}}>
      {/* Header with Navigation */}
      <FadeInUp>
        <div className="flex justify-center space-x-4 mb-8">
          <button className="bg-black text-white px-8 py-3 rounded-full font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
            Solar Panel
          </button>
          <button 
            onClick={() => navigate('/user/issue-coins/forestation')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
            style={{fontFamily: 'Space Mono, monospace'}}
          >
            Forestation
          </button>
        </div>
      </FadeInUp>

      {/* Solar Panel Hero Image */}
      <FadeInUp delay={100}>
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-lg">
          {solarImage ? (
            <img 
              src={solarImage} 
              alt="Solar Panel Installation" 
              className="w-full h-64 object-cover"
            />
          ) : (
            // Fallback solar panel illustration
            <div className="w-full h-64 bg-gradient-to-br from-green-400 via-green-500 to-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              {/* Solar panel grid pattern */}
              <div className="absolute inset-0">
                <div className="grid grid-cols-8 grid-rows-4 h-full w-full opacity-30">
                  {[...Array(32)].map((_, i) => (
                    <div key={i} className="border border-white/20 bg-blue-600/20"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Solar Energy Label */}
          <div className="absolute bottom-6 right-6 bg-white px-6 py-3 rounded-full shadow-lg">
            <span className="font-semibold text-gray-900" style={{fontFamily: 'Space Mono, monospace'}}>Solar Energy</span>
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
      {!showFinalResult && (
        <FadeInUp delay={400}>
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-12 py-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
                isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              style={{fontFamily: 'Space Mono, monospace'}}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {currentStep === 1 ? 'Validating...' : 'Submitting...'}
                </div>
              ) : (
                currentStep === 1 ? 'Continue to Verification' : 'Submit Application'
              )}
            </button>
          </div>
        </FadeInUp>
      )}
    </div>
  );
};

export default SolarPanelForm;