import React, { useState, useEffect } from "react";
import NaviBar from "../component/landing/NaviBar";
import Home from "../component/landing/Home";
import AboutProject from "../component/landing/AboutProject";
import Features from "../component/landing/Features";
import Team from "../component/landing/Team";
import Contact from "../component/landing/Contact";

const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <div className="fixed top-0 right-0 left-0 z-20">
        <NaviBar />
      </div>

      <div className="flex-1 flex flex-col !px-4 !mt-16 bg-gray-50">
        {/* Home Section */}
        <Home />

        <section id="about-project">
          <AboutProject />
        </section>

        {/* Features Section */}
        <section id="features">
          <Features />
        </section>

        {/* Team section */}
        <section id="about-us">
          <Team />
        </section>

        <section id="contact">
          <Contact />
        </section>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-15 right-8 z-30 bg-[#C271AB] hover:bg-[#5784C7] cursor-pointer text-white !p-3 rounded-full shadow-lg 
                     animate-bounce hover:animate-none
                     transition-all duration-300 hover:scale-110 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Scroll to top - Bounce Effect"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage;
