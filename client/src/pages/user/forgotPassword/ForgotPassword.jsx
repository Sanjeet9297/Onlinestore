import React, { useState } from "react";
import { forgotPassword } from "../../../api/users";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleForgotPassword = async (email) => {
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setErrorMessage("required");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("invalid email");
      setLoading(false);
      return;
    }

    setErrorMessage("");

    const result = await forgotPassword(email);
    if (result) {
      localStorage.setItem("userEmail", email);
      navigate("/forgotPassword-verify");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-white flex justify-center">
      <div className="w-96 mt-20">
        <h1 className="mb-6 text-4xl text-black font-bold">StepUp</h1>
        <h1 className="mb-6 text-2xl text-black font-light">
          Enter your email to receive a password reset code.
        </h1>
        <div className="relative my-4 mb-6">
          <input
            type="email"
            id="floatingInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email*"
            className={`peer w-full px-5 py-3 text-base font-medium text-gray-800 bg-transparent border ${
              errorMessage ? "border-red-500" : "border-black"
            } rounded-lg placeholder-transparent focus:outline-none focus:ring-0 ${
              errorMessage ? "focus:border-red-500" : "focus:border-black"
            }`}
            required
          />
          <label
            htmlFor="floatingInput"
            className="absolute left-3 top-[10px] px-1 text-lg font-medium text-gray-500 transform transition-all scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-focus:-translate-y-[20px] peer-focus:scale-90 peer-focus:text-gray-800 bg-white"
          >
            Email*
          </label>
          {errorMessage && (
            <p className="text-sm text-red-500 mt-1 ml-3">{errorMessage}</p>
          )}
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            className="btn rounded-full bg-black text-white text-lg tracking-wide px-6"
            onClick={() => handleForgotPassword(email)}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-md text-black"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
