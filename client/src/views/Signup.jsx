import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import InputField from "../component/input/InputField.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

import bgImage from "../assets/login-signup-gradient-background.jpg";
import logo from "../assets/logo.png";
import userSignup from "../assets/user_signup.svg";
import googleIcon from "/src/assets/google-icon.png";

const SignUp = ({ onNavigate, standalone = true }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset, // Thêm reset function
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password");

  const submitHandler = async (data) => {
    setIsLoading(true);
    const loadingToast = toast.loading("Signing up...", {
      position: "top-right",
      pauseOnHover: false,
      closeOnClick: false,
      autoClose: false,
    });

    try {
      const response = await axios.post("https://task-up.up.railway.app/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        toast.success("Sign up successful!", {
          position: "top-right",
          autoClose: 2000,
        });

        // Reset form sau khi đăng ký thành công
        reset();
        
        // Reset password visibility states
        setShowPassword(false);
        setShowConfirmPassword(false);

        setTimeout(() => {
          if (onNavigate) {
            onNavigate("/login");
          } else {
            navigate("/login");
          }
        }, 2000);
      } else {
        toast.error(response.data.message || "Sign up failed", {
          position: "top-right",
        });
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Error when signing up!", {
          position: "top-right",
        });
      } else if (error.request) {
        toast.error("Unable to connect to server. Please try again later.", {
          position: "top-right",
        });
      } else {
        toast.error("Error during signup: " + error.message, {
          position: "top-right",
        });
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  // If used within AuthWrapper (standalone = false), render only the form
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
            top: "10px",
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
          <h2 className="text-3xl font-bold text-gray-900">Sign Up for</h2>
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-[#435090] to-[#3885c4] text-transparent bg-clip-text inline-block">
              TaskUP
            </span>
            <span className="text-black">!</span>
          </h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="w-full md:w-[400px] flex flex-col gap-y-2"
        >
          {/* Username input */}
          <div>
            <InputField
              label="Username"
              type="text"
              placeholder="examplename"
              register={register("username", {
                required: "Username is required.",
              })}
              error={errors.username}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email input */}
          <div>
            <InputField
              label="Email"
              type="email"
              placeholder="example@email.com"
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

          {/* Password input */}
          <div>
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
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

          {/* Confirm Password input */}
          <div>
            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••"
              register={register("confirmPassword", {
                required: "Please confirm your password.",
                validate: (value) =>
                  value === password || "Your password does not match.",
              })}
              error={errors.confirmPassword}
              rightIcon={
                showConfirmPassword ? (
                  <Eye size={20} className="text-gray-500" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )
              }
              onRightIconClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Spacer div */}
          <div className="h-1"></div>

          {/* Sign Up button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#435090] text-white rounded-lg hover:bg-[#353869] focus:outline-none text-sm cursor-pointer"
            style={{
              padding: "10px 5px",
            }}
          >
            {isLoading ? "Signing up..." : "Sign up"}
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
            Sign up with Google
          </button>

          {/* Log in link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("/login")}
                className="text-blue-500 hover:text-blue-900 cursor-pointer"
              >
                Log in
              </button>
            ) : (
              <Link to="/login" className="text-blue-500 hover:text-blue-900">
                Log in
              </Link>
            )}
          </p>
        </form>
      </div>
    );
  }
};

export default SignUp;