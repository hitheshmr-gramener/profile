from flask import Flask, render_template, send_from_directory, jsonify
import pandas as pd
import requests
import urllib3
import os
import io
from flask_cors import CORS

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

app = Flask(__name__, 
    template_folder=current_dir,  # Set template folder to server directory
    static_folder=parent_dir     # Set static folder to parent directory for main assets
)

# Enable CORS for specific origins in production
if os.environ.get('FLASK_ENV') == 'production':
    CORS(app, resources={r"/*": {"origins": [
        "https://hitheshmr.github.io",  # Your GitHub Pages domain
        "http://localhost:5000",        # Local development
        "http://127.0.0.1:5000"         # Local development alternative
    ]}})
else:
    CORS(app)  # Allow all origins in development

SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPxcIRHbPsXXTXNB8lR9CU1edyXTgyT3pTuj6pnhcqkeTMeByPBeufVZmFk7A_ynXeK6wnimziWVNP/pub?gid=1674504463&single=true&output=csv"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/server/<path:filename>')
def serve_server_static(filename):
    return send_from_directory(current_dir, filename)

@app.route('/get_data')
def get_data():
    try:
        response = requests.get(SHEET_URL, verify=False)
        df = pd.read_csv(io.StringIO(response.text))
        data = df.to_dict('records')
        response = jsonify(data)
        response.headers['Cache-Control'] = 'public, max-age=300'
        response.headers['Content-Type'] = 'application/json'
        return response
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') != 'production')