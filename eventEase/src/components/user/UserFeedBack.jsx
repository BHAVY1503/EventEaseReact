import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, Star, Send, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import '../../styles/components/UserFeedback.css';

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
    <div className="feedback-section">
      <div className="feedback-container">
        {/* Header Section */}
        <div className="feedback-header">
          <div className="max-w-3xl">
            <div className="header-accent">
              <div className="accent-line" />
              <span className="accent-text">Audience Voice</span>
            </div>
            <h2 className="feedback-title">
              THE WORLD<br />IS TALKING
            </h2>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-[200px] text-right">
             Join the global conversation of elite event organizers and show-goers.
          </p>
        </div>

        {/* Feedback Cards Grid */}
        <div className="feedback-grid">
          {feedbacks.slice(0, 6).map((fb, i) => {
            const formatFeedbackMessage = (msg) => {
              if (!msg) return '';
              let cleaned = msg.replace(/^["'\s\u201C\u201D\u201E\u201F\u2033\u2036\u203F]+/g, '')
                               .replace(/["'\s\u201C\u201D\u201E\u201F\u2033\u2036\u203F]+$/g, '')
                               .trim();
              if (cleaned.length > 0) {
                cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
              }
              cleaned = cleaned.replace(/\bi\b/g, 'I');
              cleaned = cleaned.replace(/\bai\b/gi, 'AI');
              return cleaned;
            };

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="feedback-card group"
              >
                <div className="card-accent-border" />
                <Quote className="h-10 w-10 text-[#E11D48]/20 group-hover:text-[#E11D48] transition-colors mb-10" />
                
                <p className="feedback-message">
                  “{formatFeedbackMessage(fb.message)}”
                </p>

                <div className="flex items-center gap-6 pt-10 border-t border-white/10">
                  <Avatar className="h-12 w-12 border border-white/10 group-hover:border-[#E11D48] transition-colors">
                    <AvatarImage src={fb.profileImage} />
                    <AvatarFallback className="bg-white/5 font-black text-xs">{fb.userName ? fb.userName.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{fb.userName || 'Anonymous'}</h5>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Verified Member</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Cinematic Form */}
        <div className="feedback-form-wrapper">
           <div>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-8">SHARE YOUR<br />STORY</h3>
              <p className="text-gray-500 font-medium leading-relaxed max-w-md">
                 Your experiences help us build the future of live entertainment. Submit your feedback to be featured on our global hub.
              </p>
           </div>
           <div className="form-container">
              <form onSubmit={handleSubmit} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="input-group">
                       <p className="input-label">Display Name</p>
                       <input
                          type="text"
                          placeholder="ENTER NAME"
                          value={form.userName}
                          onChange={(e) => setForm({ ...form, userName: e.target.value })}
                          required
                          className="cinematic-input"
                       />
                       <div className="input-underline" />
                    </div>
                    <div className="input-group">
                       <p className="input-label">Identity URL</p>
                       <input
                          type="text"
                          placeholder="AVATAR LINK"
                          value={form.profileImage}
                          onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                          className="cinematic-input"
                       />
                       <div className="input-underline" />
                    </div>
                 </div>

                 <div className="input-group">
                    <p className="input-label">Message</p>
                    <textarea
                       placeholder="DESCRIBE YOUR EXPERIENCE"
                       value={form.message}
                       onChange={(e) => setForm({ ...form, message: e.target.value })}
                       required
                       rows={4}
                       className="cinematic-input resize-none"
                    />
                    <div className="input-underline" />
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
