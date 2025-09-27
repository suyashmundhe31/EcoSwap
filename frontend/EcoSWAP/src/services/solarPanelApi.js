// API base URL - update this to match your backend server
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

class SolarPanelApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async calculateCarbonCredits(applicationId) {
    const response = await fetch(`${this.baseURL}/solar-panel/applications/${applicationId}/calculate-carbon-credits`, {
      method: 'POST',
    });
    return this.handleResponse(response);
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create a new solar panel application
  async createApplication(formData) {
    console.log('API Service: Creating application with data:', formData);
    const formDataToSend = new FormData();
    
    // Add text fields
    formDataToSend.append('full_name', formData.fullName);
    if (formData.companyName) {
      formDataToSend.append('company_name', formData.companyName);
    }
    formDataToSend.append('aadhar_card', formData.aadharCard);
    
    // Ensure URL has proper protocol
    let apiLink = formData.apiLink;
    if (apiLink && !apiLink.startsWith('http://') && !apiLink.startsWith('https://')) {
      apiLink = 'https://' + apiLink;
    }
    formDataToSend.append('api_link', apiLink);

    // Add files
    if (formData.ownershipDocument) {
      formDataToSend.append('ownership_document', formData.ownershipDocument);
    }
    if (formData.energyCertification) {
      formDataToSend.append('energy_certification', formData.energyCertification);
    }
    if (formData.geotagPhoto) {
      formDataToSend.append('geotag_photo', formData.geotagPhoto);
    }

    console.log('API Service: Making request to:', `${this.baseURL}/solar-panel/applications`);
    
    const response = await fetch(`${this.baseURL}/solar-panel/applications`, {
      method: 'POST',
      body: formDataToSend,
    });

    console.log('API Service: Response status:', response.status);
    return this.handleResponse(response);
  }

  // Get user applications
  async getUserApplications(skip = 0, limit = 100) {
    const response = await fetch(
      `${this.baseURL}/solar-panel/applications?skip=${skip}&limit=${limit}`
    );
    return this.handleResponse(response);
  }

  // Get specific application
  async getApplication(applicationId) {
    const response = await fetch(`${this.baseURL}/solar-panel/applications/${applicationId}`);
    return this.handleResponse(response);
  }

