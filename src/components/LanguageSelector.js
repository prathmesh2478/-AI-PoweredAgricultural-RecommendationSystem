import React, { useEffect } from "react";

const LanguageSelector = () => {
    useEffect(() => {
        const addGoogleTranslateScript = () => {
            if (!document.getElementById("googleTranslateScript")) {
                const script = document.createElement("script");
                script.id = "googleTranslateScript";
                script.src = "https://translate.google.com/translate_a/element.js?cb=initGoogleTranslate";
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            } else {
                window.initGoogleTranslate(); // If script is already loaded, reinitialize
            }
        };

        window.initGoogleTranslate = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    { pageLanguage: "en", layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
                    "google_translate_element"
                );

                // Restore last selected language
                const lastLang = localStorage.getItem("selectedLanguage");
                if (lastLang) {
                    setTimeout(() => {
                        const translateCombo = document.querySelector(".goog-te-combo");
                        if (translateCombo) {
                            translateCombo.value = lastLang;
                            translateCombo.dispatchEvent(new Event("change"));
                        }
                    }, 1000);
                }
            }
        };

        addGoogleTranslateScript();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
            <div id="google_translate_element" ></div>

            {/* Save selected language when changed */}
            <script>
                {`
                    document.addEventListener("change", function() {
                        if (document.querySelector(".goog-te-combo")) {
                            localStorage.setItem("selectedLanguage", document.querySelector(".goog-te-combo").value);
                        }
                    });
                `}
            </script>
        </div>
    );
};

export default LanguageSelector;
