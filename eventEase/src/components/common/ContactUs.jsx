



import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Moon, Sun } from "lucide-react";
import * as jwt_decode from "jwt-decode"; // use this instead


export const ContactUs = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Determine user type on component mount
  useEffect(() => {
    const checkUserType = async () => {
      if (!token) {
        setUserType('guest');
        return;
      }

      try {
        const organizerRes = await axios.get(`/organizer/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (organizerRes.data) {
          setUserType('organizer');
        }
      } catch (err) {
        try {
          const userRes = await axios.get("/user/getuserbytoken", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.data) {
            setUserType('user');
          }
        } catch (userErr) {
          setUserType('guest');
        }
      }
    };

    checkUserType();
  }, [token]);

// useEffect(() => {
//   if (!token) {
//     setUserType('guest');
//     return;
//   }
//   try {
//     const decoded = jwt_decode(token);
//     console.log("Decoded token:", decoded); // check what fields exist
//     setUserType(decoded.role.toLowerCase()); // 'user' or 'organizer'
//   } catch (err) {
//     setUserType('guest');
//   }
// }, [token]);

  const submitHandler = async (data) => {
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const res = await axios.post("/contactus", data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSubmitStatus('success');
      
      toast({
        title: "Message Sent Successfully! ✓",
        description: "Thank you for contacting us. We'll get back to you within 24-48 hours.",
        variant: "success",
      });

      reset();

      setTimeout(() => {
        if (userType === 'Organizer') {
          navigate('/organizer/dashboard');
        } else if (userType === 'User') {
          navigate('/user/dashboard');
        } else {
          // navigate('/');
        }
      }, 2000);

    } catch (err) {
      console.error("Contact form error:", err);
      setSubmitStatus('error');
      
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     "Failed to send message. Please try again.";
      
      setErrorMessage(message);

      toast({
        title: "Failed to Send Message",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-12 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="icon"
            className={`rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <Alert className={`mb-6 ${
            darkMode 
              ? 'border-green-600 bg-green-950/50 text-green-300' 
              : 'border-green-500 bg-green-50'
          }`}>
            <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <AlertTitle className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
              Success!
            </AlertTitle>
            <AlertDescription className={darkMode ? 'text-green-200' : 'text-green-700'}>
              Your message has been sent successfully! We'll respond to you shortly.
              <br />
              <span className="text-sm">Redirecting you back...</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <Alert className={`mb-6 ${
            darkMode 
              ? 'border-red-600 bg-red-950/50 text-red-300' 
              : 'border-red-500 bg-red-50'
          }`}>
            <XCircle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            <AlertTitle className={`font-semibold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
              Error Sending Message
            </AlertTitle>
            <AlertDescription className={darkMode ? 'text-red-200' : 'text-red-700'}>
              {errorMessage}
              <br />
              <span className="text-sm">Please check your information and try again.</span>
            </AlertDescription>
          </Alert>
        )}

        <Card className={`shadow-lg transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader className={`rounded-t-lg transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          } text-white`}>
            <CardTitle className="text-3xl font-bold text-center">
              Get in Touch
            </CardTitle>
            <p className={`text-center mt-2 ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>
              Have questions? We're here to help!
            </p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    {...register("name", { required: "Name is required" })}
                    className={`transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Company Field */}
                <div className="space-y-2">
                  <Label htmlFor="company" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Company / Organization <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your organization"
                    {...register("company", { required: "Company is required" })}
                    className={`transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${errors.company ? 'border-red-500' : ''}`}
                  />
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className={`transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNo"
                    type="tel"
                    placeholder="1234567890"
                    {...register("phoneNo", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                    className={`transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${errors.phoneNo ? 'border-red-500' : ''}`}
                  />
                  {errors.phoneNo && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNo.message}</p>
                  )}
                </div>

                {/* Event Type Field */}
                <div className="space-y-2">
                  <Label htmlFor="eventType" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Event Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventType"
                    type="text"
                    placeholder="e.g., Wedding, Conference, Concert"
                    {...register("eventType", { required: "Event type is required" })}
                    className={`transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${errors.eventType ? 'border-red-500' : ''}`}
                  />
                  {errors.eventType && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventType.message}</p>
                  )}
                </div>

                {/* How did you hear Field */}
                <div className="space-y-2">
                  <Label htmlFor="question" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    How did you hear about us?
                  </Label>
                  <Input
                    id="question"
                    type="text"
                    placeholder="Social media, friend, search engine..."
                    {...register("question")}
                    className={`transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your event or inquiry..."
                  {...register("message", { required: "Message is required" })}
                  className={`min-h-[150px] transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (userType === 'organizer') {
                      navigate('/organizer/dashboard');
                    } else if (userType === 'user') {
                      navigate('/user/dashboard');
                    } else {
                      navigate('/');
                    }
                  }}
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : ''}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Sent!
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <Card className={`transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CardContent className="pt-6">
              <div className={`text-4xl mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📧</div>
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Email</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>support@yourevent.com</p>
            </CardContent>
          </Card>
          <Card className={`transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CardContent className="pt-6">
              <div className={`text-4xl mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📞</div>
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Phone</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>+91 1234567890</p>
            </CardContent>
          </Card>
          <Card className={`transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CardContent className="pt-6">
              <div className={`text-4xl mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>⏰</div>
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Response Time</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>24-48 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};








