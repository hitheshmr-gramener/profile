from flask import Flask, render_template, send_from_directory, jsonify
import pandas as pd
import requests
import urllib3
import os
import io

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
    template_folder=current_dir,  # Set template folder to current directory
    static_folder=current_dir     # Set static folder to current directory
)

SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPxcIRHbPsXXTXNB8lR9CU1edyXTgyT3pTuj6pnhcqkeTMeByPBeufVZmFk7A_ynXeK6wnimziWVNP/pub?gid=1674504463&single=true&output=csv"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_data')
def get_data():
    try:
        # Disable SSL verification as per the memory
        response = requests.get(SHEET_URL, verify=False)
        
        # Read CSV into pandas DataFrame
        df = pd.read_csv(io.StringIO(response.text))
        
        # Convert DataFrame to list of dictionaries (JSON format)
        data = df.to_dict('records')
        
        return jsonify(data)
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)