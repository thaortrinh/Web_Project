import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
import googleIcon from "/src/assets/google-icon.png";
import bgImage from "../assets/login-signup-gradient-background.jpg";
import userLoginImg from "../assets/user-login.svg";
import logo from "../assets/logo.png";
import InputField from "../component/input/InputField.jsx";

const Login = ({ onNavigate, standalone = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitHandler = async (data) => {
    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...", {
      position: "top-right",
      pauseOnHover: false,
      closeOnClick: false,
      autoClose: false,
    });

    try {
      const response = await axios.post("https://task-up.up.railway.app/login", {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: response.data.user.userId,
            name: response.data.user.name,
            email: response.data.user.email,
            photoPath: response.data.user.photoPath,
            initials: response.data.user.initials,
          })
        );

        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          setIsLoading(false);
          navigate("/homepage");
        }, 2000);
      } else {
        toast.error(response.data.message || "Login failed", {
          position: "top-right",
        });
        setIsLoading(false);
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || "Invalid login credentials",
          {
            position: "top-right",
          }
        );
      } else if (error.request) {
        toast.error("Unable to connect to server. Please try again later.", {
          position: "top-right",
        });
      } else {
        toast.error("Error during login: " + error.message, {
          position: "top-right",
        });
      }
      setIsLoading(false);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // If used within AuthWrapper (standalone = false)
  if (!standalone) {
    return (
      <div className="relative w-full max-w-md flex flex-col gap-y-5">
        {/* Toast Container positioned relative to this form */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            zIndex: 9999,
          }}
          toastStyle={{
            maxWidth: "280px",
            fontSize: "14px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
          progressStyle={{
            background: "linear-gradient(to right, #435090, #3885c4)",
          }}
        />

        {/* Title */}
        <div className="flex flex-col gap-y-3">
          <h2 className="text-3xl font-bold text-gray-900">Log In to</h2>
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-[#435090] to-[#3885c4] text-transparent bg-clip-text inline-block">
              TaskUP
            </span>
            <span className="text-black">!</span>
          </h2>
        </div>

        {/* Form */}
        <form
          noValidate
          onSubmit={handleSubmit(submitHandler)}
          className="w-full md:w-[400px] flex flex-col gap-y-3"
        >
          <div>
            <InputField
              label="Email"
              type="email"
              className="w-full border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              style={{
                backgroundColor: "#f7fbff",
                padding: "5px 9px",
              }}
              placeholder="username@email.com"
              register={register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address.",
                },
              })}
              error={errors.email}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              register={register("password", {
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters.",
                },
              })}
              error={errors.password}
              rightIcon={
                showPassword ? (
                  <Eye size={20} className="text-gray-500" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )
              }
              onRightIconClick={() => setShowPassword(!showPassword)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a
                href="this-is-forgot-password-page!!!"
                className="text-blue-500 hover:text-blue-900 cursor-pointer"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Log In button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#435090] text-white rounded-lg hover:bg-[#353869] focus:outline-none text-sm cursor-pointer"
            style={{
              padding: "10px 5px",
            }}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {/* OR divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute border-t border-gray-300 w-full"></div>
            <span className="relative bg-white px-8 text-sm text-gray-500">
              OR
            </span>
          </div>

          {/* Google Login button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none text-sm cursor-pointer"
            style={{
              padding: "10px 5px",
            }}
          >
            <img src={googleIcon} alt="Google icon" className="w-5 h-5" />
            Login with Google
          </button>

          {/* Sign Up link */}
          <p className="text-center text-gray-600 text-sm">
            Do not have an account?{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("/signup")}
                className="text-blue-500 hover:text-blue-900 cursor-pointer"
              >
                Sign up
              </button>
            ) : (
              <Link to="/signup" className="text-blue-500 hover:text-blue-900">
                Sign up
              </Link>
            )}
          </p>
        </form>
      </div>
    );
  }
};

export default Login;
