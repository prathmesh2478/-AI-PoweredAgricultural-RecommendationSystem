import React, { useState } from "react";
import axios from "axios";
import { Button, CircularProgress, Typography, Box, Paper } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';

const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [disease, setDisease] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setDisease(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("http://localhost:5000/detect_disease", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setDisease(response.data.disease);
      setConfidence((response.data.confidence * 100).toFixed(2));
    } catch (error) {
      console.error("Error detecting disease", error);
      setError("Failed to detect disease. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Plant Disease Detection
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="upload-image"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="upload-image">
            <Button
              variant="contained"
              component="span"
              startIcon={<ImageIcon />}
              fullWidth
            >
              Upload Plant Image
            </Button>
          </label>
        </Box>

        {preview && (
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "4px" }}
            />
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !image}
          fullWidth
          sx={{ mb: 3 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Detect Disease"}
        </Button>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {disease && (
          <Box sx={{ 
            p: 2, 
            border: "1px solid #ddd", 
            borderRadius: 1,
            backgroundColor: "#f9f9f9"
          }}>
            <Typography variant="h6" gutterBottom>
              Detection Results:
            </Typography>
            <Typography>
              <strong>Disease:</strong> {disease}
            </Typography>
            <Typography>
              <strong>Confidence:</strong> {confidence}%
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Upload a clear image of a plant leaf for disease detection.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DiseaseDetection;