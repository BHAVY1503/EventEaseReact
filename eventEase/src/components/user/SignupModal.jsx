import { useState } from 'react'
import api from '@/lib/api'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
   Dialog,
   DialogContent,
} from "@/components/ui/dialog"
import { useDispatch, useSelector } from 'react-redux'
import { signupUser } from '@/features/auth/authSlice'
import { UserPlus, X, Ticket, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import "@/styles/components/SignupModal.css";

export const SignUpModal = ({ onClose }) => {
   const { register, handleSubmit, formState: { errors } } = useForm()
   const navigate = useNavigate()
   const [isOpen, setIsOpen] = useState(true)
   const dispatch = useDispatch()
   const { isLoading, error } = useSelector((state) => state.auth);

   const onSubmit = async (data) => {
      const result = await dispatch(signupUser(data));
      if (signupUser.fulfilled.match(result)) {
         navigate("/signin");
         setIsOpen(false);
         onClose?.();
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) onClose?.(); }}>
         <DialogContent className="signup-modal-dialog-content">
            <div className="signup-modal-grid">
               {/* Visual Side */}
               <div className="signup-modal-visual">
                  <div className="visual-glow-top" />
                  <div className="visual-glow-bottom" />

                  <div className="visual-main-content">
                     <div className="visual-brand-header">
                        <div className="brand-icon-box">
                           <Ticket className="w-5 h-5" />
                        </div>
                        <span className="brand-label">EventEase</span>
                     </div>

                     <h2 className="visual-title">
                        CREATE YOUR<br />IDENTITY
                     </h2>
                     <p className="visual-description">
                        Join the global network of elite event participants. Secure your profile today.
                     </p>
                  </div>

                  <div className="visual-footer-info">
                     <div className="secure-protocol-tag">
                        <ShieldCheck className="h-4 w-4" /> Secure Protocol
                     </div>
                  </div>
               </div>

               {/* Form Side */}
               <div className="signup-modal-form-area">
                  <div className="form-header-row">
                     <h3 className="form-title">User Registration</h3>
                     <div className="form-title-underline" />
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="signup-form-element">
                     <div className="input-group-signup">
                        <p className="input-label-signup">Subject Name</p>
                        <input
                           {...register("fullName", { required: "Name required" })}
                           type="text"
                           placeholder="FULL NAME"
                           className="input-signup-premium"
                        />
                        {errors.fullName && <p className="error-text-signup">{errors.fullName.message}</p>}
                     </div>

                     <div className="input-group-signup">
                        <p className="input-label-signup">Transmission ID</p>
                        <input
                           {...register("email", { required: "Email required" })}
                           type="email"
                           placeholder="EMAIL@DOMAIN.COM"
                           className="input-signup-premium"
                        />
                        {errors.email && <p className="error-text-signup">{errors.email.message}</p>}
                     </div>

                     <div className="input-group-signup">
                        <p className="input-label-signup">Access Key</p>
                        <input
                           {...register("password", { required: "Key required", minLength: { value: 6, message: "Min 6 chars" } })}
                           type="password"
                           placeholder="••••••••"
                           className="input-signup-premium"
                        />
                        {errors.password && <p className="error-text-signup">{errors.password.message}</p>}
                     </div>

                     <div className="input-group-signup">
                        <p className="input-label-signup">Voice Link</p>
                        <input
                           {...register("phoneNumber", { required: "Phone required" })}
                           type="tel"
                           placeholder="PHONE NUMBER"
                           className="input-signup-premium"
                        />
                        {errors.phoneNumber && <p className="error-text-signup">{errors.phoneNumber.message}</p>}
                     </div>

                     {error && (
                        <div className="global-error-signup">
                           {typeof error === 'string' ? error : "REGISTRATION FAILED"}
                        </div>
                     )}

                     <div className="form-actions-signup">
                        <Button
                           type="submit"
                           disabled={isLoading}
                           className="submit-btn-signup"
                        >
                           {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "INITIATE REGISTRATION"}
                        </Button>

                        <p className="switch-auth-text">
                           Existing Identity? <Link to="/signin" className="switch-auth-link">Access Portal</Link>
                        </p>
                     </div>
                  </form>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}

export default SignUpModal;
