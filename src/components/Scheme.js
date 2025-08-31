import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Scheme.css";
import schemesData from "../data/schemes.json"; // Import JSON data

function Scheme() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemes, setSchemes] = useState([]);

  // Load JSON data into state
  useEffect(() => {
    setSchemes(schemesData);
  }, []);

  const filteredSchemes = schemes.filter((scheme) =>
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-5 scheme-container">
      <div className="d-flex justify-content-center mb-5">
        <h2 className="hero-title text-white p-4 rounded-lg fw-bold text-center">
          <span className="hero-emoji">🌾</span> Government Schemes for Farmers <span className="hero-emoji">🌾</span>
        </h2>
      </div>
      
      <div className="mb-5 text-center">
        <div className="search-wrapper mx-auto">
          <input
            type="text"
            className="form-control search-input"
            placeholder="🔍 Search for a scheme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="schemes-count mt-2">
          Showing {filteredSchemes.length} schemes
        </div>
      </div>
      
      <div className="row g-4">
        {filteredSchemes.map((scheme, index) => (
          <div className="col-md-4" key={index}>
            <div
              className="card scheme-card h-100"
              onClick={() => setSelectedScheme(scheme)}
            >
              <div className="scheme-icon">
                <i className="bi bi-file-earmark-text"></i>
              </div>
              <div className="card-body text-center d-flex flex-column">
                <h5 className="card-title fw-bold mb-3">{scheme.name}</h5>
                <p className="card-text flex-grow-1">{scheme.description}</p>
                <button className="btn learn-more-btn mt-3">
                  Learn More <i className="bi bi-arrow-right-circle ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredSchemes.length === 0 && (
        <div className="text-center mt-5 no-results">
          <i className="bi bi-search mb-3"></i>
          <h4>No schemes found matching "{searchTerm}"</h4>
          <p>Try a different search term or clear the search</p>
        </div>
      )}

      {/* Bootstrap Modal */}
      {selectedScheme && (
        <div
          className="modal fade show d-block custom-modal"
          id="schemeModal"
          tabIndex="-1"
          aria-labelledby="schemeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{selectedScheme.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedScheme(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="scheme-details">{selectedScheme.details}</p>
                <a
                  href={selectedScheme.link}
                  className="btn official-site-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Official Site <i className="bi bi-box-arrow-up-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close modal */}
      {selectedScheme && (
        <div 
          className="modal-backdrop fade show" 
          onClick={() => setSelectedScheme(null)}
        ></div>
      )}
    </div>
  );
}

export default Scheme;