  // Update application
  async updateApplication(applicationId, updateData) {
    const response = await fetch(`${this.baseURL}/solar-panel/applications/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse(response);
  }

  // Delete application
  async deleteApplication(applicationId) {
    const response = await fetch(`${this.baseURL}/solar-panel/applications/${applicationId}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }


  // UPDATED: Calculate solar energy potential using your backend
  async calculateSolarEnergy(latitude, longitude, panelAreaSqm = null) {
    console.log('API Service: Calculating solar energy for:', latitude, longitude);
    
    const formData = new FormData();
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (panelAreaSqm) {
      formData.append('panel_area_sqm', panelAreaSqm);
    }

    const response = await fetch(`${this.baseURL}/solar-panel/calculate-solar-energy`, {
      method: 'POST',
      body: formData,
    });

    const result = await this.handleResponse(response);
    console.log('API Service: Solar calculation result:', result);
    return result;
  }

  // NEW: Extract GPS coordinates from photo using OpenAI Vision API
  async extractGpsFromPhoto(photo) {
    console.log('API Service: Extracting GPS from photo:', photo.name);
    
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await fetch(`${this.baseURL}/solar-panel/extract-gps`, {
      method: 'POST',
      body: formData,
    });

    const result = await this.handleResponse(response);
    console.log('API Service: GPS extraction result:', result);
    
    // Convert to the format expected by your React component
    return {
      is_valid: result.success,
      latitude: result.latitude,
      longitude: result.longitude,
      message: result.message,
      method: result.method,
      confidence: result.confidence,
      description: result.description
    };
  }

  // Upload document
  async uploadDocument(file, fileType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    const response = await fetch(`${this.baseURL}/solar-panel/upload-document`, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Mint carbon coins based on solar calculation results
  async mintCarbonCoins(solarCalculationData) {
    const formData = new FormData();
    formData.append('latitude', solarCalculationData.latitude);
    formData.append('longitude', solarCalculationData.longitude);
    formData.append('annual_energy_mwh', solarCalculationData.annual_energy_mwh);
    formData.append('annual_co2_avoided_tonnes', solarCalculationData.annual_co2_avoided_tonnes);
    formData.append('annual_carbon_credits', solarCalculationData.annual_carbon_credits);
    formData.append('calculation_method', solarCalculationData.calculation_method);
    
    // Add new required parameters for marketplace credits
    formData.append('issuer_name', solarCalculationData.issuer_name || 'Solar Panel Owner');
    formData.append('description', solarCalculationData.description || 'Solar panel carbon credits');
    formData.append('price_per_coin', solarCalculationData.price_per_coin || '');
    if (solarCalculationData.source_project_id) {
      formData.append('source_project_id', solarCalculationData.source_project_id);
    }

    const response = await fetch(`${this.baseURL}/solar-panel/mint-carbon-coins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Get application stats
  async getApplicationStats() {
    const response = await fetch(`${this.baseURL}/solar-panel/stats`);
    return this.handleResponse(response);
  }

  // Admin endpoints
  async getAllApplicationsAdmin(skip = 0, limit = 100, status = null) {
    let url = `${this.baseURL}/solar-panel/admin/applications?skip=${skip}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url);
    return this.handleResponse(response);
  }

  async updateApplicationStatus(applicationId, status, verificationNotes = null) {
    const formData = new FormData();
    formData.append('status', status);
    if (verificationNotes) {
      formData.append('verification_notes', verificationNotes);
    }

    const response = await fetch(`${this.baseURL}/solar-panel/admin/applications/${applicationId}/status`, {
      method: 'PUT',
      body: formData,
    });

    return this.handleResponse(response);
  }

  /**
   * Mint carbon coins for a solar panel application using the new central system
   * @param {Object} mintingData - Solar calculation data for minting
   * @returns {Promise} - Minting result with issue_id and coin details
   */
  async mintCarbonCoinsToSystem(mintingData) {
    try {
      const formData = new FormData();
      formData.append('latitude', mintingData.latitude);
      formData.append('longitude', mintingData.longitude);
      formData.append('annual_energy_mwh', mintingData.annual_energy_mwh);
      formData.append('annual_co2_avoided_tonnes', mintingData.annual_co2_avoided_tonnes);
      formData.append('annual_carbon_credits', mintingData.annual_carbon_credits);
      formData.append('calculation_method', mintingData.calculation_method);
      formData.append('issuer_name', mintingData.issuer_name || 'Solar Panel Owner');
      formData.append('description', mintingData.description || 'Solar panel carbon credits');
      formData.append('source_project_id', mintingData.source_project_id);

      const response = await fetch(`${this.baseURL}/solar-panel/mint-carbon-coins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to mint carbon coins');
      }

      return await response.json();
    } catch (error) {
      console.error('Error minting carbon coins:', error);
      throw error;
    }
  }

  /**
   * Get user's carbon coin history
   * @param {number} skip - Pagination offset
   * @param {number} limit - Number of items per page
   * @param {string} source - Filter by source ('solar_panel' or 'forestation')
   * @returns {Promise} - List of carbon coin issues
   */
  async getCarbonCoinHistory(skip = 0, limit = 100, source = null) {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      });
      
      if (source) {
        params.append('source', source);
      }

      const response = await fetch(`${this.baseURL}/carbon-coins/?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch carbon coin history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching carbon coin history:', error);
      throw error;
    }
  }

  /**
   * Get carbon coin statistics for the user
   * @returns {Promise} - User's carbon coin stats
   */
  async getCarbonCoinStats() {
    try {
      const response = await fetch(`${this.baseURL}/carbon-coins/stats`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch carbon coin stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching carbon coin stats:', error);
      throw error;
    }
  }

  // NEW: Save analysis results to database
  async saveSolarAnalysisResults(analysisData) {
    console.log('API Service: Saving analysis results:', analysisData);
    
    const response = await fetch(`${this.baseURL}/solar-panel/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisData),
    });

    return this.handleResponse(response);
  }

  // NEW: Create carbon token
  async createCarbonToken(tokenData) {
    console.log('API Service: Creating carbon token:', tokenData);
    
    const response = await fetch(`${this.baseURL}/solar-panel/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });

    return this.handleResponse(response);
  }
}

// Create and export a singleton instance
const solarPanelApiService = new SolarPanelApiService();
export default solarPanelApiService;
