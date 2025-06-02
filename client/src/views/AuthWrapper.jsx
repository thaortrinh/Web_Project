import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import bgImage from "../assets/login-signup-gradient-background.jpg";
import userLoginImg from "../assets/user-login.svg";
import userSignup from "../assets/user_signup.svg";
import logo from "../assets/logo.png";

const AuthWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(location.pathname === "/signup");
  const [isAnimating, setIsAnimating] = useState(false);

  // Custom navigation handler
  const handleFormNavigation = (path) => {
    console.log("Form navigation requested to:", path);
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  useEffect(() => {
    const newIsSignup = location.pathname === "/signup";
    if (newIsSignup !== isSignup) {
      setIsAnimating(true);

      // Update state immediately
      setIsSignup(newIsSignup);

      // Clear animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 800);
    }
  }, [location.pathname, isSignup]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-100">
      {/* Container with sliding animation */}
      <div
        className={`flex w-[200%] h-screen transition-transform duration-800 ease-in-out ${
          isSignup ? "transform -translate-x-1/2" : "transform translate-x-0"
        }`}
      >
        {/* Login Section (First Half) */}
        <div className="w-1/2 h-full flex">
          {/* Login Background with Image */}
          <div className="w-1/2 relative">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300"
              style={{
                backgroundImage: `url(${bgImage})`,
                transform: "scale(1.02)",
              }}
            />

            <div className="absolute top-5 left-3 z-10">
              <Link to="/landing">
                <img
                  src={logo}
                  alt="TaskUP Logo"
                  className="w-10 h-auto cursor-pointer"
                />
              </Link>
            </div>

            {/* Image */}
            <div className="relative h-screen flex items-center justify-center p-8">
              <img
                src={userLoginImg}
                alt="Login illustration"
                className="w-4/5 md:w-3/5 lg:w-2/3 xl:w-3/5 h-auto max-w-2xl object-contain"
              />
            </div>
          </div>

          {/* Login Form */}
          <div className="w-1/2 flex items-center justify-center p-8 bg-white relative">
            <div className="w-full max-w-md">
              <Login onNavigate={handleFormNavigation} standalone={false} />
            </div>
          </div>
        </div>

        {/* Signup Section (Second Half) */}
        <div className="w-1/2 h-full flex">
          {/* Signup Background with Image */}
          <div className="w-1/2 relative">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300"
              style={{
                backgroundImage: `url(${bgImage})`,
                transform: "scale(1.02)",
              }}
            />

            {/* Logo Container */}
            <div className="absolute top-5 left-3 z-10">
              <Link to="/landing">
                <img
                  src={logo}
                  alt="TaskUP Logo"
                  className="w-10 h-auto cursor-pointer"
                />
              </Link>
            </div>

            {/* Image */}
            <div className="relative h-screen flex items-center justify-center p-8">
              <img
                src={userSignup}
                alt="Signup illustration"
                className="w-4/5 md:w-3/5 lg:w-2/3 xl:w-3/5 h-auto max-w-2xl object-contain"
              />
            </div>
          </div>

          {/* Signup Form */}
          <div className="w-1/2 flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md">
              <Signup onNavigate={handleFormNavigation} standalone={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
