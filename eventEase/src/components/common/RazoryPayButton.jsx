import api from "@/lib/api";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, Loader2 } from "lucide-react";

const RazorpayButton = ({
  eventId,
  organizerId,
  amount,
  quantity = 1,
  selectedSeats = null,
  onPaymentSuccess,
  onLoginRequired,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to make a payment.",
      });

      if (onLoginRequired) {
        onLoginRequired({ eventId, organizerId, amount });
        return;
      }

      window.location.href = "/signin";
      return;
    }

    setLoading(true);

    const sdkLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!sdkLoaded) {
      toast({ variant: "destructive", title: "Razorpay SDK Failed", description: "Please check your internet connection." });
      setLoading(false);
      return;
    }

    // Basic validation
    if (!eventId) {
      toast({ variant: "destructive", title: "Invalid event", description: "Event id missing." });
      setLoading(false);
      return;
    }

    const q = Number(quantity) || 1;
    if (q < 1 || q > 10) {
      toast({ variant: "destructive", title: "Invalid quantity", description: "Quantity must be between 1 and 10." });
      setLoading(false);
      return;
    }

    try {
      // Basic client-side sanity: amount must be positive
      if (!amount || Number(amount) <= 0) {
        toast({ variant: "destructive", title: "Invalid Amount", description: "Calculated amount is invalid." });
        setLoading(false);
        return;
      }

      // Create order on backend; backend will compute amount securely.
      // When available (seat selection), include `selectedSeats` so server can compute zone-based pricing.
      const payload = { eventId, quantity: q };
      if (selectedSeats && Array.isArray(selectedSeats) && selectedSeats.length > 0) {
        payload.selectedSeats = selectedSeats;
      }

      const res = await api.post("/payment/create_order", payload);
      const data = res.data;

      if (!data || !data.order) {
        toast({ variant: "destructive", title: "Order Error", description: data?.message || "Failed to create order." });
        setLoading(false);
        return;
      }

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "EventEase",
        description: "Event Ticket Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payment/verify_order", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              toast({ title: "🎉 Payment Successful!", description: "Your event ticket has been booked successfully." });
              onPaymentSuccess && onPaymentSuccess(response);
            } else {
              toast({ variant: "destructive", title: "Verification Failed", description: verifyRes.data?.message || "Payment verified failed." });
            }
          } catch (err) {
            console.error("Payment verification error:", err.response?.data || err.message || err);
            toast({ variant: "destructive", title: "Verification Error", description: err.response?.data?.message || "Something went wrong verifying your payment." });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem("name") || "",
          email: localStorage.getItem("email") || "",
          contact: localStorage.getItem("phone") || "",
        },
        theme: { color: "#0D6EFD" },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment failed", err.response?.data || err.message || err);
      const serverMsg = err.response?.data?.message || err.response?.data || err.message;
      toast({ variant: "destructive", title: "Payment Failed", description: String(serverMsg) });
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Button onClick={startPayment} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white w-full mt-4">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
        </>
      ) : !isLoggedIn ? (
        <>
          <LogIn className="mr-2 h-4 w-4" /> Sign in to Pay ₹{amount}
        </>
      ) : (
        `Pay ₹${amount}`
      )}
    </Button>
  );
};

export default RazorpayButton;


// import axios from "axios";
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";

// const RazorpayButton = ({ eventId, organizerId, amount, onPaymentSuccess }) => {
//   const { toast } = useToast();

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
//       toast({
//         variant: "destructive",
//         title: "Razorpay SDK Failed",
//         description: "Please check your internet connection.",
//       });
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast({
//           variant: "destructive",
//           title: "Unauthorized",
//           description: "Please log in to make a payment.",
//         });
//         return;
//       }

//       // ✅ Step 1: Create order on backend
//       const { data } = await axios.post(
//         "http://localhost:3100/payment/create_order",
//         {
//           amount,
//           eventId,
//           organizerId,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const order = data.order; // ✅ correct order object

//       // ✅ Step 2: Configure Razorpay checkout
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: order.currency,
//         name: "EventEase",
//         description: "Event Ticket Payment",
//         order_id: order.id,
//         handler: async function (response) {
//           try {
//             const verifyRes = await axios.post(
//               "http://localhost:3100/payment/verify_order",
//               {
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//               },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );

//             if (verifyRes.data.success) {
//               toast({
//                 title: "🎉 Payment Successful!",
//                 description: "Your event ticket has been booked successfully.",
//               });
//               onPaymentSuccess && onPaymentSuccess();
//             } else {
//               toast({
//                 variant: "destructive",
//                 title: "❌ Payment Verification Failed",
//                 description: "Please contact support if your amount was deducted.",
//               });
//             }
//           } catch (verifyError) {
//             console.error("Payment verification error:", verifyError);
//             toast({
//               variant: "destructive",
//               title: "Verification Error",
//               description: "Something went wrong verifying your payment.",
//             });
//           }
//         },
//         prefill: {
//           name: import.meta.env.VITE_NAME_FOR_RP,
//           email: import.meta.env.VITE_EMAIL_FOR_RP,
//           contact: import.meta.env.VITE_PHONE_NO_RP,
//         },
//         theme: { color: "#0D6EFD" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.error("Payment failed", error);
//       if (error.response?.status === 401) {
//         toast({
//           variant: "destructive",
//           title: "Unauthorized",
//           description: "Please log in again to continue payment.",
//         });
//       } else {
//         toast({
//           variant: "destructive",
//           title: "❌ Payment Failed",
//           description: "Something went wrong while processing the payment.",
//         });
//       }
//     }
//   };

//   return (
//     <Button
//       onClick={startPayment}
//       className="bg-green-600 hover:bg-green-700 text-white w-full mt-4"
//     >
//       Pay ₹{amount}
//     </Button>
//   );
// };

// export default RazorpayButton;





