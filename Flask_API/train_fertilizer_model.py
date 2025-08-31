import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

# Ensure the models directory exists
os.makedirs("./models/fertilizer_recommendation", exist_ok=True)

# Load dataset
try:
    df = pd.read_csv("datasets/Fertilizer_recommendation.csv")
    print("✅ Fertilizer dataset loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Dataset file not found!")
    exit()

# Rename columns to fix spelling errors
df.rename(columns={"Temparature": "Temperature", "Phosphorous": "Phosphorus"}, inplace=True)

# Encode categorical features
soil_encoder = LabelEncoder()
crop_encoder = LabelEncoder()
fertilizer_encoder = LabelEncoder()

df["Soil_Type"] = soil_encoder.fit_transform(df["Soil_Type"])
df["Crop_Type"] = crop_encoder.fit_transform(df["Crop_Type"])
df["Fertilizer"] = fertilizer_encoder.fit_transform(df["Fertilizer"])

# Save label mappings
joblib.dump(soil_encoder.classes_, "./models/fertilizer_recommendation/soiltype_dict.pkl")
joblib.dump(crop_encoder.classes_, "./models/fertilizer_recommendation/croptype_dict.pkl")
joblib.dump(fertilizer_encoder.classes_, "./models/fertilizer_recommendation/fertname_dict.pkl")
print("✅ Label dictionaries saved!")

# Features & target
X = df.drop(columns=["Fertilizer"])
y = df["Fertilizer"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train models
xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric="mlogloss")
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
svm_model = SVC(probability=True, random_state=42)

print("🚀 Training models...")
xgb_model.fit(X_train, y_train)
rf_model.fit(X_train, y_train)
svm_model.fit(X_train, y_train)
print("✅ Models trained successfully!")

# Evaluate models
def evaluate_model(model, X_test, y_test, model_name):
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"📊 {model_name} Accuracy: {accuracy:.2f}")
    
    # Get unique classes in y_test
    unique_classes = np.unique(y_test)
    target_names = [fertilizer_encoder.classes_[i] for i in unique_classes]
    
    print(f"📝 {model_name} Classification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))

evaluate_model(xgb_model, X_test, y_test, "XGBoost")
evaluate_model(rf_model, X_test, y_test, "Random Forest")
evaluate_model(svm_model, X_test, y_test, "SVM")

# Save models
joblib.dump(xgb_model, "./models/fertilizer_recommendation/xgb_pipeline.pkl")
joblib.dump(rf_model, "./models/fertilizer_recommendation/rf_pipeline.pkl")
joblib.dump(svm_model, "./models/fertilizer_recommendation/svm_pipeline.pkl")
print("✅ Fertilizer models saved successfully!")