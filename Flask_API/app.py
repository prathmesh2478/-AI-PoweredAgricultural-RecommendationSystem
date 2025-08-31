from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import joblib
import numpy as np
import pandas as pd
from scipy import stats
import openai
import os
from dotenv import load_dotenv
import warnings
warnings.simplefilter(action="ignore", category=FutureWarning)


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get OpenAI API Key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/", methods=["GET"])
def home():
    return "Flask API is running!"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get("message", "")

        if not openai.api_key:
            return jsonify({"error": "OpenAI API key is missing"}), 500

        # Generate a response from OpenAI GPT
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_input}]
        )
        chatbot_reply = response["choices"][0]["message"]["content"]
        return jsonify({"response": chatbot_reply})

    except openai.error.OpenAIError as e:
        return jsonify({"error": f"OpenAI API Error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Load Models for Crop Recommendation
crop_xgb_pipeline = joblib.load("./models/crop_recommendation/xgb_pipeline.pkl")
crop_rf_pipeline = joblib.load("./models/crop_recommendation/rf_pipeline.pkl")
crop_knn_pipeline = joblib.load("./models/crop_recommendation/knn_pipeline.pkl")
crop_label_dict = joblib.load("./models/crop_recommendation/label_dictionary.pkl")

# Load Models for Fertilizer Recommendation
fertilizer_xgb_pipeline = joblib.load("./models/fertilizer_recommendation/xgb_pipeline.pkl")
fertilizer_rf_pipeline = joblib.load("./models/fertilizer_recommendation/rf_pipeline.pkl")
fertilizer_svm_pipeline = joblib.load("./models/fertilizer_recommendation/svm_pipeline.pkl")
fertilizer_label_dict = joblib.load("./models/fertilizer_recommendation/fertname_dict.pkl")
soiltype_label_dict = joblib.load("./models/fertilizer_recommendation/soiltype_dict.pkl")
croptype_label_dict = joblib.load("./models/fertilizer_recommendation/croptype_dict.pkl")

def convert(o):
    if isinstance(o, np.generic):
        return o.item()
    raise TypeError

def crop_prediction(input_data):
    predictions = {
        "xgb": crop_label_dict[crop_xgb_pipeline.predict(input_data)[0]],
        "rf": crop_label_dict[crop_rf_pipeline.predict(input_data)[0]],
        "knn": crop_label_dict[crop_knn_pipeline.predict(input_data)[0]]
    }

    probabilities = {
        "xgb": np.max(crop_xgb_pipeline.predict_proba(input_data)) * 100,
        "rf": np.max(crop_rf_pipeline.predict_proba(input_data)) * 100
    }

    # Handle KNN predict_proba if available
    if hasattr(crop_knn_pipeline, "predict_proba"):
        probabilities["knn"] = np.max(crop_knn_pipeline.predict_proba(input_data)) * 100
    else:
        probabilities["knn"] = 0  # If not available, assign 0%

    # Use Pandas DataFrame mode() to avoid SciPy warning
    prediction_df = pd.DataFrame(list(predictions.values()), columns=["Prediction"])
    final_prediction = prediction_df["Prediction"].mode()[0]  # Get most common prediction

    predictions["final_prediction"] = final_prediction
    predictions["probabilities"] = probabilities

    return predictions

def fertilizer_prediction(input_data):
    predictions = {
        "xgb": fertilizer_label_dict[fertilizer_xgb_pipeline.predict(input_data)[0]],
        "rf": fertilizer_label_dict[fertilizer_rf_pipeline.predict(input_data)[0]],
        "svm": fertilizer_label_dict[fertilizer_svm_pipeline.predict(input_data)[0]]
    }
    probabilities = {
        "xgb": np.max(fertilizer_xgb_pipeline.predict_proba(input_data)) * 100,
        "rf": np.max(fertilizer_rf_pipeline.predict_proba(input_data)) * 100,
        "svm": np.max(fertilizer_svm_pipeline.predict_proba(input_data)) * 100
    }
    final_prediction = stats.mode(list(predictions.values()), keepdims=True).mode[0]
    predictions["final_prediction"] = final_prediction
    predictions["probabilities"] = probabilities
    return predictions

@app.route("/predict_crop", methods=["POST"])
def predictcrop():
    try:
        form_values = request.form.to_dict()
        column_names = ["Nitrogen", "Phosphorus", "Potassium", "Temperature", "Humidity", "pH_Value", "Rainfall"]
        input_data = np.asarray([float(form_values[col]) for col in column_names]).reshape(1, -1)
        prediction = crop_prediction(input_data)
        return json.dumps(prediction, default=convert)
    except Exception as e:
        return json.dumps({"error": str(e)}, default=convert), 400

@app.route("/predict_fertilizer", methods=["POST"])
def predictfertilizer():
    try:
        form_values = request.form.to_dict()
        if form_values["Soil_Type"] not in soiltype_label_dict or form_values["Crop_Type"] not in croptype_label_dict:
            raise ValueError("Invalid Soil Type or Crop Type")

        soil_type_encoded = np.where(soiltype_label_dict == form_values["Soil_Type"])[0][0]
        crop_type_encoded = np.where(croptype_label_dict == form_values["Crop_Type"])[0][0]

        column_names = ["Temperature", "Humidity", "Moisture", "Soil_Type", "Crop_Type", "Nitrogen", "Potassium", "Phosphorus"]
        input_data = np.asarray([
            float(form_values["Temperature"]),
            float(form_values["Humidity"]),
            float(form_values["Moisture"]),
            soil_type_encoded,
            crop_type_encoded,
            float(form_values["Nitrogen"]),
            float(form_values["Potassium"]),
            float(form_values["Phosphorus"]),
        ]).reshape(1, -1)

        prediction = fertilizer_prediction(input_data)
        return json.dumps(prediction, default=convert)
    except Exception as e:
        return json.dumps({"error": str(e)}, default=convert), 400

if __name__ == "__main__":
    app.run(debug=True)

