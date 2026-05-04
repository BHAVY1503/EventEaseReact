import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/auth/authSlice";
import { LogIn, X, Ticket, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SignInModal = ({ open = true, onClose, onLoginSuccess }) => {
   const { register, handleSubmit, formState: { errors } } = useForm();
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(open);
   const dispatch = useDispatch();
   const { isLoading, error } = useSelector((state) => state.auth);

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
         <DialogContent className="max-w-4xl bg-black border border-white/5 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[1000] rounded-[2rem] max-h-[85vh]">
            <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[85vh]">
               {/* Visual Side (40%) */}
               <div className="hidden md:flex md:col-span-5 relative bg-[#050505] p-10 lg:p-12 flex-col justify-between border-r border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#E11D48]/5 blur-[100px] -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -ml-32 -mb-32" />

                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="w-10 h-10 bg-[#E11D48] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                           <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.5em] text-white">EventEase</span>
                     </div>

                     <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-8">
                        ACCESS THE<br />REVOLUTION
                     </h2>
                     <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-[240px]">
                        Enter your credentials to unlock exclusive event management and booking protocols.
                     </p>
                  </div>

                  <div className="relative z-10 flex items-center gap-6">
                     <div className="flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-[#E11D48]" /> Encrypted Access
                     </div>
                  </div>
               </div>

               {/* Form Side (60%) */}
               <div className="md:col-span-7 p-10 md:p-12 bg-black flex flex-col overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center mb-12">
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 text-glow">Access Portal</h3>
                        <div className="h-1 w-12 bg-[#E11D48]" />
                     </div>
                     <button onClick={() => { setIsOpen(false); onClose?.(); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#E11D48] transition-all">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                     <div className="relative group">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Transmission ID</p>
                        <input
                           {...register("email", { required: "Identity required" })}
                           type="email"
                           placeholder="EMAIL@DOMAIN.COM"
                           className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-[#E11D48] placeholder:text-gray-800 outline-none transition-colors"
                        />
                        {errors.email && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-[#E11D48] uppercase tracking-widest">{errors.email.message}</p>}
                     </div>

                     <div className="relative group">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Access Key</p>
                        <input
                           {...register("password", { required: "Key required" })}
                           type="password"
                           placeholder="••••••••"
                           className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] focus:ring-0 focus:border-[#E11D48] placeholder:text-gray-800 outline-none transition-colors"
                        />
                        {errors.password && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-[#E11D48] uppercase tracking-widest">{errors.password.message}</p>}
                     </div>

                     {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-[#E11D48] text-[8px] font-black uppercase tracking-widest text-center">
                           {typeof error === 'string' ? error : "AUTHENTICATION FAILED"}
                        </div>
                     )}

                     <div className="space-y-8 pt-8">
                        <Button
                           type="submit"
                           disabled={isLoading}
                           className="w-full h-16 bg-[#E11D48] hover:bg-red-700 text-white rounded-full text-xs font-black tracking-[0.4em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(225,29,72,0.2)] hover:shadow-[0_0_40px_rgba(225,29,72,0.4)] transform hover:scale-[1.01]"
                        >
                           {isLoading ? "AUTHENTICATING..." : "INITIATE LOGIN"}
                        </Button>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
                              <Link to="/signup" className="hover:text-[#E11D48] transition-colors">Create Identity</Link>
                              <Link to="/forgot-password" title="protocol-forgot" className="hover:text-[#E11D48] transition-colors">Key Recovery</Link>
                           </div>
                           <div className="pt-4 border-t border-white/5 flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">
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
