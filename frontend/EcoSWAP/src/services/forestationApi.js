// API base URL - update this to match your backend server
const API_BASE_URL = 'http://localhost:8000/api/v1';

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

  async updateApplicationStatus(applicationId, status, verificationNotes = null) {
    const updateData = { status };
    if (verificationNotes) {
      updateData.verification_notes = verificationNotes;
    }

    const response = await fetch(`${this.baseURL}/forestation/admin/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    return this.handleResponse(response);
  }
}

// Create and export a singleton instance
const forestationApiService = new ForestationApiService();
export default forestationApiService;