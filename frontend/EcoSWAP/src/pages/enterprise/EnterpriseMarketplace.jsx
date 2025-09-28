import React, { useState, useEffect } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import ProjectCard from '../../components/marketplace/ProjectCard';
import SearchBar from '../../components/marketplace/SearchBar';

import solarImage from '../../assets/solar.png';
import forestImage from '../../assets/tree.png';
import coinImage from '../../assets/coin.png';

// API Service for Credit Purchasing
class CreditPurchaseAPI {
  constructor() {
    this.baseURL = 'http://localhost:8000/api/v1/credit-purchase';
  }

  async getUserWallet(userId) {
    try {
      const response = await fetch(`${this.baseURL}/wallet/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      // Return default wallet for MVP
      return { user_id: userId, available_coins: 2500, total_coins: 2500 };
    }
  }

  async getAvailableCredits() {
    try {
      const response = await fetch(`${this.baseURL}/marketplace/available`);
      if (response.ok) {
        const data = await response.json();
        return data.map(credit => ({
          id: credit.id,
          title: credit.name || 'Unnamed Project',
          name: credit.name || 'Unnamed Project',
          description: credit.description || 'No description available',
          credits: credit.credits,
          coins: credit.coins,
          source: credit.source,
          location: credit.location || 'Location not specified',
          tokenizedDate: credit.tokenized_date,
          image: credit.source === 'solar_panel' || credit.source === 'solar' ? solarImage : forestImage
        }));
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
    
    // Fallback to existing API
    try {
      const [solarResponse, forestResponse] = await Promise.all([
        fetch('http://localhost:8000/api/v1/solar-panel/mint-coin'),
        fetch('http://localhost:8000/api/v1/forestation/mint-coin')
      ]);

      const projects = [];
      
      if (solarResponse.ok) {
        const solarData = await solarResponse.json();
        if (solarData.success && solarData.minted_coins) {
          solarData.minted_coins.forEach(project => {
            if (project && project.credits > 0) {
              projects.push({
                id: `solar-${project.id}`,
                title: project.name || 'Unnamed Solar Project',
                name: project.name || 'Unnamed Solar Project',
                description: project.description || 'No description available',
                credits: project.credits,
                coins: project.credits,
                source: 'solar_plant',
                location: project.location || 'Location not specified',
                tokenizedDate: project.tokenized_date,
                image: solarImage
              });
            }
          });
        }
      }

      if (forestResponse.ok) {
        const forestData = await forestResponse.json();
        if (forestData.success && forestData.minted_coins) {
          forestData.minted_coins.forEach(project => {
            if (project && project.credits > 0) {
              projects.push({
                id: `forest-${project.id}`,
                title: project.name || 'Unnamed Forest Project',
                name: project.name || 'Unnamed Forest Project',
                description: project.description || 'No description available',
                credits: project.credits,
                coins: project.credits,
                source: 'forestation',
                location: project.location || 'Location not specified',
                tokenizedDate: project.tokenized_date,
                image: forestImage
              });
            }
          });
        }
      }

      return projects;
    } catch (error) {
      console.error('Fallback API also failed:', error);
      return [];
    }
  }

  async purchaseCredits(purchaseData) {
    try {
      const response = await fetch(`${this.baseURL}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Purchase failed');
      }

      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }
}

const EnterpriseMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [userCoins, setUserCoins] = useState(2500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = new CreditPurchaseAPI();

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user wallet
        const walletData = await api.getUserWallet(1); // Default user for MVP
        setUserCoins(walletData.available_coins || 2500);
        
        // Fetch available credits
        const projects = await api.getAvailableCredits();
        setAllProjects(projects);
        setFilteredProjects(projects);
        setError(null);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter projects based on search term
  useEffect(() => {
    const filtered = allProjects.filter(project =>
      (project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.source && project.source.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProjects(filtered);
  }, [searchTerm, allProjects]);

  // Handle purchase success from modal
  const handlePurchaseSuccess = (purchaseResult) => {
    console.log('Purchase successful:', purchaseResult);
    
    // Update user coins (subtract coins spent)
    setUserCoins(prevCoins => prevCoins - purchaseResult.coinsSpent);
    
    // Update the project in both allProjects and filteredProjects
    const updateProjects = (projects) => {
      return projects.map(project => {
        if (project.id === purchaseResult.projectId) {
          return {
            ...project,
            credits: purchaseResult.remainingCredits,
            coins: purchaseResult.remainingCredits
          };
        }
        return project;
      }).filter(project => (project.credits || project.coins) > 0); // Remove sold out projects
    };
    
    setAllProjects(prevProjects => updateProjects(prevProjects));
    setFilteredProjects(prevProjects => updateProjects(prevProjects));
  };

  const handleFilter = () => {
    console.log('Filter clicked');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Title */}
      <FadeInUp>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Marketplace
          </h1>
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-gray-600">Your Balance:</span>
            <img src={coinImage} alt="Coin" className="w-6 h-6" />
            <span className="font-bold text-gray-900">{userCoins}</span>
          </div>
        </div>
      </FadeInUp>

      {/* Search Bar */}
      <FadeInUp delay={100}>
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onFilter={handleFilter}
        />
      </FadeInUp>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <FadeInUp key={project.id} delay={200 + (index * 50)}>
            <ProjectCard 
              project={project} 
              solarImage={solarImage}
              forestImage={forestImage}
              coinImage={coinImage}
              onPurchaseSuccess={handlePurchaseSuccess}
              userId={1}
            />
          </FadeInUp>
        ))}
      </div>

      {/* No Results Message */}
      {filteredProjects.length === 0 && !loading && (
        <FadeInUp delay={300}>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No projects found' : 'No projects available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No projects with credits available at the moment'}
            </p>
          </div>
        </FadeInUp>
      )}

      {/* Results Count */}
      {filteredProjects.length > 0 && (
        <FadeInUp delay={400}>
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        </FadeInUp>
      )}
    </div>
  );
};

export default EnterpriseMarketplace;