# Profile Server

A Flask-based server application that fetches and serves profile data from a Google Spreadsheet.

## Features

- Serves a static HTML frontend
- Fetches data from Google Spreadsheet
- Provides REST API endpoint for data retrieval
- Handles CORS and SSL verification

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
- `scripts.js` - Frontend JavaScript code
- `requirements.txt` - Python dependencies

## API Endpoints

- `GET /` - Serves the main HTML page
- `GET /get_data` - Returns JSON data from Google Spreadsheet

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:5000`

## Dependencies

- Flask - Web framework
- Pandas - Data handling
- Requests - HTTP client

## Notes

- SSL verification is disabled for Google Sheets access
- The application uses the current directory for both templates and static files