// src/components/NavbarComponent.js
import React from "react";
import { Link } from "react-router-dom";

function NavbarComponent() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Scheme Finder</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/schemes">Schemes</Link></li>
            <li className="nav-item"><a className="nav-link" href="#loans">Loans</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavbarComponent;
