import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultProfile from '../../assets/profile.jpg'; 
import profile from '../../assets/img/testimonials-2.jpg'


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
    <section className="testimonials text-center bg-light py-5">
      <div className="container">
        <h2 className="mb-5">What People Are Saying</h2>

        {/* Feedback Cards */}
        <div className="row">
          {feedbacks.map((fb, i) => (
            <div className="col-lg-4 mb-4" key={i}>
              <div className="testimonial-item mx-auto">
                <img
                  className="img-fluid rounded-circle mb-3"
                  src={fb.profileImage || defaultProfile}
                  alt={fb.userName}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <h5>{fb.userName}</h5>
                <p className="font-weight-light mb-0">"{fb.message}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Form */}
        <div className="container shadow p-4 mt-5 alert alert-primary">
          <h4 className="mb-3">Leave Your Feedback</h4>
          <form onSubmit={handleSubmit} className="row justify-content-center">
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Your Name"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Profile Image URL (optional)"
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
              />
            </div>
            <div className="col-md-12 mb-3">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Your Feedback"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="col-md-12">
              <button type="submit" className="btn btn-outline-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
