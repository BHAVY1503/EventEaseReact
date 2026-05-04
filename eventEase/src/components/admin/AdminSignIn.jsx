import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { adminLogin, googleLogin } from "../../features/auth/authSlice";
import { ShieldCheck, Lock, X } from "lucide-react";

export const AdminSignIn = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [isOpen, setIsOpen] = useState(true)

  const validationSchema = {
    emailValidator: {
      required: {
        value: true,
        message: "Email is required*"
      }
    },
    passwordValidator: {
      required: {
        value: true,
        message: "Password is required"
      },
      minLength: { 
        value: 6, 
        message: "Minimum 6 characters required" 
      }
    }
  }

  useEffect(() => {
    const loadGoogleSignIn = () => {
      const googleDiv = document.getElementById("googleSignInDiv");
      if (window.google && googleDiv) {
        try {
          window.google.accounts.id.initialize({
            client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
          });

          window.google.accounts.id.renderButton(
            googleDiv,
            {
              type: "standard",
              theme: "filled_black",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              width: googleDiv.offsetWidth,
            }
          );
        } catch (err) {
          console.error("Error initializing Google Sign-In:", err);
        }
      } else if (googleDiv) {
        setTimeout(loadGoogleSignIn, 500);
      }
    };

    loadGoogleSignIn();

    return () => {
      if (window.google) {
        try {
          window.google.accounts.id.cancel();
        } catch (err) {
          console.error("Error cleaning up Google Sign-In:", err);
        }
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await dispatch(googleLogin({ token: response.credential, type: 'user' })).unwrap();
      const { data } = res;
      if (data.roleId?.name === "Admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
      onClose?.();
    } catch (err) {
      console.error("Google login failed:", err);
      alert(err || "Google login failed. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(adminLogin(data)).unwrap();
      const { data: user } = res;
      if (user.roleId?.name === "Admin") navigate("/admin");
      else navigate("/");
      onClose?.();
    } catch (err) {
      console.error("Login Error:", err);
      alert(err || "Login failed. Please try again.");
    }
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      onClose?.();
      navigate('/', { replace: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl bg-black border border-white/5 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[1000] rounded-[2rem] max-h-[85vh]">
        <DialogTitle className="sr-only">Admin System Authority Login</DialogTitle>
        <DialogDescription className="sr-only">Access the central command core to manage global protocols and override system state.</DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[85vh]">
           {/* Visual Side (40%) */}
           <div className="hidden md:flex md:col-span-5 relative bg-[#050505] p-10 lg:p-12 flex-col justify-between border-r border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-600/10 blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/5 blur-[100px] -ml-32 -mb-32" />

              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                       <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.5em] text-white">EventEase <span className="text-gray-500">Root</span></span>
                 </div>
                 
                 <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-8">
                    SYSTEM<br />AUTHORITY
                 </h2>
                 <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-[240px]">
                    Access the central command core. Manage global protocols and override system state.
                 </p>
              </div>

              <div className="relative z-10 flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Lock className="h-4 w-4 text-gray-500" /> Root Authentication Required
                 </div>
              </div>
           </div>

           {/* Form Side (60%) */}
           <div className="md:col-span-7 p-10 md:p-12 bg-black flex flex-col overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-16">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 text-glow">Admin Command</h3>
                    <div className="h-1 w-12 bg-white/10" />
                 </div>
                 <button onClick={() => handleOpenChange(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                 <div className="relative group">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Root ID</p>
                    <input
                       {...register("email", validationSchema.emailValidator)}
                       type="email"
                       placeholder="ADMIN@EVENTEEASE.COM"
                       className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-white placeholder:text-gray-800 outline-none transition-colors"
                    />
                    {errors.email && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.email.message}</p>}
                 </div>

                 <div className="relative group">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Override Key</p>
                    <input
                       {...register("password", validationSchema.passwordValidator)}
                       type="password"
                       placeholder="••••••••"
                       className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] focus:ring-0 focus:border-white placeholder:text-gray-800 outline-none transition-colors"
                    />
                    {errors.password && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.password.message}</p>}
                 </div>

                 {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest text-center">
                       {typeof error === 'string' ? error : "ACCESS DENIED"}
                    </div>
                 )}

                 <div className="space-y-8 pt-4">
                    <Button
                       type="submit"
                       disabled={isLoading}
                       className="w-full h-16 bg-white text-black hover:bg-gray-200 rounded-full text-xs font-black tracking-[0.4em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] transform hover:scale-[1.01]"
                    >
                       {isLoading ? "AUTHORIZING..." : "EXECUTE LOGIN"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5"></span>
                      </div>
                      <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em]">
                        <span className="bg-black px-4 text-gray-700">Auxiliary Access</span>
                      </div>
                    </div>

                    <div className="flex justify-center items-center min-h-[48px]">
                      <div
                        id="googleSignInDiv"
                        className="w-full max-w-[300px] mx-auto filter grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100"
                        style={{ minHeight: "48px" }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
                       <Link to="/signin" className="hover:text-white transition-colors">User Portal</Link>
                       <Link to="/" className="hover:text-white transition-colors">System Exit</Link>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSignIn;