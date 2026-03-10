import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordVerify } from "../../../api/users";
import { toast } from "react-toastify";

const ForgotPasswordVerify = () => {
  const [email, setEmail] = useState(localStorage.getItem("userEmail"));
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ code: "", password: "" });

  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    let newErrors = { code: "", password: "" };
  
    // Validate code
    if (!/^\d{6}$/.test(code)) {
      newErrors.code = "Code must be a 6-digit number.";
      valid = false;
    }
  
    // Validate password
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "Password must contain at least one special character.";
      valid = false;
    }
  
    setErrors(newErrors);
    return valid;
  };
  

  const handleForgotPasswordVerify = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await forgotPasswordVerify(email, code, password);
    if (result) {
      navigate('/login');
      toast.success("Your password has been reset successfully.");
      localStorage.removeItem('userEmail');
    }
    setLoading(false);
  };


  return (
    <div className="h-screen w-full bg-white flex justify-center">
      <div className="w-[26rem] mt-20">
        <h1 className="mb-6 text-4xl text-black font-bold">StepUp</h1>
        <h1 className="mb-4 text-2xl text-black font-light">
          Verify your email and enter a new password.
        </h1>
        <h1 className="mb-6 text-md text-black font-light">
          We've sent a code to <br /> {email}
          <span className="text-gray-400 underline cursor-pointer">Edit</span>
        </h1>

        {/* code */}
        <div className="relative my-4 mb-6">
          <input
            type="text"
            id="code"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code*"
            className={`peer w-full px-5 py-3 text-base font-medium text-gray-800 bg-transparent border ${
              errors.code ? "border-red-500" : "border-black"
            } rounded-lg placeholder-transparent focus:outline-none focus:ring-0 ${
              errors.code ? "focus:border-red-500" : "focus:border-black"
            }`}
            required
          />
          <label
            htmlFor="code"
            className="absolute left-3 top-[10px] px-1 text-lg font-medium text-gray-500 transform transition-all scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-focus:-translate-y-[20px] peer-focus:scale-90 peer-focus:text-gray-800 bg-white"
          >
            Code*
          </label>
          {errors.code && (
            <p className="text-sm text-red-500 mt-1">{errors.code}</p>
          )}
        </div>

        {/* new-password */}
        <div className="relative my-4 mb-6">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password*"
            className={`peer w-full px-5 py-3 text-base font-medium text-gray-800 bg-transparent border ${
              errors.password ? "border-red-500" : "border-black"
            } rounded-lg placeholder-transparent focus:outline-none focus:ring-0 ${
              errors.password ? "focus:border-red-500" : "focus:border-black"
            }`}
            required
          />
          <label
            htmlFor="password"
            className="absolute left-3 top-[10px] px-1 text-lg font-medium text-gray-500 transform transition-all scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-focus:-translate-y-[20px] peer-focus:scale-90 peer-focus:text-gray-800 bg-white"
          >
            New Password*
          </label>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <div className="flex">
            <button
              className="btn rounded-full bg-white border border-gray-300 text-black hover:bg-transparent hover:border-black text-lg tracking-wide px-6"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </div>

          <div className="flex">
            <button
              className="btn rounded-full bg-black text-white text-lg tracking-wide px-6"
              onClick={handleForgotPasswordVerify}
            >
              {loading ? (
              <span className="loading loading-spinner loading-md text-black"></span>
            ) : (
              "Save"
            )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordVerify;
