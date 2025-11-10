import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, Star, Send, Sparkles, TrendingUp, Users, MessageCircle } from "lucide-react";

export const UserFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    userName: '',
    message: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Default profile image fallback
  const defaultProfile = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%236366f1'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3EU%3C/text%3E%3C/svg%3E";

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
    <section className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 dark:bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-full border border-blue-200 dark:border-blue-800 mb-4">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Testimonials
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              What People Are Saying
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied users who love what we do. Hear their stories and experiences.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center items-center gap-8 pt-8">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg ">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Happy Users</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{feedbacks.length}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Reviews</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Star className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {feedbacks.map((fb, i) => (
            <Card 
              key={i}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative bg-white dark:bg-gray-800 border border-gray-200  dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient Border Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
              
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Quote className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              </div>

              <CardContent className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`h-4 w-4 ${
                        hoveredCard === i 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'fill-yellow-300 text-yellow-300'
                      } transition-all duration-300`}
                    />
                  ))}
                </div>

                {/* Feedback Message */}
                <p className="text-gray-700 dark:text-gray-900 mb-6 leading-relaxed italic relative z-10">
                  "{fb.message}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all duration-300">
                    <AvatarImage 
                      src={fb.profileImage || defaultProfile} 
                      alt={fb.userName}
                      onError={(e) => { e.target.src = defaultProfile; }}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-black font-semibold">
                      {fb.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-black">
                      {fb.userName}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Verified User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Form */}
        <div className="max-w-3xl mx-auto">
          <Card className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl" />

            <CardContent className="p-8 md:p-10 relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Share Your Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We'd love to hear what you think about our platform
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={form.userName}
                      onChange={(e) => setForm({ ...form, userName: e.target.value })}
                      required
                      className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Image URL
                      <span className="text-gray-400 text-xs ml-1">(optional)</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={form.profileImage}
                      onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                      className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Feedback *
                  </label>
                  <Textarea
                    placeholder="Tell us about your experience with our platform..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Feedback
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to see more? Check out all our reviews
          </p>
          <Button 
            variant="outline" 
            className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
          >
            View All Reviews
            <TrendingUp className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import defaultProfile from '../../assets/profile.jpg';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "../../hooks/use-toast";
// // import { Icons } from "@/components/icons";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


// export const UserFeedback = () => {
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [form, setForm] = useState({
//     userName: '',
//     message: '',
//     profileImage: ''
//   });
//   const [loading, setLoading] = useState(false);

//   // Fetch feedbacks from API
//   const getFeedbacks = async () => {
//     try {
//       const res = await axios.get('/feedbacks');
//       setFeedbacks(res.data.data);
//     } catch (err) {
//       console.error("Failed to load feedbacks:", err.message);
//     }
//   };

//   useEffect(() => {
//     getFeedbacks();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post('/feedbacks', form);
//       setForm({ userName: '', message: '', profileImage: '' });
//       getFeedbacks();
//     } catch (err) {
//       alert("Error submitting feedback");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
//     {/* <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100"> */}

//       {/* <div className="container mx-auto px-4"> */}
//         <div className="text-center mb-12">
//           <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">What People Are Saying</h2>
//           <p className="text-gray-500 mt-2 dark:text-gray-100">Hear from our amazing community</p>
//         </div>

//         {/* Feedback Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 ">
//           {feedbacks.map((fb, i) => (
//             <Card key={i} className="dark shadow-lg bg-background text-foreground overflow-hidden hover:shadow-x2 transition-all duration-300 hover:-translate-y-3">
//               <CardContent className="p-6">
//                 <div className="flex items-center gap-4 mb-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src={fb.profileImage || defaultProfile} alt={fb.userName} />
//                     <AvatarFallback>{fb.userName.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <h5 className="font-semibold">{fb.userName}</h5>
//                   </div>
//                 </div>
//                 <p className="text-gray-200 italic">"{fb.message}"</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Feedback Form */}
//         <Card className="dark bg-background text-foreground max-w-2xl mx-auto  hover:shadow-x2 transition-all duration-300 hover:-translate-y-3">
//           <CardHeader>
//             <CardTitle>Share Your Experience</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Input
//                     type="text"
//                     placeholder="Your Name"
//                     value={form.userName}
//                     onChange={(e) => setForm({ ...form, userName: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Input
//                     type="text"
//                     placeholder="Profile Image URL (optional)"
//                     value={form.profileImage}
//                     onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Textarea
//                   placeholder="Share your thoughts..."
//                   value={form.message}
//                   onChange={(e) => setForm({ ...form, message: e.target.value })}
//                   required
//                   rows={4}
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <Button type="submit" disabled={loading}>
//                   {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
//                   {loading ? 'Submitting...' : 'Submit Feedback'}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       {/* </div> */}
//      </section>
//   );
// };
