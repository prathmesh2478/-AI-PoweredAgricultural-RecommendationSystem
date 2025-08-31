import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

# Ensure the models directory exists
os.makedirs("./models/crop_recommendation", exist_ok=True)

# Load dataset
try:
    df = pd.read_csv("datasets/Crop_Recommendation.csv")
    print("✅ Crop dataset loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Dataset file not found!")
    exit()

# Encode categorical target variable
crop_encoder = LabelEncoder()
df["Crop"] = crop_encoder.fit_transform(df["Crop"])

# Save label dictionary
joblib.dump(crop_encoder.classes_, "./models/crop_recommendation/label_dictionary.pkl")
print("✅ Label dictionary saved!")

# Features & target
X = df.drop(columns=["Crop"])
y = df["Crop"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train models
xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric="mlogloss")
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
knn_model = KNeighborsClassifier(n_neighbors=5)

print("🚀 Training models...")
xgb_model.fit(X_train, y_train)
rf_model.fit(X_train, y_train)
knn_model.fit(X_train, y_train)
print("✅ Models trained successfully!")

# Evaluate models
def evaluate_model(model, X_test, y_test, model_name):
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred) * 100  # Convert to percentage
    print(f"📊 {model_name} Accuracy: {accuracy:.2f}%")  # Show as percentage
    
    # Get unique classes in y_test
    unique_classes = np.unique(y_test)
    target_names = [crop_encoder.classes_[i] for i in unique_classes]
    
    print(f"📝 {model_name} Classification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))

evaluate_model(xgb_model, X_test, y_test, "XGBoost")
evaluate_model(rf_model, X_test, y_test, "Random Forest")
evaluate_model(knn_model, X_test, y_test, "KNN")

# Save models
joblib.dump(xgb_model, "./models/crop_recommendation/xgb_pipeline.pkl")
joblib.dump(rf_model, "./models/crop_recommendation/rf_pipeline.pkl")
joblib.dump(knn_model, "./models/crop_recommendation/knn_pipeline.pkl")
print("✅ Crop models saved successfully!")
