// Use an IIFE to avoid global scope pollution
(function() {
  // API Configuration
  const API_URL = 'http://localhost:5000'

  console.log('Current hostname:', window.location.hostname); 
  console.log('Using API URL:', API_URL); 

  // Helper function to get unique comma-separated values
  function getUniqueValues(data, field) {
    const allValues = data
      .map(item => (item[field] || '').split(','))
      .flat()
      .map(item => item.trim())
      .filter(item => item !== '');
    return [...new Set(allValues)].sort();
  }

  // Helper function to create skill tags
  function createSkillTags(skills) {
    return skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
  }

  // Helper function to create profile cards
  function createProfileCard(profile) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    
    card.innerHTML = `
      <div class="profile-header">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(profile['Full Name'])}&background=random" alt="Profile" class="profile-image">
        <div class="profile-name-title">
          <h3 class="profile-name">${profile['Full Name']}</h3>
          <p class="profile-title">${profile['Designation']}</p>
        </div>
      </div>
      <div class="profile-info">
        <div class="info-item">
          <i class="fas fa-graduation-cap info-icon"></i>
          <div class="info-content">
            <div class="info-label">Qualification</div>
            <div class="info-value">${profile['Highest Qualification']}</div>
          </div>
        </div>
        <div class="info-item">
          <i class="fas fa-university info-icon"></i>
          <div class="info-content">
            <div class="info-label">Institution</div>
            <div class="info-value">${profile['College / University Name']}</div>
          </div>
        </div>
      </div>
      <a href="${profile['LinkedIn link']}" target="_blank" class="linkedin-button">
        <i class="fab fa-linkedin"></i>
        Connect
      </a>
    `;
    
    return card;
  }

  function displayProfiles(profiles) {
    const loading = document.querySelector('#profile-section .loading');
    const profileGrid = document.querySelector('.profile-grid');
    
    if (profiles && profiles.length > 0) {
      loading.style.display = 'none';
      profileGrid.style.display = 'grid';
      
      // Sort profiles by Full Name
      const sortedProfiles = [...profiles].sort((a, b) => 
        a['Full Name'].localeCompare(b['Full Name'])
      );
      
      sortedProfiles.forEach(profile => {
        const card = createProfileCard(profile);
        profileGrid.appendChild(card);
      });
    } else {
      loading.textContent = 'No profiles found.';
    }
  }

  function createNetworkGraph(data) {
    // Call the network visualization function from index.html
    createNetworkVisualization(data);
  }

  // Fetch data from our Flask backend
  fetch(`${API_URL}/get_data`)
    .then(response => {
      console.log('Response status:', response.status); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data); 
      if (!data || data.length === 0) {
        throw new Error('No data received from Google Sheet');
      }

      // Create networks
      createNetworkVisualization(data);

      // Update skills section
      const skillsSection = document.getElementById('skills-section');
      const skillsLoadingDiv = skillsSection.querySelector('.loading');
      
      // Get unique values for each category
      const uniqueLanguages = getUniqueValues(data, 'Programming Languages');
      const uniqueAIML = getUniqueValues(data, 'AI / ML Skills');
      const uniqueTools = getUniqueValues(data, 'Tools / Libraries / Frameworks');

      // Update content
      const toolsContent = document.getElementById('tools-content');
      const languagesContent = document.getElementById('languages-content');
      const aimlContent = document.getElementById('aiml-content');

      toolsContent.innerHTML = uniqueTools.map(tool => `<div class="skill-tag">${tool}</div>`).join('');
      languagesContent.innerHTML = uniqueLanguages.map(lang => `<div class="skill-tag">${lang}</div>`).join('');
      aimlContent.innerHTML = uniqueAIML.map(skill => `<div class="skill-tag">${skill}</div>`).join('');

      // Hide loading message
        skillsLoadingDiv.style.display = 'none';
      
      displayProfiles(data);
      createNetworkGraph(data);
    })
    .catch(error => {
      console.error('Error:', error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Error loading data. Please try again later.';
      document.body.appendChild(errorDiv);
    });
})();