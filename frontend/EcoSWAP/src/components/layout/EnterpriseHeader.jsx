import React, { useState, useEffect } from 'react';
import coinImage from '../../assets/coin.png';

// API Service for fetching user wallet
class WalletAPI {
  constructor() {
    this.baseURL = 'http://localhost:8000/api/v1/credit-purchase';
  }

  async getUserWallet(userId) {
    try {
      const response = await fetch(`${this.baseURL}/wallet/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.available_coins || 2500;
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
    return 2500; // Default for MVP
  }
}

// Enhanced MetaMask Wallet Service with debugging
class MetaMaskWalletService {
  constructor() {
    this.ethereum = window.ethereum;
    console.log('MetaMask Detection:', {
      hasEthereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      ethereum: window.ethereum
    });
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    const isInstalled = typeof this.ethereum !== 'undefined' && this.ethereum.isMetaMask;
    console.log('MetaMask installed check:', isInstalled);
    return isInstalled;
  }

  // Connect to MetaMask
  async connectWallet() {
    console.log('Attempting to connect wallet...');
    
    if (!this.isMetaMaskInstalled()) {
      console.error('MetaMask not detected');
      throw new Error('MetaMask is not installed');
    }

    try {
      console.log('Requesting accounts from MetaMask...');
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      console.log('Accounts received:', accounts);
      
      if (accounts.length > 0) {
        return {
          address: accounts[0],
          isConnected: true
        };
      }
      
      throw new Error('No accounts found');
    } catch (error) {
      console.error('MetaMask connection error:', error);
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      }
      if (error.code === -32002) {
        throw new Error('MetaMask is already processing a request. Please check MetaMask.');
      }
      throw error;
    }
  }

  // Get current connected accounts
  async getConnectedAccounts() {
    if (!this.isMetaMaskInstalled()) {
      return [];
    }

    try {
      const accounts = await this.ethereum.request({
        method: 'eth_accounts'
      });
      console.log('Connected accounts:', accounts);
      return accounts;
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  // Get account balance
  async getBalance(address) {
    if (!this.isMetaMaskInstalled()) {
      return '0';
    }

    try {
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert from wei to ether
      const ethBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      console.log('Balance for', address, ':', ethBalance, 'ETH');
      return ethBalance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  // Get current network
  async getCurrentNetwork() {
    if (!this.isMetaMaskInstalled()) {
      return 'Unknown';
    }

    try {
      const chainId = await this.ethereum.request({
        method: 'eth_chainId'
      });
      
      const networks = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0xaa36a7': 'Sepolia Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Mumbai Testnet'
      };
      
      return networks[chainId] || `Unknown Network (${chainId})`;
    } catch (error) {
      console.error('Error getting network:', error);
      return 'Unknown';
    }
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Listen for account changes
  onAccountsChanged(callback) {
    if (this.isMetaMaskInstalled()) {
      this.ethereum.on('accountsChanged', callback);
    }
  }

  // Remove account change listener
  removeAccountsChangedListener(callback) {
    if (this.isMetaMaskInstalled()) {
      this.ethereum.removeListener('accountsChanged', callback);
    }
  }
}

const EnterpriseHeader = ({ 
  currentPath, 
  navigate, 
  userCoins: propUserCoins, 
  onCoinsUpdate,
  userId = 1 // Default user for MVP
}) => {
  const [userCoins, setUserCoins] = useState(propUserCoins || 2500);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [lastFetched, setLastFetched] = useState(Date.now());
  
  // MetaMask wallet states
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  const [currentNetwork, setCurrentNetwork] = useState('Unknown');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const api = new WalletAPI();
  const metaMaskService = new MetaMaskWalletService();

  const navItems = [
    { id: '/enterprise', label: 'Dashboard' },
    { id: '/enterprise/marketplace', label: 'Marketplace' },
    { id: '/enterprise/history', label: 'History' }
  ];

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    setIsLoadingWallet(true);
    try {
      const balance = await api.getUserWallet(userId);
      setUserCoins(balance);
      
      // Notify parent component of coin update
      if (onCoinsUpdate) {
        onCoinsUpdate(balance);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Connect MetaMask wallet
  const connectMetaMaskWallet = async () => {
    console.log('Connect button clicked');
    setConnectionError('');
    
    if (!metaMaskService.isMetaMaskInstalled()) {
      const errorMsg = 'MetaMask is not installed. Please install MetaMask to continue.';
      setConnectionError(errorMsg);
      alert(errorMsg);
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    
    try {
      const result = await metaMaskService.connectWallet();
      console.log('Connection successful:', result);
      
      setWalletAddress(result.address);
      setIsWalletConnected(true);
      
      // Get balance and network
      const balance = await metaMaskService.getBalance(result.address);
      const network = await metaMaskService.getCurrentNetwork();
      
      setWalletBalance(balance);
      setCurrentNetwork(network);
      
      console.log('Wallet connected successfully:', {
        address: result.address,
        balance,
        network
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMsg = error.message || 'Failed to connect wallet';
      setConnectionError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    console.log('Disconnecting wallet');
    setWalletAddress('');
    setIsWalletConnected(false);
    setWalletBalance('0');
    setCurrentNetwork('Unknown');
    setShowWalletDropdown(false);
    setConnectionError('');
  };

  // Check for existing connection on component mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      console.log('Checking for existing connection...');
      
      if (metaMaskService.isMetaMaskInstalled()) {
        const accounts = await metaMaskService.getConnectedAccounts();
        if (accounts.length > 0) {
          console.log('Found existing connection:', accounts[0]);
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          
          const balance = await metaMaskService.getBalance(accounts[0]);
          const network = await metaMaskService.getCurrentNetwork();
          
          setWalletBalance(balance);
          setCurrentNetwork(network);
        } else {
          console.log('No existing connection found');
        }
      } else {
        console.log('MetaMask not installed');
      }
    };

    checkExistingConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      console.log('Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        // User switched accounts
        setWalletAddress(accounts[0]);
        const balance = await metaMaskService.getBalance(accounts[0]);
        const network = await metaMaskService.getCurrentNetwork();
        setWalletBalance(balance);
        setCurrentNetwork(network);
      }
    };

    metaMaskService.onAccountsChanged(handleAccountsChanged);

    return () => {
      metaMaskService.removeAccountsChangedListener(handleAccountsChanged);
    };
  }, []);

  // Initial wallet fetch
  useEffect(() => {
    if (!propUserCoins) {
      fetchWalletBalance();
    }
  }, [userId]);

  // Update coins when prop changes (from marketplace purchases)
  useEffect(() => {
    if (propUserCoins !== undefined && propUserCoins !== userCoins) {
      setUserCoins(propUserCoins);
    }
  }, [propUserCoins]);

  // Auto-refresh wallet balance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetched > 30000) { // 30 seconds
        fetchWalletBalance();
        setLastFetched(now);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lastFetched, userId]);

  // Handle manual refresh
  const handleRefreshWallet = () => {
    if (!isLoadingWallet) {
      fetchWalletBalance();
      setLastFetched(Date.now());
    }
  };

  // Format coin display with animation
  const formatCoins = (coins) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(coins);
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* Logo */}
      <div 
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
      >
        <span className="text-xl font-bold text-gray-900">Eco</span>
        <span className="bg-black text-white px-2 py-1 text-sm ml-1 rounded font-medium">
          SWAP
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex space-x-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`px-6 py-2 rounded-full text-sm transition-all duration-200 font-medium ${
              currentPath === item.id
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      
      {/* User Info & Connect Wallet */}
      <div className="flex items-center space-x-4">
        {/* User Coins Display with refresh functionality */}
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <button
            onClick={handleRefreshWallet}
            disabled={isLoadingWallet}
            className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            title="Refresh wallet balance"
          >
            <img 
              src={coinImage} 
              alt="Coin" 
              className={`w-6 h-6 rounded-full ${isLoadingWallet ? 'animate-spin' : ''}`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML += '<div class="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-yellow-900">₿</span></div>';
              }}
            />
            <span className={`text-gray-800 font-semibold min-w-16 text-right transition-all duration-300 ${
              isLoadingWallet ? 'opacity-50' : ''
            }`}>
              {formatCoins(userCoins)}
            </span>
          </button>
          
          {/* Coin status indicator */}
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full ${
              userCoins > 100 ? 'bg-green-400' : 
              userCoins > 50 ? 'bg-yellow-400' : 
              'bg-red-400'
            } animate-pulse`}></div>
            <span className="text-xs text-gray-500 mt-1">
              {userCoins > 100 ? 'High' : 
               userCoins > 50 ? 'Med' : 
               'Low'}
            </span>
          </div>
        </div>
        
        {/* Wallet Management Actions */}
        <div className="flex items-center space-x-2">
          {/* Add Coins Button (for MVP testing) */}
          <button
            onClick={() => {
              setUserCoins(prev => prev + 100);
              if (onCoinsUpdate) {
                onCoinsUpdate(userCoins + 100);
              }
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            title="Add 100 coins (MVP only)"
          >
            +100
          </button>
          
          {/* MetaMask Wallet Connection */}
          <div className="relative">
            {!isWalletConnected ? (
              <div className="flex flex-col items-end">
                <button 
                  onClick={connectMetaMaskWallet}
                  disabled={isConnecting}
                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-spin"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      Connect Wallet
                    </>
                  )}
                </button>
                {connectionError && (
                  <div className="mt-1 text-xs text-red-600 max-w-48 text-right">
                    {connectionError}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center px-4 py-2 bg-green-800 text-white rounded-full text-sm hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {metaMaskService.formatAddress(walletAddress)}
                </button>
                
                {/* Wallet Dropdown */}
                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Wallet Connected</h3>
                        <button
                          onClick={() => setShowWalletDropdown(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500">Account Address</label>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-mono text-gray-900">
                              {metaMaskService.formatAddress(walletAddress)}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(walletAddress);
                                alert('Address copied to clipboard!');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 ml-2 px-2 py-1 bg-blue-50 rounded"
                              title="Copy full address"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-mono break-all bg-gray-50 p-2 rounded">
                            {walletAddress}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">ETH Balance</label>
                          <div className="text-sm font-semibold text-gray-900 mt-1">
                            {walletBalance} ETH
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Network</label>
                          <div className="text-sm text-gray-900 mt-1">
                            {currentNetwork}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3">
                          <button
                            onClick={disconnectWallet}
                            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Disconnect Wallet
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showWalletDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowWalletDropdown(false)}
        ></div>
      )}
    </header>
  );
};

export default EnterpriseHeader;