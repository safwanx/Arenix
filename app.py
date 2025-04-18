from flask import Flask, request, jsonify, render_template, send_from_directory
import pandas as pd
import numpy as np
import pickle
import os
import json
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Enable CORS for all routes

# Load the trained model
model_path = "models/final_model_pipeline.pkl"
with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Load feature list
feature_list_path = "models/feature_list.json"
with open(feature_list_path, 'r') as f:
    features = json.load(f)

# Team database with strength ratings (normalized to 0-1 scale)
teams = {
    "Brazil": 0.9,
    "Argentina": 0.88,
    "France": 0.87,
    "Germany": 0.86,
    "England": 0.85,
    "Portugal": 0.84,
    "Spain": 0.84,
    "Netherlands": 0.83,
    "Italy": 0.82,
    "Belgium": 0.82,
    "Uruguay": 0.80,
    "Denmark": 0.78,
    "Croatia": 0.78,
    "Switzerland": 0.76,
    "Mexico": 0.75,
    "USA": 0.74,
    "Japan": 0.72,
    "South Korea": 0.70,
    "Senegal": 0.68,
    "Morocco": 0.67,
    "Poland": 0.65,
    "Colombia": 0.64,
    "Nigeria": 0.62,
    "Australia": 0.60,
    "Canada": 0.58,
    "Ecuador": 0.56,
    "Saudi Arabia": 0.54,
    "Tunisia": 0.52,
    "Iran": 0.50,
    "Qatar": 0.48
}

# Match importance ratings based on match type
match_importance = {
    "friendly": 0.2,
    "group_stage": 0.2,
    "round_of_16": 0.4,
    "quarter_finals": 0.6,
    "semi_finals": 0.8,
    "third_place": 0.3,
    "final": 1.0
}

@app.route('/')
def index():
    # Dynamic pricing page
    return render_template('dynamic.html', 
                          teams=teams, 
                          match_types=match_importance)

@app.route('/crowd')
def crowd_monitoring():
    # Crowd monitoring page
    return render_template('crowd.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/predict-price', methods=['POST'])
def predict_price():
    try:
        data = request.json
        
        # Extract input features from request
        team1_name = data.get('team1', '')
        team2_name = data.get('team2', '')
        attendance_percentage = float(data.get('attendance_percentage', 0)) / 100.0  # Convert percentage to 0-1 scale
        match_type = data.get('match_type', 'friendly')
        base_price = float(data.get('base_price', 100))
        
        # Get team strengths
        team1_strength = teams.get(team1_name, 0.5)  # Default to 0.5 if team not found
        team2_strength = teams.get(team2_name, 0.5)  # Default to 0.5 if team not found
        
        # Get match importance
        match_importance_value = match_importance.get(match_type, 0.2)  # Default to 0.2 if match type not found
        
        # Calculate derived features
        avg_team_strength = (team1_strength + team2_strength) / 2
        team_strength_diff = abs(team1_strength - team2_strength)
        year_normalized = 1.0  # Default to current year
        
        # Create feature array matching the model's expected input
        feature_values = [
            team1_strength, 
            team2_strength, 
            attendance_percentage, 
            match_importance_value, 
            avg_team_strength, 
            team_strength_diff,
            year_normalized
        ]
        
        # Create DataFrame for prediction
        X_pred = pd.DataFrame([feature_values], columns=features)
        
        # Make prediction
        price_multiplier = float(model.predict(X_pred)[0])
        
        # Calculate final price
        final_price = base_price * price_multiplier
        
        # Return all the relevant information
        return jsonify({
            'success': True,
            'price_multiplier': price_multiplier,
            'base_price': base_price,
            'final_price': final_price,
            'inputs': {
                'team1': team1_name,
                'team2': team2_name,
                'team1_strength': team1_strength,
                'team2_strength': team2_strength,
                'attendance_percentage': attendance_percentage,
                'match_importance': match_importance_value,
                'avg_team_strength': avg_team_strength,
                'team_strength_diff': team_strength_diff
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Placeholder for any API endpoints needed for the crowd monitoring page
@app.route('/api/crowd-data', methods=['GET'])
def get_crowd_data():
    # For now, return sample data
    return jsonify({
        'success': True,
        'total_count': 12628,
        'incident_count': 14,
        'alert_count': 5,
        'avg_density': 3.5
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)