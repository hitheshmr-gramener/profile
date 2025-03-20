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

  // Create network visualization
  function createNetworkGraph(data) {
    const nodes = [];
    const edges = [];
    const employeeNodes = new Set();
    const projectNodes = new Set();

    // Create nodes for employees and projects
    data.forEach((profile, index) => {
      if (!employeeNodes.has(profile['Full Name'])) {
        nodes.push({
          id: profile['Full Name'],
          label: profile['Full Name'],
          group: 'employee',
          level: 0, // Top level for employees
          color: {
            background: '#4CAF50',
            border: '#2E7D32',
            highlight: {
              background: '#81C784',
              border: '#2E7D32'
            }
          }
        });
        employeeNodes.add(profile['Full Name']);
      }

      // Extract and create project nodes
      const projects = (profile['Projects'] || '').split(',')
        .map(p => p.trim())
        .filter(p => p !== '');

      projects.forEach(project => {
        if (!projectNodes.has(project)) {
          nodes.push({
            id: project,
            label: project,
            group: 'project',
            level: 1, // Bottom level for projects
            color: {
              background: '#2196F3',
              border: '#1565C0',
              highlight: {
                background: '#64B5F6',
                border: '#1565C0'
              }
            }
          });
          projectNodes.add(project);
        }

        // Create edge between employee and project
        edges.push({
          from: profile['Full Name'],
          to: project,
          color: { 
            color: '#999999',
            opacity: 0.5,
            highlight: '#FF4081'
          }
        });
      });
    });

    // Create network
    const container = document.getElementById('network');
    const networkData = { 
      nodes: new vis.DataSet(nodes), 
      edges: new vis.DataSet(edges) 
    };

    const options = {
      layout: {
        hierarchical: {
          direction: 'UD', // Up to Down layout
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 200
        }
      },
      physics: false, // Disable physics for fixed layout
      nodes: {
        shape: 'box',
        size: 20,
        font: {
          size: 14,
          color: '#ffffff'
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        smooth: {
          type: 'discrete', // Straight lines
          forceDirection: 'vertical'
        },
        hoverWidth: 3
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true
      }
    };

    const network = new vis.Network(container, networkData, options);

    // Add click event for highlighting
    network.on('click', function(params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const connectedEdges = network.getConnectedEdges(nodeId);
        const connectedNodes = network.getConnectedNodes(nodeId);

        // Reset all nodes and edges
        networkData.nodes.forEach((node) => {
          node.color.opacity = 1;
        });
        networkData.edges.forEach((edge) => {
          edge.color.opacity = 0.5;
          edge.color.color = '#999999';
        });

        // Highlight connected nodes and edges
        connectedEdges.forEach((edgeId) => {
          const edge = networkData.edges.get(edgeId);
          edge.color = {
            color: '#FF4081',
            opacity: 1
          };
          networkData.edges.update(edge);
        });

        // Update the network
        network.redraw();
      }
    });
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