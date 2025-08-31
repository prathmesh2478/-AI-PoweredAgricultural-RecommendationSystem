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
import { fertilizerData } from "./Data";
import Loading from './Loading';

// Icons
import ScienceIcon from '@mui/icons-material/Science';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import OpacityIcon from '@mui/icons-material/Opacity';
import WaterDropIcon from '@mui/icons-material/WaterDropOutlined';
import SoilIcon from '@mui/icons-material/Landscape';
import AgricultureIcon from '@mui/icons-material/Agriculture';

const useStyles = makeStyles({
  root: {
    maxWidth: 700,
    borderRadius: 24,
    boxShadow: '0 20px 40px rgba(62, 128, 62, 0.15)',
    overflow: 'hidden',
    background: 'linear-gradient(145deg, #f5fff5, #e6f3e6)',
    border: '1px solid rgba(46, 125, 50, 0.1)'
  },
  header: {
    background: 'linear-gradient(135deg, #1e5631, #4caf50)',
    color: 'white',
    padding: '32px',
    textAlign: 'center',
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: 'linear-gradient(90deg, #ffeb3b, #8bc34a, #2e7d32)'
    }
  },
  formContainer: {
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.95)'
  },
  inputField: {
    marginBottom: '24px',
    '& .MuiFilledInput-root': {
      borderRadius: '16px',
      background: 'rgba(245, 255, 245, 0.7)',
      border: '1px solid rgba(46, 125, 50, 0.15)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(235, 245, 235, 0.8)',
        boxShadow: '0 4px 8px rgba(46, 125, 50, 0.1)'
      },
      '&.Mui-focused': {
        background: 'rgba(225, 242, 225, 0.9)',
        borderColor: '#2e7d32',
        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
      }
    }
  },
  predictButton: {
    background: 'linear-gradient(135deg, #1e5631, #4caf50)',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '16px',
    fontSize: '1.2rem',
    fontWeight: '600',
    textTransform: 'none',
    boxShadow: '0 6px 12px rgba(46, 125, 50, 0.25)',
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
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(46, 125, 50, 0.1)',
    marginRight: '16px',
    color: '#1e5631',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(46, 125, 50, 0.2)',
      transform: 'scale(1.1)'
    }
  },
  divider: {
    margin: '32px 0',
    background: 'rgba(46, 125, 50, 0.15)'
  }
});

const inputIcons = {
  Nitrogen: <ScienceIcon />,
  Potassium: <AgricultureIcon />,
  Phosphorus: <ScienceIcon />,
  Temperature: <WhatshotIcon />,
  Humidity: <OpacityIcon />,
  Moisture: <WaterDropIcon />,
  Soil_Type: <SoilIcon />,
  Crop_Type: <AgricultureIcon />
};

