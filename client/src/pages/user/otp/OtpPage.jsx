import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../features/users/UserSlice";
import { initializeBag } from "../../../features/bag/BagSlice";

let userDetails;
//THIS IS FUNCTION
//send - otp
const sendOtp = async (userData) => {
  userDetails = userData;
  try {
    const otpResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/otp/send_otp`,
      userData
    );
    if (otpResponse.status === 200) {
      toast.success("OTP Shared");
    }
  } catch (error) {
    console.log("Error while giving otp", error);
  }
};

const OtpPage = () => {
  const isVerified = useSelector((state) => state.user.isVerified);
  const dispatch = useDispatch();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30); // OTP timer in seconds
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isVerified) {
      navigate("/");
    }
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsOtpExpired(true);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    // Move to next input
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  //handling otp submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOtpExpired) {
      toast.error("OTP has expired. Please request a new OTP.");
      return;
    }
    const otpValue = Number(otp.join(""));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/otp/verify_otp`,
        { otpValue, userDetails }
      );
      if (response.status === 200) {
        const { username, email, _id } = response.data.user;
        dispatch(setUser({ uid: _id, username, email, isVerified: true }));
        dispatch(initializeBag({ userId: _id }));
        toast.success("OTP Verified");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error("Invalid OTP");
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setTimer(30);
    //otp resend
    setIsOtpExpired(false);
    sendOtp(userDetails);

    setTimeout(() => {
      setIsResending(false);
    }, 2000); // Simulateing a delay for the resend action
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#dbdbdb] text-white">
      <div className="bg-black p-10 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Enter OTP</h1>
        <form onSubmit={handleSubmit} className="flex justify-between">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              autoComplete="off"
              onChange={(e) => handleChange(e, index)}
              className="w-12 h-12 text-center bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-white transition duration-150"
            />
          ))}
        </form>
        <div className="flex justify-between mt-4">
          <button
            className={`text-sm ${
              timer > 0 ? "text-gray-500" : "text-white"
            } hover:underline`}
            onClick={handleResend}
            disabled={timer > 0 || isResending}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
          <span className="text-sm">
            {timer > 0
              ? `00:${timer < 10 ? `0${timer}` : timer}`
              : "OTP expired"}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-white text-black py-2 rounded font-bold hover:bg-gray-300 transition duration-150"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export { sendOtp };
export default OtpPage;
