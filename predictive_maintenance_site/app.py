import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Define paths for models and scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "phase2_models", "saved_models")
OUTPUTS_DIR = os.path.join(BASE_DIR, "..", "phase2_models", "outputs")


# Load Models and Scaler
def load_models():
    model_path = os.path.join(MODELS_DIR, "hybrid.pkl")
    hybrid_model = None
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            hybrid_model = pickle.load(f)
    else:
        print(f"Warning: hybrid.pkl not found at {model_path}")
            
    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    scaler = None
    if os.path.exists(scaler_path):
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
    else:
        print(f"Warning: scaler.pkl not found at {scaler_path}")
            
    return hybrid_model, scaler

hybrid_model, _scaler = load_models()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/evaluation")
def evaluation():
    import json
    eval_path = os.path.join(OUTPUTS_DIR, "model_evaluation.json")
    if os.path.exists(eval_path):
        with open(eval_path) as f:
            return jsonify(json.load(f))
    return jsonify({})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        
        # Machine Type Mapping (L=0, M=1, H=2)
        type_mapping = {"L": 0, "M": 1, "H": 2}
        machine_type = type_mapping.get(data.get("type"), 0)
        
        # Extract features
        features = [
            machine_type,
            float(data.get("air_temp")),
            float(data.get("process_temp")),
            float(data.get("rot_speed")),
            float(data.get("torque")),
            float(data.get("tool_wear"))
        ]
        
        # Prepare for scaling (must be 2D array)
        features_df = pd.DataFrame([features], columns=[
            "Type", "Air temperature [K]", "Process temperature [K]", 
            "Rotational speed [rpm]", "Torque [Nm]", "Tool wear [min]"
        ])
        
        # Scale features
        if _scaler:
            features_scaled = _scaler.transform(features_df)
        else:
            features_scaled = features_df.values
            
        # Get prediction from the Hybrid model
        if hybrid_model:
            pred = int(hybrid_model.predict(features_scaled)[0])
            prediction = "Failure" if pred == 1 else "No Failure"
        else:
            return jsonify({"status": "error", "message": "Model not loaded"}), 500
            
        return jsonify({
            "status": "success",
            "prediction": prediction
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

if __name__ == "__main__":
    # Use PORT from environment for deployment, fallback to 5000 for local
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)