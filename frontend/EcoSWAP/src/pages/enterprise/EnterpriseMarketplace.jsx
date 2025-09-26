import React, { useState } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import ProjectCard from '../../components/marketplace/ProjectCard';
import SearchBar from '../../components/marketplace/SearchBar';
import { MARKETPLACE_DATA } from '../../utils/constants';

import solarImage from '../../assets/solar.png';
import forestImage from '../../assets/tree.png';

const EnterpriseMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(MARKETPLACE_DATA);

  // Filter projects based on search term
  React.useEffect(() => {
    const filtered = MARKETPLACE_DATA.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm]);

  const handleFilter = () => {
    // Add filter functionality here
    console.log('Filter clicked');
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Title */}
      <FadeInUp>
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Marketplace
        </h1>
      </FadeInUp>

      {/* Search Bar */}
      <FadeInUp delay={100}>
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onFilter={handleFilter}
        />
      </FadeInUp>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((project, index) => (
          <FadeInUp key={project.id} delay={200 + (index * 50)}>
            <ProjectCard 
              project={project} 
              solarImage={solarImage}
              forestImage={forestImage}
            />
          </FadeInUp>
        ))}
      </div>

      {/* No Results Message */}
      {filteredProjects.length === 0 && searchTerm && (
        <FadeInUp delay={300}>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        </FadeInUp>
      )}

      {/* Results Count */}
      {filteredProjects.length > 0 && (
        <FadeInUp delay={400}>
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredProjects.length} of {MARKETPLACE_DATA.length} projects
          </div>
        </FadeInUp>
      )}
    </div>
  );
};

export default EnterpriseMarketplace;