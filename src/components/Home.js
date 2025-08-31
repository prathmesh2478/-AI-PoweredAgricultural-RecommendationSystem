import React from 'react'
import Banner from "./Banner"
import LanguageSelector from "../components/LanguageSelector";



function Home() {
    return (
        <div className="homecontainer">
            <Banner />
            <LanguageSelector />
        </div>
    )
}

export default Home
