import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Loader2, CheckCircle2, Ticket, ArrowRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VerifyOrganizer() {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); 
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("Establishing secure handshake with identity nodes...");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function verify() {
      try {
        console.log("=== ORGANIZER VERIFICATION START ===");
        const res = await axios.get(`/organizer/verify/${token}`);
        console.log("Verification Response:", res.data);
        
        setStatus("success");
        setMessage(res.data.message || "Identification verified successfully.");
        localStorage.setItem("isVerified", "true");

        // Set up redirection countdown
        let count = 5;
        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(interval);
            navigate("/organizersignin");
          }
        }, 1000);
      } catch (err) {
        console.error("Verification Error:", err);
        setStatus("error");
        setMessage(err.response?.data?.message || "Cryptographic verification token is invalid, corrupted, or has expired.");
      }
    }
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E11D48]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        <div className="cinematic-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Laser Line */}
          {status === "loading" && (
            <motion.div 
              className="absolute inset-x-0 h-[2px] bg-[#E11D48]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
          )}

          {/* Header Branding */}
          <div className="flex flex-col items-center text-center space-y-6 mb-10">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 bg-slate-900/5 border-slate-900/10">
              <Activity className="h-3 w-3 text-[#E11D48] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">Identity Protocol</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E11D48]/10 border border-[#E11D48]/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#E11D48]" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground uppercase">EventEase</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. LOADING STATE */}
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-t-2 border-white/5 border-t-[#E11D48]" 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                  <Loader2 className="w-10 h-10 text-[#E11D48] animate-spin" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-black tracking-widest text-foreground">DECRYPTING KEY</h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider max-w-sm leading-relaxed">
                    {message}
                  </p>
                </div>

                {/* Tech Specs Block */}
                <div className="w-full bg-black/10 dark:bg-black/20 rounded-2xl border border-white/5 p-4 text-left font-mono text-[9px] tracking-wider text-muted-foreground space-y-2">
                  <div className="flex justify-between"><span className="font-bold">SYSTEM PORT:</span><span>CORE SECURE GATEWAY</span></div>
                  <div className="flex justify-between"><span className="font-bold">METHOD:</span><span>CRYPTOGRAPHIC DECRYPT</span></div>
                  <div className="flex justify-between"><span className="font-bold">ALGORITHM:</span><span>ECDSA-P256 / SHA256</span></div>
                </div>
              </motion.div>
            )}

            {/* 2. SUCCESS STATE */}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-widest text-emerald-500">IDENTITY SANCTIONED</h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider max-w-sm leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="w-full bg-black/10 dark:bg-black/20 rounded-2xl border border-white/5 p-4 text-left font-mono text-[9px] tracking-wider text-muted-foreground space-y-2">
                  <div className="flex justify-between"><span className="font-bold">ORGANIZER ACCESS:</span><span className="text-emerald-500 font-bold">APPROVED</span></div>
                  <div className="flex justify-between"><span className="font-bold">SYSTEM REDIRECT:</span><span>{countdown} SECONDS</span></div>
                </div>

                <button
                  onClick={() => navigate("/organizersignin")}
                  className="w-full h-14 bg-white text-black dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#E11D48] hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  PROCEED TO SIGN IN
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* 3. ERROR STATE */}
            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div className="w-20 h-20 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/20 flex items-center justify-center shadow-lg shadow-[#E11D48]/5">
                  <ShieldAlert className="w-10 h-10 text-[#E11D48]" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-widest text-[#E11D48]">VERIFICATION FAILED</h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider max-w-sm leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="w-full bg-black/10 dark:bg-black/20 rounded-2xl border border-white/5 p-4 text-left font-mono text-[9px] tracking-wider text-muted-foreground space-y-2">
                  <div className="flex justify-between"><span className="font-bold">SECURITY GATE:</span><span className="text-[#E11D48] font-bold">REJECTED</span></div>
                  <div className="flex justify-between"><span className="font-bold">FAILURE CODE:</span><span>VERIFY_KEY_EXPIRED</span></div>
                </div>

                <button
                  onClick={() => navigate("/")}
                  className="w-full h-14 bg-transparent border border-white/10 hover:border-[#E11D48] text-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all flex items-center justify-center gap-3 group"
                >
                  RETURN TO HOME
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

