import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  CircularProgress,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Grid,
  Box,
  Container,
  Divider
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import api from "../api/recommenderapi";
import { cropData } from "./Data";
import Loading from './Loading';
import NatureIcon from '@mui/icons-material/Nature';
import GrassIcon from '@mui/icons-material/Grass';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import CloudIcon from '@mui/icons-material/Cloud';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const useStyles = makeStyles({
  root: {
    maxWidth: 700, // Slightly wider
    borderRadius: 24, // Increased border radius
    boxShadow: '0 20px 40px rgba(62, 128, 62, 0.15)', // Enhanced shadow
    overflow: 'hidden',
    background: 'linear-gradient(145deg, #f5fff5, #e6f3e6)', // Softer gradient
    border: '1px solid rgba(46, 125, 50, 0.1)'
  },
  header: {
    background: 'linear-gradient(135deg, #1e5631, #4caf50)', // Deeper green gradient
    color: 'white',
    padding: '32px', // More padding
    textAlign: 'center',
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '6px', // Slightly thicker accent line
      background: 'linear-gradient(90deg, #ffeb3b, #8bc34a, #2e7d32)'
    }
  },
  formContainer: {
    padding: '40px', // More spacious padding
    background: 'rgba(255, 255, 255, 0.70)'
  },
  inputField: {
    marginBottom: '24px', // More space between inputs
    '& .MuiFilledInput-root': {
      borderRadius: '16px', // Softer rounded corners
      background: 'rgba(245, 255, 245, 0.7)', // Lighter, more translucent background
      border: '1px solid rgba(46, 125, 50, 0.15)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(235, 245, 235, 0.8)',
        boxShadow: '0 4px 8px rgba(46, 125, 50, 0.1)' // Subtle hover effect
      },
      '&.Mui-focused': {
        background: 'rgba(225, 242, 225, 0.9)',
        borderColor: '#2e7d32',
        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
      }
    }
  },
  predictButton: {
    background: 'linear-gradient(135deg, #1e5631, #4caf50)', // Deeper green gradient
    color: 'white',
    padding: '16px 32px', // Larger button
    borderRadius: '16px',
    fontSize: '1.2rem',
    fontWeight: '600',
    textTransform: 'none',
    boxShadow: '0 6px 12px rgba(46, 125, 50, 0.25)', // Enhanced shadow
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.35)',
      background: 'linear-gradient(135deg, #144022, #2e7d32)'
    }
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px', // Slightly larger
    height: '48px', // Slightly larger
    borderRadius: '50%',
    background: 'rgba(46, 125, 50, 0.1)',
    marginRight: '16px',
    color: '#1e5631', // Deeper green
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(46, 125, 50, 0.2)',
      transform: 'scale(1.1)'
    }
  },
  divider: {
    margin: '32px 0', // More space
    background: 'rgba(46, 125, 50, 0.15)'
  }
});

const inputIcons = {
  Nitrogen: <AgricultureIcon />,
  Phosphorus: <GrassIcon />,
  Potassium: <ScienceIcon />,
  Temperature: <WhatshotIcon />, // Changed to more expressive icon
  Humidity: <OpacityIcon />,
  pH_Value: <ThermostatIcon />, // Changed to represent pH scale
  Rainfall: <CloudIcon />
};

