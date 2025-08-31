import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router'
import "../styles/Banner.css"


function Banner() {

    let history = useNavigate()

    const cropRedirect = () => {
        history("/crop")
    }

    const fertRedirect = () => {
        history("/fertilizer")
    }

    const diseaseRedirect = () => {
        history("/disease")
    }
    const pestRedirect = () => {
        history("/pest")
    }
    
    

    
    
    return (
        <div className="banner">
            <div className="banner__title">
                <div className="banner__title_head">
                Agri <font>Smart</font>
                </div>
                <div className="banner__title_tail">
                    <div className="typing">A Machine Learning based Web Application for Crop, Fertilizer and Seed Recommendation which also helps farmers to find Government Schemes</div>
                    <div id="google_translate_element" style={{ marginTop: "10px"}}></div>
                    <div className="banner__buttons">
                        <Button onClick={cropRedirect} className="banner__button cropButton">Crop Recommender</Button>
                        <Button onClick={fertRedirect} className="banner__button fertilizerButton">Fertilizer Recommender</Button>
                        <Button onClick={pestRedirect} className="banner__button pestButton">Seed Recommender</Button>
                        <Button onClick={diseaseRedirect} className="banner__button cropButton">Climate Prediction</Button>
                    </div>

                    
                    
                    <div className="banner__socialMedia">
                        <a className="social_icon_linkedin" href="https://www.linkedin.com/in/prathmesh-kumbhar-03287228a/" target="_blank" rel="noopener noreferrer"><span ><i className="fa fa-linkedin" aria-hidden="true"></i></span></a>
                        <a className="social_icon_github" href="https://github.com/prathmesh2478" target="_blank" rel="noopener noreferrer"><span><i className="fa fa-github" aria-hidden="true"></i></span></a>
                    </div>
                    

                </div>
            </div>
            
        </div>
        
    )
}

export default Banner