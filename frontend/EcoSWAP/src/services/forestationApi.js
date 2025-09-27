// API base URL - update this to match your backend server
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

class ForestationApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create a new forestation application
  async createApplication(formData) {
    console.log('API Service: Creating forestation application with data:', formData);
    const formDataToSend = new FormData();
    
    // Add text fields
    formDataToSend.append('full_name', formData.fullName);
    formDataToSend.append('aadhar_card', formData.aadharCardNumber);

    // Add files
    if (formData.ownershipDocument) {
      formDataToSend.append('ownership_document', formData.ownershipDocument);
    }
    if (formData.geotagPhoto) {
      formDataToSend.append('geotag_photo', formData.geotagPhoto);
    }

    console.log('API Service: Making request to:', `${this.baseURL}/forestation/applications`);
    
    const response = await fetch(`${this.baseURL}/forestation/applications`, {
      method: 'POST',
      body: formDataToSend,
    });

    console.log('API Service: Response status:', response.status);
    return this.handleResponse(response);
  }

  // Get user applications
  async getUserApplications(skip = 0, limit = 100) {
    const response = await fetch(
      `${this.baseURL}/forestation/applications?skip=${skip}&limit=${limit}`
    );
    return this.handleResponse(response);
  }

  // Get specific application
  async getApplication(applicationId) {
    const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}`);
    return this.handleResponse(response);
  }

  // Update application
  async updateApplication(applicationId, updateData) {
    const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}`, {
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
    const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  // Get application stats
  async getApplicationStats() {
    const response = await fetch(`${this.baseURL}/forestation/applications/me/stats`);
    return this.handleResponse(response);
  }

  // Admin endpoints
  async getAllApplicationsAdmin(skip = 0, limit = 100, status = null) {
    let url = `${this.baseURL}/forestation/admin/applications?skip=${skip}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url);
    return this.handleResponse(response);
  }

  // Mint carbon coins for an approved forestation application
  async mintCoins(applicationId, mintingData) {
    const formData = new FormData();
    formData.append('issuer_name', mintingData.issuer_name || 'Forestation Owner');
    formData.append('description', mintingData.description || 'Forestation carbon credits');
    formData.append('price_per_coin', mintingData.price_per_coin || '');

    const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}/mint-coins`, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Perform forest analysis
  async performForestAnalysis(applicationId) {
    const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}/analyze`, {
      method: 'POST',
    });
    return this.handleResponse(response);
  }

  // Calculate carbon credits for an application
  async calculateCarbonCredits(applicationId) {
    const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}/calculate-carbon-credits`, {
      method: 'POST',
    });
    return this.handleResponse(response);
  }

  /**
   * Mint carbon coins for a forestation application
   * @param {number} applicationId - The forestation application ID
   * @param {string} issuerName - Name of the issuer
   * @param {string} description - Optional description
   * @returns {Promise} - Minting result with issue_id and coin details
   */
  async mintCarbonCoins(applicationId, issuerName, description = null) {
    try {
      const formData = new FormData();
      formData.append('issuer_name', issuerName);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`${this.baseURL}/forestation/applications/${applicationId}/mint-coins`, {
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

  /**
   * Mint forestation carbon coins directly using the new mint-coin endpoint
   * @param {Object} coinData - The coin minting data
   * @param {string} coinData.name - Name of the coin/project
   * @param {number} coinData.credits - Number of carbon credits/coins
   * @param {string} coinData.source - Source type (default: "forestation")
   * @param {string} coinData.description - Optional description
   * @returns {Promise<Object>} Minting result
   */
  async mintCarbonCoinsDirect(coinData) {
    try {
      const formData = new FormData();
      formData.append('name', coinData.name);
      formData.append('credits', coinData.credits.toString());
      formData.append('source', coinData.source || 'forestation');
      if (coinData.description) {
        formData.append('description', coinData.description);
      }

      const response = await fetch(`${this.baseURL}/forestation/mint-coin`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Direct forestation minting result:', result);
      return result;
    } catch (error) {
      console.error('Direct forestation minting error:', error);
      throw error;
    }
  }

  /**
   * Get forestation minted coin information using the GET mint-coin endpoint
   * @param {Object} options - Query options
   * @param {string} options.name - Filter by coin name
   * @param {string} options.source - Filter by source type
   * @param {number} options.skip - Pagination offset
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} Minted coins information
   */
  async getMintCoinInfo(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.name) params.append('name', options.name);
      if (options.source) params.append('source', options.source);
      if (options.skip !== undefined) params.append('skip', options.skip.toString());
      if (options.limit !== undefined) params.append('limit', options.limit.toString());

      const url = `${this.baseURL}/forestation/mint-coin?${params}`;
      console.log('Fetching forestation mint coin info from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Forestation mint coin info result:', result);
      return result;
    } catch (error) {
      console.error('Get forestation mint coin info error:', error);
      throw error;
    }
  }

  /**
   * Save forestation analysis results to database
   * @param {Object} analysisData - Analysis data
   * @param {number} analysisData.application_id - Application ID
   * @param {number} analysisData.latitude - Latitude
   * @param {number} analysisData.longitude - Longitude
   * @param {number} analysisData.area_hectares - Area in hectares
   * @param {number} analysisData.co2_sequestration_rate - CO2 sequestration rate
   * @param {number} analysisData.annual_carbon_credits - Annual carbon credits
   * @param {string} analysisData.forest_type - Forest type
   * @param {number} analysisData.tree_count - Tree count
   * @param {number} analysisData.vegetation_coverage - Vegetation coverage percentage
   * @returns {Promise<Object>} Analysis result
   */
  async saveAnalysisResults(analysisData) {
    try {
      const formData = new FormData();
      formData.append('application_id', analysisData.application_id.toString());
      formData.append('latitude', analysisData.latitude.toString());
      formData.append('longitude', analysisData.longitude.toString());
      formData.append('area_hectares', analysisData.area_hectares.toString());
      formData.append('co2_sequestration_rate', analysisData.co2_sequestration_rate.toString());
      formData.append('annual_carbon_credits', analysisData.annual_carbon_credits.toString());
      formData.append('forest_type', analysisData.forest_type);
      formData.append('tree_count', analysisData.tree_count.toString());
      formData.append('vegetation_coverage', analysisData.vegetation_coverage.toString());

      const response = await fetch(`${this.baseURL}/forestation/analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Forestation analysis save result:', result);
      return result;
    } catch (error) {
      console.error('Save forestation analysis error:', error);
      throw error;
    }
  }

  /**
   * Get forestation analysis results with optional filtering
   * @param {Object} options - Query options
   * @param {number} options.application_id - Filter by application ID
   * @param {number} options.skip - Pagination offset
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} Analysis results
   */
  async getAnalysisResults(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.application_id !== undefined) params.append('application_id', options.application_id.toString());
      if (options.skip !== undefined) params.append('skip', options.skip.toString());
      if (options.limit !== undefined) params.append('limit', options.limit.toString());

      const url = `${this.baseURL}/forestation/analysis?${params}`;
      console.log('Fetching forestation analysis results from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Forestation analysis results:', result);
      return result;
    } catch (error) {
      console.error('Get forestation analysis results error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const forestationApiService = new ForestationApiService();
export default forestationApiService;