function CropRecommender() {
  const classes = useStyles();

  const [formData, setFormData] = useState({
    Nitrogen: "",
    Phosphorus: "",
    Potassium: "",
    Temperature: "",
    Humidity: "",
    pH_Value: "",
    Rainfall: ""
  });

  const [predictionData, setPredictionData] = useState({});
  const [loadingStatus, setLoadingStatus] = useState(false);

  const formRenderData = [
    { name: "Nitrogen", description: "Nitrogen in Soil (kg/ha)", min: 0, max: 200 },
    { name: "Phosphorus", description: "Phosphorus in Soil (kg/ha)", min: 0, max: 200 },
    { name: "Potassium", description: "Potassium in Soil (kg/ha)", min: 0, max: 200 },
    { name: "Temperature", description: "Temperature (°C)", min: -10, max: 50 },
    { name: "Humidity", description: "Humidity (%)", min: 0, max: 100 },
    { name: "pH_Value", description: "Soil pH Value", min: 0, max: 14 },
    { name: "Rainfall", description: "Rainfall (mm)", min: 0, max: 3000 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClick = async () => {
    if (Object.values(formData).some(value => value.trim() === "")) {
      setPredictionData({ error: "Please fill all the fields before predicting." });
      return;
    }
  
    const numericFields = ["Nitrogen", "Phosphorus", "Potassium", "Temperature", "Humidity", "pH_Value", "Rainfall"];
    for (const field of numericFields) {
      if (isNaN(formData[field])) {
        setPredictionData({ error: `Invalid value for ${field}. Please enter a number.` });
        return;
      }
    }
  
    setLoadingStatus(true);
  
    try {
      const request = new FormData();
      for (let key in formData) {
        request.append(key, formData[key]);
      }
  
      const response = await api.post("/predict_crop", request);
      setPredictionData(response.data);
    } catch (error) {
      setPredictionData({ error: "Failed to fetch prediction. Please try again." });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleBackClick = () => {
    setPredictionData({});
  };

  if (predictionData.final_prediction) {
    const predictedCrop = cropData[predictionData.final_prediction] || {
      title: "Unknown Crop",
      description: "No additional information available.",
      imageUrl: "/default-crop-image.jpg"
    };

    return (
      <Container maxWidth="md" style={{ marginTop: '45px',marginBottom:'45px', marginLeft: '375px' }}>
        <Card className={classes.root} elevation={12}>
          <CardMedia
            component="img"
            alt={predictedCrop.title}
            height="400"
            image={predictedCrop.imageUrl}
            title={predictedCrop.title}
            style={{ 
              objectFit: 'cover', 
              filter: 'brightness(0.9) saturate(1.2)' // Slight image enhancement
            }}
          />
          <CardContent style={{ padding: '40px' }}>
            <Typography variant="h3" style={{ 
              color: '#1e5631',
              fontWeight: '700',
              marginBottom: '24px',
              textAlign: 'center',
              letterSpacing: '-1px'
            }}>
              Recommended Crop: {predictedCrop.title}
            </Typography>
            <Typography variant="body1" style={{ 
              color: '#333',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              {predictedCrop.description}
            </Typography>
            
            <Divider className={classes.divider} />
            
            <Typography variant="h5" style={{ 
              color: '#1e5631',
              marginBottom: '24px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              Prediction Insights
            </Typography>
            
            <TableContainer component={Paper} elevation={0} style={{ 
              borderRadius: '16px',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.05)'
            }}>
              <Table>
                <TableHead style={{ background: 'rgba(46, 125, 50, 0.05)' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: '600', color: '#1e5631' }}>Model</TableCell>
                    <TableCell style={{ fontWeight: '600', color: '#1e5631' }}>Prediction</TableCell>
                    <TableCell style={{ fontWeight: '600', color: '#1e5631' }}>Confidence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>XGBoost</TableCell>
                    <TableCell>{predictionData.xgb || 'N/A'}</TableCell>
                    <TableCell>
                      {predictionData.probabilities?.xgb ? 
                        `${predictionData.probabilities.xgb.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <TableCell>RandomForest</TableCell>
                    <TableCell>{predictionData.rf || 'N/A'}</TableCell>
                    <TableCell>
                      {predictionData.probabilities?.rf ? 
                        `${predictionData.probabilities.rf.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>KNN</TableCell>
                    <TableCell>{predictionData.knn || 'N/A'}</TableCell>
                    <TableCell>
                      {predictionData.probabilities?.knn ? 
                        `${predictionData.probabilities.knn.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions style={{ justifyContent: 'center', padding: '0 40px 40px' }}>
            <Button 
              onClick={handleBackClick} 
              variant="contained" 
              size="large"
              className={classes.predictButton}
              startIcon={<NatureIcon />}
            >
              New Prediction
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  } else if (loadingStatus) {
    return <Loading />;
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '45px', marginLeft: '375px'}}>
      <Card className={classes.root} elevation={12}>
        <div className={classes.header}>
          <Typography variant="h1" style={{ 
            fontSize: '2.8rem', 
            fontWeight: '700', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '-1px'
          }}>
            <NatureIcon style={{ fontSize: '2.8rem', marginRight: '16px' }} />
            Crop Recommender
          </Typography>
          <Typography variant="subtitle1" style={{ 
            fontSize: '1.1rem', 
            opacity: '0.9', 
            marginBottom: '0',
            textAlign: 'center'
          }}>
            Optimize your agricultural strategy with intelligent crop recommendations
          </Typography>
        </div>
        
        <div className={classes.formContainer}>
          {predictionData.error && (
            <Alert severity="error" style={{ 
              marginBottom: '32px', 
              borderRadius: '16px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              {predictionData.error}
            </Alert>
          )}
          
          <Grid container spacing={4}>
            {formRenderData.map((formAttribute) => (
              <Grid item xs={12} sm={6} key={formAttribute.name}>
                <div className={classes.inputField}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%' 
                  }}>
                    <div className={classes.iconContainer}>
                      {inputIcons[formAttribute.name]}
                    </div>
                    <TextField
                      onChange={handleChange}
                      value={formData[formAttribute.name]}
                      name={formAttribute.name}
                      variant="filled"
                      label={formAttribute.description}
                      type="number"
                      fullWidth
                      InputProps={{
                        disableUnderline: true,
                        inputProps: {
                          min: formAttribute.min,
                          max: formAttribute.max
                        }
                      }}
                    />
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
          
          <Divider className={classes.divider} style={{marginBottom: "35px"}}/>
          
          <Box display="flex" justifyContent="center">
            <Button 
              onClick={handleClick} 
              variant="contained" 
              size="large"
              className={classes.predictButton}
              disabled={loadingStatus}
              endIcon={loadingStatus ? <CircularProgress size={24} color="inherit" /> : <NatureIcon />}
            >
              {loadingStatus ? "Analyzing..." : "Predict Optimal Crop"}
            </Button>
          </Box>
        </div>
      </Card>
    </Container>
  );
}

export default CropRecommender;