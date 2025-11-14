import axios from "axios";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, Loader2 } from "lucide-react";

const RazorpayButton = ({ 
  eventId, 
  organizerId, 
  amount, 
  onPaymentSuccess,
  onLoginRequired  // NEW: Callback when login is needed
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
    // ⭐ CRITICAL: Check if user is logged in FIRST
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("No token found, user needs to login");
      
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to make a payment.",
      });
      
      // If onLoginRequired callback is provided, call it
      if (onLoginRequired) {
        onLoginRequired({
          eventId,
          organizerId,
          amount
        });
        return;
      }
      
      // Otherwise, redirect to login page
      window.location.href = "/signin";
      return;
    }

    setLoading(true);

    // Load Razorpay SDK
    const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      toast({
        variant: "destructive",
        title: "Razorpay SDK Failed",
        description: "Please check your internet connection.",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Creating order with token:", !!token);

      // ✅ Step 1: Create order on backend WITH TOKEN
      const { data } = await axios.post(
        "/payment/create_order",  // Use relative URL (proxy will handle it)
        {
          amount,
          eventId,
          organizerId,
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,  // ⭐ Send token
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Order created:", data);

      const order = data.order;

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
            console.log("Payment successful, verifying...");

            // ✅ Step 3: Verify payment WITH TOKEN
            const verifyRes = await axios.post(
              "/payment/verify_order",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { 
                  Authorization: `Bearer ${token}`,  // ⭐ Send token
                  'Content-Type': 'application/json'
                },
              }
            );

            console.log("Verification response:", verifyRes.data);

            if (verifyRes.data.success) {
              toast({
                title: "🎉 Payment Successful!",
                description: "Your event ticket has been booked successfully.",
              });
              onPaymentSuccess && onPaymentSuccess(response);
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
          name: localStorage.getItem("name") || import.meta.env.VITE_NAME_FOR_RP,
          email: localStorage.getItem("email") || import.meta.env.VITE_EMAIL_FOR_RP,
          contact: localStorage.getItem("phone") || import.meta.env.VITE_PHONE_NO_RP,
        },
        theme: { color: "#0D6EFD" },
        modal: {
          ondismiss: function() {
            console.log("Payment cancelled by user");
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);

    } catch (error) {
      console.error("Payment failed", error);
      setLoading(false);

      if (error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please log in again to continue payment.",
        });
        
        // Clear invalid token
        localStorage.removeItem("token");
        
        // Trigger login required callback or redirect
        if (onLoginRequired) {
          onLoginRequired({ eventId, organizerId, amount });
        } else {
          window.location.href = "/signin";
        }
      } else {
        toast({
          variant: "destructive",
          title: "❌ Payment Failed",
          description: error.response?.data?.message || "Something went wrong while processing the payment.",
        });
      }
    }
  };

  // Check if user is logged in to show appropriate button text
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Button
      onClick={startPayment}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white w-full mt-4"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : !isLoggedIn ? (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in to Pay ₹{amount}
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





