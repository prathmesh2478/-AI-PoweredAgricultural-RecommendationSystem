import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Home";
import CropRecommender from "./components/CropRecommender";
import FertilizerRecommender from "./components/FertilizerRecommender";
import Weather from "./components/Weather";
import Scheme from "./components/Scheme";
import NavBar from "./components/NavBar";
import DiseaseDetection from "./components/DiseaseDetection";
import SeedPesticideRecommendation from "./components/SeedPesticideRecommendation";


function App() {
  return (
    <div
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/background4.jpg)`
      }}
      className="container"
    >
      <div className="overlay">
      <Router>
          
          <NavBar />
          <Routes>
          <Route path="/" element={<Home />} />
              
            <Route path="/crop" element={<CropRecommender />} />
            <Route path="/fertilizer" element={<FertilizerRecommender />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/schemes" element={<Scheme />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/pest" element={<SeedPesticideRecommendation />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;


