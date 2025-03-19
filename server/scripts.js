// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://profile-backend-9kyx.onrender.com';

console.log('Using API URL:', API_URL); // Debug log

// Fetch data from our Flask backend
fetch(`${API_URL}/get_data`)
  .then(response => {
    console.log('Response status:', response.status); // Debug log
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Received data:', data); // Debug log
    if (!data || data.length === 0) {
      throw new Error('No data received from Google Sheet');
    }

    const table = document.getElementById("sheetTable");
    table.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    // Add header
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add data rows
    data.forEach(row => {
      const tr = document.createElement("tr");
      Object.values(row).forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  })
  .catch(err => {
    console.error("Failed to fetch data:", err);
    const table = document.getElementById("sheetTable");
    const errorMessage = `
      <tr>
        <td class="error">
          Error loading data: ${err.message}<br>
          <small>Please make sure:
            <ul>
              <li>The Flask server is running</li>
              <li>You have internet connection</li>
            </ul>
          </small>
        </td>
      </tr>`;
    table.innerHTML = errorMessage;
  });