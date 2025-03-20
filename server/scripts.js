// Use an IIFE to avoid global scope pollution
(function() {
  // API Configuration
  const API_URL = window.location.hostname.includes('localhost') 
      ? 'http://localhost:5000'
      : 'https://profile-backend-9kyx.onrender.com';

  console.log('Current hostname:', window.location.hostname); 
  console.log('Using API URL:', API_URL); 

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

      const profileSection = document.getElementById('profile-section');
      const loadingDiv = profileSection.querySelector('.loading');
      const table = profileSection.querySelector('.profile-table');
      const tbody = document.getElementById('profile-tbody');
      
      // Clear loading message and show table
      if (loadingDiv) loadingDiv.style.display = 'none';
      if (table) table.style.display = 'table';
      
      if (tbody) {
        data.forEach(profile => {
          const row = document.createElement('tr');
          
          // Add cells
          row.innerHTML = `
            <td>${profile['Full Name'] || ''}</td>
            <td>${profile['Designation'] || ''}</td>
            <td>${profile['Highest Qualification'] || ''}</td>
            <td>${profile['College / University Name'] || ''}</td>
            <td>
              <a class="linkedin-link" href="${profile['LinkedIn link'] || '#'}" target="_blank">
                <i class="fab fa-linkedin"></i> View
              </a>
            </td>
            <td class="comma-list">${profile['Projects'] || ''}</td>
            <td class="comma-list">${profile['Programming Languages'] || ''}</td>
            <td class="comma-list">${profile['AI / ML Skills'] || ''}</td>
            <td class="comma-list">${profile['Tools / Libraries / Frameworks'] || ''}</td>
          `;
          
          tbody.appendChild(row);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      const profileSection = document.getElementById('profile-section');
      if (profileSection) {
        profileSection.innerHTML = `<div class="error">Error loading profiles: ${error.message}</div>`;
      }
    });
})();