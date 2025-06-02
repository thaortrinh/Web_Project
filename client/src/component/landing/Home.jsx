import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import board from "../../assets/board.png";

const Home = () => {
  // Function to handle smooth scroll to About Project section
  const handleLearnMore = () => {
    const aboutSection = document.getElementById('about-project');
    if (aboutSection) {
      const offsetTop = aboutSection.offsetTop - 60; // Offset 100px from top
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="home"
      className="container !mx-auto !px-8 !py-12 !pt-14 flex flex-col md:flex-row items-center"
    >
      {/* Left Column - Text Content */}
      <div className="md:w-1/2 !mb-10 md:mb-0">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#9C5088] to-[#3A6AA8]  text-transparent bg-clip-text !mb-6 leading-tight">
          Your Powerful Task Management Tool
        </h1>
        <p className="text-gray-600 !mb-8 w-7/8 !text-justify">
          Streamline your workflow, collaborate effectively, and achieve more
          with TaskUP - the ultimate task management solution for teams of all
          sizes.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/login"
            className="bg-gradient-to-r from-[#C271AB] to-[#5784C7] text-white !px-8 !py-3 rounded-full flex items-center gap-2 hover:shadow-lg transition duration-300"
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <button 
            onClick={handleLearnMore}
            className="bg-white text-gray-700 !px-8 !py-3 rounded-full border border-gray-200 hover:shadow-md transition duration-300"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-16 !mt-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-800">10+</h2>
            <p className="text-gray-600 text-sm">Core Features</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-800">9.3</h2>
            <p className="text-gray-600 text-sm">Design Rating</p>
          </div>
        </div>
      </div>

      {/* Right Column - Device Mockups */}
      <div className="md:w-1/2 relative flex justify-center">
        <div className="relative w-full max-w-xl">
          {/* Desktop Monitor Frame - Modern iMac style */}
          <div className="relative !mx-auto" style={{ maxWidth: "500px" }}>
            <div
              className="bg-gray-100 rounded-xl overflow-hidden shadow-xl border-8 border-gray-800"
              style={{ borderBottomWidth: "20px" }}
            >
              {/* Browser-like header */}
              <div className="bg-gray-100 flex items-center !px-4 !py-1">
                <div className="flex !space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center !ml-2 bg-white rounded-md !px-4 !py-1 text-xs text-gray-600">
                  <span>taskup.com</span>
                </div>
              </div>

              {/* App UI Inside Monitor */}
              <div className="bg-white w-full">
                {/* App Dashboard Content */}
                <img
                  src={board}
                  alt="TaskUP Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Monitor Stand - Aluminum style */}
            <div
              className="!mx-auto bg-gradient-to-b from-gray-300 to-gray-400 w-16 h-16 !mt-1"
              style={{
                clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)",
                transform: "perspective(10px) rotateX(5deg)",
              }}
            ></div>
            <div className="!mx-auto bg-gradient-to-b from-gray-300 to-gray-400 w-48 h-3 rounded-full !mt-1"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;