function FertilizerRecommender() {
  const [formData, setFormData] = useState({
    Temperature: "",
    Humidity: "",
    Moisture: "",
    Soil_Type: "select",
    Crop_Type: "select",
    Nitrogen: "",
    Potassium: "",
    Phosphorus: "",
  });

  const [predictionData, setPredictionData] = useState({});
  const [loadingStatus, setLoadingStatus] = useState(false);
  const classes = useStyles();

  const formRenderData = [
    { name: "Nitrogen", description: "Nitrogen in Soil (kg/ha)", min: 0, max: 200 },
    { name: "Potassium", description: "Potassium in Soil (kg/ha)", min: 0, max: 200 },
    { name: "Phosphorus", description: "Phosphorus in Soil (kg/ha)", min: 0, max: 200 },
    { name: "Temperature", description: "Temperature (°C)", min: -10, max: 50 },
    { name: "Humidity", description: "Humidity (%)", min: 0, max: 100 },
    { name: "Moisture", description: "Soil Moisture (%)", min: 0, max: 100 },
  ];

  const soilTypes = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
  const cropTypes = ['Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'];

  const handleChange = (e, changeKey = undefined) => {
    setFormData(prev => ({
      ...prev,
      [changeKey || e.target.name]: e.target.value
    }));
  };

  const handleClick = async () => {
    // Validate form data
    if (Object.values(formData).some(value => value === "" || value === "select")) {
      setPredictionData({ error: "Please fill all fields before predicting." });
      return;
    }
  
    // Ensure numeric fields are valid numbers
    const numericFields = ["Temperature", "Humidity", "Moisture", "Nitrogen", "Potassium", "Phosphorus"];
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
  
      const response = await api.post("/predict_fertilizer", request);
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
    const predictedFertilizer = fertilizerData[predictionData.final_prediction] || {
      title: "Unknown Fertilizer",
      description: "No additional information available.",
      imageUrl: "/default-fertilizer-image.jpg"
    };

    return (
      <Container maxWidth="md" style={{ marginTop: '45px',marginBottom:'45px', marginLeft: '375px' }}>
        <Card className={classes.root} elevation={12}>
          <CardMedia
            component="img"
            alt={predictedFertilizer.title}
            height="400"
            image={predictedFertilizer.imageUrl}
            title={predictedFertilizer.title}
            style={{ 
              objectFit: 'cover', 
              filter: 'brightness(0.9) saturate(1.2)' 
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
              Recommended Fertilizer: {predictedFertilizer.title}
            </Typography>
            <Typography variant="body1" style={{ 
              color: '#333',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              {predictedFertilizer.description}
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
                    <TableCell style={{ fontWeight: '600', color: '#1e5631', textAlign: 'center' }}>Model</TableCell>
                    <TableCell style={{ fontWeight: '600', color: '#1e5631', textAlign: 'center' }}>Prediction</TableCell>
                    <TableCell style={{ fontWeight: '600', color: '#1e5631', textAlign: 'center' }}>Confidence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">XGBoost</TableCell>
                    <TableCell align="center">{predictionData.xgb || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {predictionData.probabilities?.xgb ? 
                        `${predictionData.probabilities.xgb.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <TableCell align="center">RandomForest</TableCell>
                    <TableCell align="center">{predictionData.rf || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {predictionData.probabilities?.rf ? 
                        `${predictionData.probabilities.rf.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">SVM</TableCell>
                    <TableCell align="center">{predictionData.svm || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {predictionData.probabilities?.svm ? 
                        `${predictionData.probabilities.svm.toFixed(2)}%` : 'N/A'}
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
              startIcon={<ScienceIcon />}
              fullWidth
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
    <Container maxWidth="md" style={{ marginTop: '45px', marginLeft: '375px'  }}>
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
            <ScienceIcon style={{ fontSize: '2.8rem', marginRight: '16px' }} />
            Fertilizer Recommender
          </Typography>
          <Typography variant="subtitle1" style={{ 
            fontSize: '1.1rem', 
            opacity: '0.9', 
            marginBottom: '0',
            textAlign: 'center'
          }}>
            Optimize your fertilization strategy with intelligent recommendations
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
            
            {/* Soil Type Dropdown */}
            <Grid item xs={12} sm={6}>
              <div className={classes.inputField}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%' 
                }}>
                  <div className={classes.iconContainer}>
                    {inputIcons.Soil_Type}
                  </div>
                  <TextField
                    select
                    name="Soil_Type"
                    label="Soil Type"
                    value={formData.Soil_Type}
                    onChange={(e) => handleChange(e, "Soil_Type")}
                    variant="filled"
                    fullWidth
                    SelectProps={{ native: true }}
                    InputProps={{
                      disableUnderline: true
                    }}
                  >
                    <option value="select">Select Soil Type</option>
                    {soilTypes.map((soiltype) => (
                      <option key={soiltype} value={soiltype}>{soiltype}</option>
                    ))}
                  </TextField>
                </div>
              </div>
            </Grid>
            
            {/* Crop Type Dropdown */}
            <Grid item xs={12} sm={6}>
              <div className={classes.inputField}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%' 
                }}>
                  <div className={classes.iconContainer}>
                    {inputIcons.Crop_Type}
                  </div>
                  <TextField
                    select
                    name="Crop_Type"
                    label="Crop Type"
                    value={formData.Crop_Type}
                    onChange={(e) => handleChange(e, "Crop_Type")}
                    variant="filled"
                    fullWidth
                    SelectProps={{ native: true }}
                    InputProps={{
                      disableUnderline: true
                    }}
                  >
                    <option value="select">Select Crop Type</option>
                    {cropTypes.map((croptype) => (
                      <option key={croptype} value={croptype}>{croptype}</option>
                    ))}
                  </TextField>
                </div>
              </div>
            </Grid>
          </Grid>
          
          <Divider className={classes.divider} />
          
          <Box display="flex" justifyContent="center">
            <Button 
              onClick={handleClick} 
              variant="contained" 
              size="large"
              className={classes.predictButton}
              disabled={loadingStatus}
              endIcon={loadingStatus ? <CircularProgress size={24} color="inherit" /> : <ScienceIcon />}
              fullWidth
            >
              {loadingStatus ? "Analyzing..." : "Predict Fertilizer"}
            </Button>
          </Box>
        </div>
      </Card>
    </Container>
  );
}

export default FertilizerRecommender;