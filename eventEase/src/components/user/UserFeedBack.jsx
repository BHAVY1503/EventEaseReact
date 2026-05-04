import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, Star, Send, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

export const UserFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    userName: '',
    message: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);

  const getFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data.data || []);
    } catch (err) {
      console.error("Failed to load feedbacks:", err.message);
    }
  };

  useEffect(() => {
    getFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/feedbacks', form);
      setForm({ userName: '', message: '', profileImage: '' });
      getFeedbacks();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] text-white py-40">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-8 h-[2px] bg-[#E11D48]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Audience Voice</span>
            </div>
            <h2 className="text-5xl md:text-[100px] font-black leading-[0.85] tracking-tighter uppercase">
              THE WORLD<br />IS TALKING
            </h2>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-[200px] text-right">
             Join the global conversation of elite event organizers and show-goers.
          </p>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 mb-40">
          {feedbacks.slice(0, 6).map((fb, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-12 bg-black hover:bg-white/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-0 bg-[#E11D48] group-hover:h-full transition-all duration-500" />
              <Quote className="h-10 w-10 text-[#E11D48]/20 group-hover:text-[#E11D48] transition-colors mb-10" />
              
              <p className="text-xl font-medium text-gray-300 mb-12 leading-relaxed group-hover:text-white transition-colors">
                "{fb.message}"
              </p>

              <div className="flex items-center gap-6 pt-10 border-t border-white/10">
                <Avatar className="h-12 w-12 border border-white/10 group-hover:border-[#E11D48] transition-colors">
                  <AvatarImage src={fb.profileImage} />
                  <AvatarFallback className="bg-white/5 font-black text-xs">{fb.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{fb.userName}</h5>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Verified Member</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cinematic Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
           <div>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-8">SHARE YOUR<br />STORY</h3>
              <p className="text-gray-500 font-medium leading-relaxed max-w-md">
                 Your experiences help us build the future of live entertainment. Submit your feedback to be featured on our global hub.
              </p>
           </div>
           <div className="bg-white/5 p-12 border border-white/5">
              <form onSubmit={handleSubmit} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="relative group">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Display Name</p>
                       <input
                          type="text"
                          placeholder="ENTER NAME"
                          value={form.userName}
                          onChange={(e) => setForm({ ...form, userName: e.target.value })}
                          required
                          className="w-full bg-transparent border-none p-0 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-0 placeholder:text-gray-800 outline-none"
                       />
                       <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-white/10 group-focus-within:bg-[#E11D48] transition-colors" />
                    </div>
                    <div className="relative group">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Identity URL</p>
                       <input
                          type="text"
                          placeholder="AVATAR LINK"
                          value={form.profileImage}
                          onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                          className="w-full bg-transparent border-none p-0 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-0 placeholder:text-gray-800 outline-none"
                       />
                       <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-white/10 group-focus-within:bg-[#E11D48] transition-colors" />
                    </div>
                 </div>

                 <div className="relative group">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Message</p>
                    <textarea
                       placeholder="DESCRIBE YOUR EXPERIENCE"
                       value={form.message}
                       onChange={(e) => setForm({ ...form, message: e.target.value })}
                       required
                       rows={4}
                       className="w-full bg-transparent border-none p-0 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-0 placeholder:text-gray-800 outline-none resize-none"
                    />
                    <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-white/10 group-focus-within:bg-[#E11D48] transition-colors" />
                 </div>

                 <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-16 text-[10px] tracking-[0.3em]"
                 >
                    {loading ? "TRANSMITTING..." : "SUBMIT TO GLOBAL HUB"}
                 </Button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};
