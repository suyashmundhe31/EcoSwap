// API base URL - update this to match your backend server
const API_BASE_URL = 'http://localhost:8000/api/v1';

class SolarPanelApiService {
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
}

// Create and export a singleton instance
const solarPanelApiService = new SolarPanelApiService();
export default solarPanelApiService;
