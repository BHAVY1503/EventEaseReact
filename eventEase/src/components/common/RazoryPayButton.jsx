import axios from "axios";
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const RazorpayButton = ({ eventId, organizerId, amount, onPaymentSuccess }) => {
  const { toast } = useToast();

  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startPayment = async () => {
    const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      toast({
        variant: "destructive",
        title: "Razorpay SDK Failed",
        description: "Please check your internet connection.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "Please log in to make a payment.",
        });
        return;
      }

      // ✅ Step 1: Create order on backend
      const { data } = await axios.post(
        "http://localhost:3100/payment/create_order",
        {
          amount,
          eventId,
          organizerId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const order = data.order; // ✅ correct order object

      // ✅ Step 2: Configure Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "EventEase",
        description: "Event Ticket Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:3100/payment/verify_order",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (verifyRes.data.success) {
              toast({
                title: "🎉 Payment Successful!",
                description: "Your event ticket has been booked successfully.",
              });
              onPaymentSuccess && onPaymentSuccess();
            } else {
              toast({
                variant: "destructive",
                title: "❌ Payment Verification Failed",
                description: "Please contact support if your amount was deducted.",
              });
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            toast({
              variant: "destructive",
              title: "Verification Error",
              description: "Something went wrong verifying your payment.",
            });
          }
        },
        prefill: {
          name: import.meta.env.VITE_NAME_FOR_RP,
          email: import.meta.env.VITE_EMAIL_FOR_RP,
          contact: import.meta.env.VITE_PHONE_NO_RP,
        },
        theme: { color: "#0D6EFD" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed", error);
      if (error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "Please log in again to continue payment.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ Payment Failed",
          description: "Something went wrong while processing the payment.",
        });
      }
    }
  };

  return (
    <Button
      onClick={startPayment}
      className="bg-green-600 hover:bg-green-700 text-white w-full mt-4"
    >
      Pay ₹{amount}
    </Button>
  );
};

export default RazorpayButton;





// import axios from "axios";
// import React from "react";
// import { Button } from "@/components/ui/button";

// const RazorpayButton = ({ eventId, amount, onPaymentSuccess }) => {
//   const loadRazorpayScript = (src) => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = src;
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const startPayment = async () => {
//     const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
//     if (!res) {
//       alert("Razorpay SDK failed to load.");
//       return;
//     }

//     try {
//       // Step 1: Create order on backend
//       const { data: order } = await axios.post("http://localhost:3100/payment/create_order", {
//         // amount: amount * 100, // Convert ₹ to paise // in rupees
//         amount,
//         currency: "INR",
//         receipt: `receipt_order_${eventId}`,
//       });

//       // Step 2: Open Razorpay popup
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
//         amount: order.amount,
//         currency: order.currency,
//         name: "EventEase",
//         description: "Event Ticket Payment",
//         order_id: order.id,
//         handler: async function (response) {
//           // Step 3: Verify the payment with backend
//           const verifyRes = await axios.post("http://localhost:3100/payment/verify_order", {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//           });

//           if (verifyRes.data.status === "success") {
//             alert("🎉 Payment Successful!");
//             onPaymentSuccess && onPaymentSuccess(); // Optional callback
//           } else {
//             alert("❌ Payment verification failed");
//           }
//         },
//         prefill: {
//           name: import.meta.env.VITE_NAME_FOR_RP,
//           email: import.meta.env.VITE_EMAIL_FOR_RP,
//           contact: import.meta.env.VITE_PHONE_NO_RP,
//         },
//         theme: {
//           color: "#0D6EFD",
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.error("Payment failed", error);
//       alert("Something went wrong during payment.");
//     }
//   };

//   return (
//     <Button onClick={startPayment} className="bg-green-600 hover:bg-green-700 text-white">
//       Pay ₹{amount}
//     </Button>
//   );
// };

// export default RazorpayButton;
