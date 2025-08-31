import React, { useState,  } from 'react';
import './Weather.css';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'ff0e6316dbc9b120d06a1fed51f32672';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const Weather = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'

  const [currentDate] = useState(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

//   useEffect(() => {
//     getWeatherByLocation('London');
//   }, [""]);

  const getWeatherByLocation = async (location) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}?q=${location}&units=${unit}&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeatherData(data);
      } else {
        setError(data.message || 'Location not found. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLoading(true);
          setError(null);
          try {
            const response = await fetch(
              `${BASE_URL}?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${API_KEY}`
            );
            const data = await response.json();
            setWeatherData(data);
          } catch (err) {
            console.error('Error fetching weather:', err);
            setError('Failed to fetch weather data. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to retrieve your location. Please enter a location manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSearch = () => {
    if (location.trim()) {
      getWeatherByLocation(location.trim());
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter' && location.trim()) {
      getWeatherByLocation(location.trim());
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (weatherData) {
      getWeatherByLocation(weatherData.name);
    }
  };

  const checkForAlerts = () => {
    if (!weatherData) return [];

    const alerts = [];
    const temp = weatherData.main.temp;
    const windSpeed = weatherData.wind.speed;
    const weatherMain = weatherData.weather[0].main.toLowerCase();

    // Temperature alerts
    if (temp > (unit === 'metric' ? 35 : 95)) {
      alerts.push(`High temperature warning: ${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`);
    } else if (temp < (unit === 'metric' ? 0 : 32)) {
      alerts.push(`Low temperature warning: ${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`);
    }

    // Wind alerts
    if (windSpeed > (unit === 'metric' ? 20 : 12.5)) { // 20 km/h ≈ 12.5 mph
      alerts.push(`High wind warning: ${Math.round(windSpeed)} ${unit === 'metric' ? 'km/h' : 'mph'}`);
    }

    // Precipitation alerts
    if (weatherMain.includes('rain')) {
      alerts.push('Rain alert: Precipitation expected');
    } else if (weatherMain.includes('snow')) {
      alerts.push('Snow alert: Snowfall expected');
    }

    return alerts;
  };

  const alerts = checkForAlerts();

  return (
    <div className="weather-container">
      <h1>Hyperlocal Weather</h1>

      <div className="search-container">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyUp={handleKeyUp}
          placeholder="Enter city or zip code"
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={getWeatherByGeolocation}>Use My Location</button>
        <button onClick={toggleUnit} className="unit-toggle">
          Switch to {unit === 'metric' ? '°F' : '°C'}
        </button>
      </div>

      {loading && <div className="loading">Loading weather data...</div>}
      {error && <div className="error">{error}</div>}

      {weatherData && (
        <div className="weather-card">
          <div className="weather-header">
            <h2>{`${weatherData.name}, ${weatherData.sys.country}`}</h2>
            <p>{currentDate}</p>
          </div>

          <div className="weather-main">
            <div className="temperature">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
              />
              <span>{Math.round(weatherData.main.temp)}</span>
              <span className="unit">°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <div className="details">
              <p className="description">{weatherData.weather[0].description}</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind: {Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'km/h' : 'mph'}</p>
              <p>Feels like: {Math.round(weatherData.main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}</p>
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="alerts">
              {alerts.map((alert, index) => (
                <p key={index}>⚠️ {alert}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Weather;