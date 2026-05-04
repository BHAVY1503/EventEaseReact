import api from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, Send, Globe, ShieldCheck, Sparkles, Activity, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

export const ContactUs = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkUserType = async () => {
      if (!token) {
        setUserType('guest');
        return;
      }
      
      const role = localStorage.getItem("role");
      if (role === 'Organizer') {
        setUserType('organizer');
        return;
      } else if (role === 'Admin') {
        setUserType('admin');
        return;
      } else if (role === 'User') {
        setUserType('user');
        return;
      }

      // Fallback if role is not in localStorage
      try {
        const organizerRes = await api.get(`/organizer/organizer/self`);
        if (organizerRes.data) setUserType('organizer');
      } catch (err) {
        try {
          const userRes = await api.get("/user/getuserbytoken");
          if (userRes.data) setUserType('user');
        } catch (userErr) {
          setUserType('guest');
        }
      }
    };
    checkUserType();
  }, [token]);

  const submitHandler = async (data) => {
    try {
      await api.post("/contactus", data);
      setSubmitStatus('success');
      reset();
      setTimeout(() => {
        setSubmitStatus(null);
        if (userType === 'organizer') navigate('/organizer');
        else if (userType === 'user') navigate('/user');
      }, 3000);
    } catch (err) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="w-full bg-transparent overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-white/5">
        {/* Info Sidebar (40%) */}
        <div className="lg:col-span-2 p-10 md:p-16 bg-black/40 backdrop-blur-3xl space-y-12 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E11D48]/10 border border-[#E11D48]/20 rounded-full">
               <Activity className="h-3 w-3 text-[#E11D48] animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Support Protocol Active</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-white">
               DIRECT<br />
               <span className="text-[#E11D48]">COMMAND</span>
            </h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-xs">
               Priority operational support for elite producers. Secure channel open 24/7 for infrastructure queries.
            </p>
          </div>

          <div className="space-y-10">
            <div className="flex items-start gap-6 group">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#E11D48]/40 group-hover:bg-[#E11D48]/10 transition-all duration-500">
                  <Mail className="h-4 w-4 text-[#E11D48]" />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Electronic Mail</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#E11D48] transition-colors">VIP-DESK@EVENTEEASE.COM</p>
               </div>
            </div>
            
            <div className="flex items-start gap-6 group">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#E11D48]/40 group-hover:bg-[#E11D48]/10 transition-all duration-500">
                  <Phone className="h-4 w-4 text-[#E11D48]" />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Priority Voice</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#E11D48] transition-colors">+1 (800) EVENT-ELITE</p>
               </div>
            </div>

            <div className="flex items-start gap-6 group">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#E11D48]/40 group-hover:bg-[#E11D48]/10 transition-all duration-500">
                  <Globe className="h-4 w-4 text-[#E11D48]" />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Global Presence</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#E11D48] transition-colors">NYC / LONDON / TOKYO</p>
               </div>
            </div>
          </div>

          <div className="pt-10 flex items-center gap-6 border-t border-white/5">
             <div className="flex items-center gap-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3 text-[#E11D48]" /> 256-BIT ENCRYPTION
             </div>
             <div className="flex items-center gap-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                <Clock className="h-3 w-3 text-[#E11D48]" /> RESPOND {"< 24H"}
             </div>
          </div>
        </div>

        {/* Form Area (60%) */}
        <div className="lg:col-span-3 p-10 md:p-16 bg-black/20 backdrop-blur-sm">
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-3 group">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Subject Identity</p>
                  <div className="relative">
                    <input
                      {...register("name", { required: true })}
                      placeholder="ENTER FULL NAME"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-1 focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50 placeholder:text-gray-800 outline-none transition-all"
                    />
                  </div>
               </div>
               <div className="space-y-3 group">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Electronic Port</p>
                  <div className="relative">
                    <input
                      {...register("email", { required: true })}
                      type="email"
                      placeholder="EMAIL@DOMAIN.COM"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-1 focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50 placeholder:text-gray-800 outline-none transition-all"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-3 group">
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Operational Briefing</p>
               <div className="relative">
                  <textarea
                    {...register("message", { required: true })}
                    placeholder="DESCRIBE YOUR INFRASTRUCTURE QUERY..."
                    rows={6}
                    className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-1 focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50 placeholder:text-gray-800 outline-none resize-none transition-all"
                  />
               </div>
            </div>

            <div className="pt-6 relative">
               <AnimatePresence>
                 {submitStatus === 'success' && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     exit={{ opacity: 0 }}
                     className="absolute -top-16 inset-x-0 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl"
                   >
                     <Sparkles className="inline-block w-3 h-3 mr-3 align-middle" />
                     TRANSMISSION SUCCESSFUL. AGENTS DEPLOYED.
                   </motion.div>
                 )}
                 {submitStatus === 'error' && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     exit={{ opacity: 0 }}
                     className="absolute -top-16 inset-x-0 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl"
                   >
                     TRANSMISSION FAILED. RETRY PROTOCOL.
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <Button
                 type="submit"
                 disabled={isSubmitting}
                 className={cn(
                   "w-full h-20 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl relative group overflow-hidden",
                   isSubmitting && "opacity-80"
                 )}
               >
                 <span className="relative z-10 flex items-center justify-center gap-4">
                    {isSubmitting ? (
                      <>TRANSMITTING...</>
                    ) : (
                      <>
                        INITIATE CONTACT
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                 </span>
                 <div className="absolute inset-0 bg-[#E11D48] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
               </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
