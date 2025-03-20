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
    template_folder=parent_dir,
    static_folder=parent_dir
)

# Enable CORS for all origins in production (since we're using GitHub Pages)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

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
        # Replace NaN values with None before converting to dict
        df = df.where(pd.notna(df), None)
        # Ensure all required columns are present
        required_columns = ['Full Name', 'Designation', 'Highest Qualification', 
                          'College / University Name', 'LinkedIn link', 'Projects']
        for col in required_columns:
            if col not in df.columns:
                df[col] = None
        data = df.to_dict('records')
        response = jsonify(data)
        response.headers['Cache-Control'] = 'public, max-age=300'
        response.headers['Content-Type'] = 'application/json'
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') != 'production')