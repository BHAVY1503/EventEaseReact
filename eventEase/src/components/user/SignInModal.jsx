import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLogin } from "@/features/auth/authSlice";
import { LogIn, X, Ticket, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/common/Common.css";

export const SignInModal = ({ open = true, onClose, onLoginSuccess }) => {
   const { register, handleSubmit, formState: { errors } } = useForm();
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(open);
   const [showPassword, setShowPassword] = useState(false);
   const dispatch = useDispatch();
   const { isLoading, error } = useSelector((state) => state.auth);

   const [googleReady, setGoogleReady] = useState(false);
   const googleBtnRef = useRef(null);
   // Use a ref so the GSI callback always sees the latest dispatch/handlers
   const responseHandlerRef = useRef(null);

   const handleGoogleResponse = useCallback(async (response) => {
      try {
         const result = await dispatch(googleLogin({ token: response.credential, type: 'user' })).unwrap();
         if (onLoginSuccess) onLoginSuccess(result.token, result.data);
         setIsOpen(false);
         onClose?.();
      } catch (err) {
         console.error("Google login failed:", err);
      }
   }, [dispatch, onLoginSuccess, onClose]);

   // Keep the ref in sync with the latest callback
   useEffect(() => {
      responseHandlerRef.current = handleGoogleResponse;
   }, [handleGoogleResponse]);

   useEffect(() => {
      const initGoogle = () => {
         if (window.google?.accounts?.id && googleBtnRef.current) {
            try {
               window.google.accounts.id.initialize({
                  client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com",
                  // Always call through the ref to avoid stale closures
                  callback: (res) => responseHandlerRef.current?.(res),
                  auto_select: false,
               });
               window.google.accounts.id.renderButton(googleBtnRef.current, {
                  type: "standard",
                  theme: "outline",
                  size: "large",
                  text: "signin_with",
                  shape: "rectangular",
                  width: googleBtnRef.current.offsetWidth || 300,
               });
               setGoogleReady(true);
            } catch (err) {
               console.error("Google Sign-In init error:", err);
            }
         } else {
            setTimeout(initGoogle, 600);
         }
      };
      initGoogle();
      return () => { try { window.google?.accounts?.id?.cancel(); } catch (_) {} };
   }, []);

   const handleGoogleButtonClick = () => {
      // Click the hidden Google-rendered button — most reliable approach
      const btn = googleBtnRef.current?.querySelector("div[role=button]");
      btn?.click();
   };



   const onSubmit = async (formData) => {
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
         const { token, data } = result.payload;
         if (onLoginSuccess) {
            onLoginSuccess(token, data);
         }
         setIsOpen(false);
         onClose?.();
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) onClose?.(); }}>
         <DialogContent className="max-w-4xl bg-card border border-black/5 dark:border-white/5 p-0 overflow-hidden shadow-[0_0_100px_rgba(15,23,42,0.1)] dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[1000] rounded-[2rem] max-h-[85vh]">
            <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[85vh]">
               {/* Visual Side (40%) */}
               <div className="hidden md:flex md:col-span-5 relative bg-slate-50 dark:bg-[#050505] p-10 lg:p-12 flex-col justify-between border-r border-black/5 dark:border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#E11D48]/5 blur-[100px] -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -ml-32 -mb-32" />

                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="w-10 h-10 bg-[#E11D48] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                           <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.5em] text-slate-900 dark:text-white">EventEase</span>
                     </div>

                     <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-8">
                        ACCESS THE<br />REVOLUTION
                     </h2>
                     <p className="text-slate-500 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-[240px]">
                        Enter your credentials to unlock exclusive event management and booking protocols.
                     </p>
                  </div>

                  <div className="relative z-10 flex items-center gap-6">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-gray-700 uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-[#E11D48]" /> Encrypted Access
                     </div>
                  </div>
               </div>

               {/* Form Side (60%) */}
               <div className="md:col-span-7 p-10 md:p-12 bg-card flex flex-col overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center mb-12">
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2 text-glow">Access Portal</h3>
                        <div className="h-1 w-12 bg-[#E11D48]" />
                     </div>
                     <button onClick={() => { setIsOpen(false); onClose?.(); }} className="w-10 h-10 rounded-full bg-slate-900/5 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white hover:bg-[#E11D48] hover:text-white transition-all">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                     <div className="relative group">
                        <p className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">Transmission ID</p>
                        <input
                           {...register("email", { required: "Identity required" })}
                           type="email"
                           placeholder="EMAIL@DOMAIN.COM"
                           className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-[#E11D48] placeholder:text-gray-500 text-slate-900 dark:text-white outline-none transition-colors"
                        />
                        {errors.email && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-[#E11D48] uppercase tracking-widest">{errors.email.message}</p>}
                     </div>

                     <div className="relative group">
                        <p className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">Access Key</p>
                        <div className="relative">
                           <input
                              {...register("password", { required: "Key required" })}
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 text-xs font-black tracking-[0.2em] focus:ring-0 focus:border-[#E11D48] placeholder:text-gray-500 text-slate-900 dark:text-white outline-none transition-colors pr-10"
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-0 bottom-2 text-slate-500 dark:text-gray-500 hover:text-[#E11D48] transition-colors"
                           >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                           </button>
                        </div>
                        {errors.password && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-[#E11D48] uppercase tracking-widest">{errors.password.message}</p>}
                     </div>

                     {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-[#E11D48] text-[8px] font-black uppercase tracking-widest text-center">
                           {typeof error === 'string' ? error : "AUTHENTICATION FAILED"}
                        </div>
                     )}

                     <div className="space-y-8 pt-4">
                        <Button
                           type="submit"
                           disabled={isLoading}
                           className="w-full h-16 bg-[#E11D48] hover:bg-red-700 text-white rounded-full text-xs font-black tracking-[0.4em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(225,29,72,0.2)] hover:shadow-[0_0_40px_rgba(225,29,72,0.4)] transform hover:scale-[1.01]"
                        >
                           {isLoading ? "AUTHENTICATING..." : "INITIATE LOGIN"}
                        </Button>

                        <div className="relative">
                           <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-black/5 dark:border-white/5"></span>
                           </div>
                           <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em]">
                              <span className="bg-card px-4 text-slate-500 dark:text-slate-400">Protocol Auth</span>
                           </div>
                        </div>

                        {/* Custom Google button layered over hidden GSI-rendered button */}
                        <div className="relative w-full">
                           {/* Hidden Google-rendered button (provides real OAuth flow) */}
                           <div
                              ref={googleBtnRef}
                              className="absolute inset-0 opacity-0 overflow-hidden pointer-events-none"
                              aria-hidden="true"
                           />
                           {/* Visible premium button that clicks the hidden one */}
                           <button
                              type="button"
                              onClick={handleGoogleButtonClick}
                              disabled={!googleReady || isLoading}
                              className="w-full h-14 flex items-center justify-center gap-3 border border-black/10 dark:border-white/10 rounded-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                           >
                              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </svg>
                              <span className="text-xs font-black tracking-[0.3em] uppercase">
                                 {!googleReady ? "LOADING..." : "CONTINUE WITH GOOGLE"}
                              </span>
                           </button>
                        </div>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              <Link to="/signup" className="hover:text-[#E11D48] transition-colors">Create Identity</Link>
                              <Link to="/forgot-password" title="protocol-forgot" className="hover:text-[#E11D48] transition-colors">Key Recovery</Link>
                           </div>
                           <div className="pt-4 border-t border-black/5 dark:border-white/5 flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              <Link to="/adminsignin" className="hover:text-[#E11D48] transition-colors">Admin Access Portal</Link>
                           </div>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default SignInModal;
