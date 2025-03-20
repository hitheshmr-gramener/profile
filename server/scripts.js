// Use an IIFE to avoid global scope pollution
(function() {
  // API Configuration
  const API_URL = window.location.hostname.includes('localhost') 
      ? 'http://localhost:5000'
      : 'https://profile-backend-9kyx.onrender.com';

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
      
      profiles.forEach(profile => {
        const card = createProfileCard(profile);
        profileGrid.appendChild(card);
      });
    } else {
      loading.textContent = 'No profiles found.';
    }
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

      // Update skills section
      const skillsSection = document.getElementById('skills-section');
      const skillsLoadingDiv = skillsSection.querySelector('.loading');
      const skillsContainer = skillsSection.querySelector('.skills-container');

      // Get unique values for each category
      const uniqueLanguages = getUniqueValues(data, 'Programming Languages');
      const uniqueAIML = getUniqueValues(data, 'AI / ML Skills');
      const uniqueTools = getUniqueValues(data, 'Tools / Libraries / Frameworks');

      if (skillsLoadingDiv && skillsContainer) {
        // Handle skills section
        skillsLoadingDiv.style.display = 'none';
        skillsContainer.style.display = 'block';

        // Update content
        document.getElementById('tools-content').innerHTML = createSkillTags(uniqueTools);
        document.getElementById('languages-content').innerHTML = createSkillTags(uniqueLanguages);
        document.getElementById('aiml-content').innerHTML = createSkillTags(uniqueAIML);
      }

      displayProfiles(data);
    })
    .catch(error => {
      console.error('Error:', error);
      const sections = [
        document.getElementById('profile-section'),
        document.getElementById('skills-section')
      ];
      
      sections.forEach(section => {
        if (section) {
          const loadingDiv = section.querySelector('.loading');
          if (loadingDiv) {
            loadingDiv.textContent = `Error loading data: ${error.message}`;
            loadingDiv.style.color = 'red';
          }
        }
      });
    });
})();