// API base URL - update this to match your backend server
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

class CreditPurchaseApiService {
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

  /**
   * Purchase carbon credits from marketplace
   * @param {Object} purchaseData - Purchase request data
   * @param {number} purchaseData.user_id - User ID
   * @param {number} purchaseData.credit_id - Credit ID to purchase
   * @param {number} purchaseData.credits_to_purchase - Number of credits to purchase
   * @param {number} purchaseData.coin_cost - Cost in coins
   * @returns {Promise<Object>} Purchase result
   */
  async purchaseCredits(purchaseData) {
    try {
      console.log('API Service: Purchasing credits with data:', purchaseData);
      
      const response = await fetch(`${this.baseURL}/credit-purchase/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      console.log('API Service: Purchase response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Purchase error:', error);
      throw error;
    }
  }

  /**
   * Get user's wallet information
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User wallet data
   */
  async getUserWallet(userId) {
    try {
      const response = await fetch(`${this.baseURL}/credit-purchase/wallet/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Get wallet error:', error);
      throw error;
    }
  }

  /**
   * Get available credits in marketplace (credits > 0)
   * @returns {Promise<Array>} Available marketplace credits
   */
  async getAvailableCredits() {
    try {
      const response = await fetch(`${this.baseURL}/credit-purchase/marketplace/available`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Get available credits error:', error);
      throw error;
    }
  }

  /**
   * Get all marketplace credits (including those with 0 credits)
   * @returns {Promise<Array>} All marketplace credits
   */
  async getAllMarketplaceCredits() {
    try {
      const response = await fetch(`${this.baseURL}/credit-purchase/marketplace/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Get all marketplace credits error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const creditPurchaseApiService = new CreditPurchaseApiService();
export default creditPurchaseApiService;
