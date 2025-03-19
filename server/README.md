# Profile Server

A Flask-based server application that fetches and serves profile data from a Google Spreadsheet.

## Features

- Serves a static HTML frontend
- Fetches data from Google Spreadsheet
- Provides REST API endpoint for profile data retrieval
- Handles CORS and SSL verification
- Dynamic profile data updates

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Project Structure

- `main.py` - Flask server implementation
- `index.html` - Frontend HTML template
- `scripts.js` - Frontend JavaScript code for profile card rendering
- `requirements.txt` - Python dependencies

## API Endpoints

### GET /
Serves the main HTML page with profile cards

### GET /get_data
Returns profile data in JSON format

Response format:
```json
[
  {
    "Full Name": "string",
    "Designation": "string",
    "Highest Qualification": "string",
    "College / University Name": "string",
    "LinkedIn": "string"
  },
  ...
]
```

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:5000`

## Dependencies

- Flask - Web framework
- Pandas - Data handling
- Requests - HTTP client

## Data Source
The application fetches data from a published Google Sheet:
https://docs.google.com/spreadsheets/d/e/2PACX-1vRPxcIRHbPsXXTXNB8lR9CU1edyXTgyT3pTuj6pnhcqkeTMeByPBeufVZmFk7A_ynXeK6wnimziWVNP/pub

## Notes

- SSL verification is disabled for Google Sheets access
- The application uses the current directory for both templates and static files
- Profile data is dynamically updated when the Google Sheet changes