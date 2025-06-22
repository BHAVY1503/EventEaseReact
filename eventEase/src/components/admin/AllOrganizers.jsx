import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const AllOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  
    const fetchOrganizer = async () => {
      try {
        const res = await axios.get("/organizer/allorganizers", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrganizers(res.data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
 useEffect(() => {
    if (token) fetchOrganizer();
  }, [token]);

 

    const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this Organizer?")) return;
    try {
      await axios.delete(`/organizer/deleteorganizer/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchOrganizer();
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  };

   if (loading) {
    return <h4 className='text-center mt-4'>Loading users...</h4>;
  }

  if (!organizers.length) {
    return <h5 className='text-center mt-4'>No organizer found.</h5>;
  }

 

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">All Organizers (Admin Only)</h2>
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Organization</th>
            <th>PhoneNo</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {organizers.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.roleId?.name || user.role}</td>
              <td>{user.organizationName}</td>
              <td>{user.PhoneNo}</td>
              

              <td> <button className='btn btn-danger btn-sm' onClick={() => handleDelete(user._id)}>
                            Delete
                          </button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center mt-3">
        <a href="/admin" className="btn btn-outline-dark">Back to Admin Home</a>
      </div>
    </div>
  );
};

         
