import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultProfile from '../../assets/profile.jpg';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
// import { Icons } from "@/components/icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


export const UserFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    userName: '',
    message: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch feedbacks from API
  const getFeedbacks = async () => {
    try {
      const res = await axios.get('/feedbacks');
      setFeedbacks(res.data.data);
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
      await axios.post('/feedbacks', form);
      setForm({ userName: '', message: '', profileImage: '' });
      getFeedbacks();
    } catch (err) {
      alert("Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">What People Are Saying</h2>
          <p className="text-gray-500 mt-2">Hear from our amazing community</p>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {feedbacks.map((fb, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={fb.profileImage || defaultProfile} alt={fb.userName} />
                    <AvatarFallback>{fb.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="font-semibold">{fb.userName}</h5>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{fb.message}"</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={form.userName}
                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Profile Image URL (optional)"
                    value={form.profileImage}
                    onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
