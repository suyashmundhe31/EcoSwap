// API base URL - update this to match your backend server
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

class MintCoinApiService {
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
   * Get all available solar minted coins
   * @returns {Promise<Array>} Available solar minted coins
   */
  async getSolarMintCoins() {
    try {
      const response = await fetch(`${this.baseURL}/solar-panel/mint-coin`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Get solar mint coins error:', error);
      throw error;
    }
  }

  /**
   * Get all available forestation minted coins
   * @returns {Promise<Array>} Available forestation minted coins
   */
  async getForestationMintCoins() {
    try {
      const response = await fetch(`${this.baseURL}/forestation/mint-coin`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Get forestation mint coins error:', error);
      throw error;
    }
  }

  /**
   * Purchase credits from a solar minted coin
   * @param {number} coinId - The minted coin ID
   * @param {number} creditsToPurchase - Number of credits to purchase
   * @param {number} userId - User ID (default: 1)
   * @returns {Promise<Object>} Purchase result
   */
  async purchaseSolarMintCoin(coinId, creditsToPurchase, userId = 1) {
    try {
      console.log('API Service: Purchasing solar mint coin:', { coinId, creditsToPurchase, userId });
      
      const formData = new FormData();
      formData.append('credits_to_purchase', creditsToPurchase.toString());
      formData.append('user_id', userId.toString());

      const response = await fetch(`${this.baseURL}/solar-panel/mint-coin/${coinId}`, {
        method: 'PATCH',
        body: formData,
      });

      console.log('API Service: Solar mint coin purchase response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Solar mint coin purchase error:', error);
      throw error;
    }
  }

  /**
   * Purchase credits from a forestation minted coin
   * @param {number} coinId - The minted coin ID
   * @param {number} creditsToPurchase - Number of credits to purchase
   * @param {number} userId - User ID (default: 1)
   * @returns {Promise<Object>} Purchase result
   */
  async purchaseForestationMintCoin(coinId, creditsToPurchase, userId = 1) {
    try {
      console.log('API Service: Purchasing forestation mint coin:', { coinId, creditsToPurchase, userId });
      
      const formData = new FormData();
      formData.append('credits_to_purchase', creditsToPurchase.toString());
      formData.append('user_id', userId.toString());

      const response = await fetch(`${this.baseURL}/forestation/mint-coin/${coinId}`, {
        method: 'PATCH',
        body: formData,
      });

      console.log('API Service: Forestation mint coin purchase response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service: Forestation mint coin purchase error:', error);
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
   * Get all available minted coins (both solar and forestation)
   * @returns {Promise<Array>} Combined list of all available minted coins
   */
  async getAllMintCoins() {
    try {
      const [solarResponse, forestationResponse] = await Promise.all([
        this.getSolarMintCoins(),
        this.getForestationMintCoins()
      ]);

      const allCoins = [];
      
      // Add solar coins
      if (solarResponse.success && solarResponse.minted_coins) {
        solarResponse.minted_coins.forEach(coin => {
          allCoins.push({
            ...coin,
            source: 'solar_plant',
            apiEndpoint: 'solar-panel'
          });
        });
      }

      // Add forestation coins
      if (forestationResponse.success && forestationResponse.minted_coins) {
        forestationResponse.minted_coins.forEach(coin => {
          allCoins.push({
            ...coin,
            source: 'forestation',
            apiEndpoint: 'forestation'
          });
        });
      }

      return {
        success: true,
        minted_coins: allCoins,
        total: allCoins.length,
        message: `Retrieved ${allCoins.length} minted coins from all sources`
      };
    } catch (error) {
      console.error('API Service: Get all mint coins error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const mintCoinApiService = new MintCoinApiService();
export default mintCoinApiService;
