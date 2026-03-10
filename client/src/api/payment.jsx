import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/payment`;

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const handlePayment = async (username, email, totalAmount, phonenumber) => {
  let isPaymentClosed = false; 
  let paymentFailed = false; 
  try {
    const { data } = await axios.post(`${API_URL}/createTransaction`, {
      amount: totalAmount,
      currency: "INR",
    });

    console.log(data);

    return new Promise((resolve, reject) => {
      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: "StepUp",
        description: "Payment for Product",
        handler: function (response) {
          toast.success(`Payment Successful`);
          console.log(response.razorpay_payment_id);
          console.log(response.razorpay_order_id);
          console.log(response.razorpay_signature);
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            paymentStatus: "completed",
          });
        },
        prefill: {
          name: username,
          email: email,
          contact: phonenumber,
        },
        theme: {
          color: "#000",
        },
        modal: {
          ondismiss: function () {
            console.log("Checkout form closed by the user");
            isPaymentClosed = true; 
            console.log("status", paymentFailed)
            if(paymentFailed){
              reject({
                success: false,
                error: "redirect",
              });
            } else {
              reject({
                success: false,
                error: "noRedirect",
              });
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on("payment.failed", function (response) {
        console.log("Error in HandlePayment");
        toast.error(response.error.description);
        paymentFailed = true;  // Mark payment as failed
      });
    }).finally(() => {
      // Ensure that if the modal was closed without a decision, we don't trigger a redirect
      if (isPaymentClosed) {
        console.log("Payment form closed without action, staying on checkout.");
      }
    });
  } catch (error) {
    console.error("Payment Error: ", error);
  }
};



export { handlePayment };
