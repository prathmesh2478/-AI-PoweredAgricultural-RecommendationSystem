import React, { useState } from "react";
import axios from "axios";
import "../styles/SeedPesticideRecommendation.css";

const SeedPesticideRecommendation = () => {
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    pH: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    pest: "",
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        "http://localhost:5000/recommend-seed-pesticide", 
        formData
      );
      setRecommendations(response.data);
    } catch (error) {
      setError("Failed to get recommendations. Please try again.");
      console.error("Error fetching recommendations", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seed-recommendation-container">
      <h1 className="seed-recommendation-title">Seed & Pesticide Recommendation</h1>
      
      <div className="input-card">
        <div className="card-content">
          <form onSubmit={handleSubmit} className="recommendation-form">
            {Object.keys(formData).map((key) => (
              <div key={key} className="input-group">
                <label className="input-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            ))}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Get Recommendations"}
            </button>
          </form>
        </div>
      </div>

      {isLoading && <div className="loading-spinner">Loading...</div>}
      
      {error && (
        <div className="error-card">
          <div className="card-content">
            <p className="error-message">{error}</p>
          </div>
        </div>
      )}

      {recommendations && (
        <div className="result-card">
          <div className="card-content">
            <h2 className="result-title">Recommendations</h2>
            <div className="result-item">
              <span className="result-label">Best Seed:</span>
              <span className="result-value">{recommendations.seed}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Recommended Pesticide:</span>
              <span className="result-value">{recommendations.pesticide}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeedPesticideRecommendation;