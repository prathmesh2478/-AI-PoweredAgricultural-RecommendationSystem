import React, { useState } from 'react'
import { NavLink, useNavigate } from "react-router-dom"
import { MenuList } from "./MenuList"
import "../styles/NavBar.css"
import 'font-awesome/css/font-awesome.min.css';

const Navbar = () => {
    const [clicked, setClicked] = useState(false);

    const history = useNavigate()

    const menuList = MenuList.map(({ url, title }, index) => {
      return (
        <li key={index}>
          <NavLink exact to={url} className={({ isActive }) => (isActive ? "active" : "")}>
            {title}
          </NavLink>
        </li>
      );
    });
  
    const handleClick = () => {
      setClicked(!clicked);
    };

    const handleTitleClick = () => {
      history('/your-route');
    }
  
    return (
      <nav>
        <div onClick={handleTitleClick} className="logo">
          Agri <font>Smart</font>
        </div>
        <div className="menu-icon" onClick={handleClick}>
          <i className={clicked ? "fa fa-times" : "fa fa-bars"}></i>
        </div>
        <ul className={clicked ? "menu-list" : "menu-list close"}>{menuList}</ul>
      </nav>
    );
  };
  
  export default Navbar;
