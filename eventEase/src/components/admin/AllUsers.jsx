import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/user", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
 useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

 

    const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this User?")) return;
    try {
      await axios.delete(`/deleteuser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  };

   if (loading) {
    return <h4 className='text-center mt-4'>Loading users...</h4>;
  }

  if (!users.length) {
    return <h5 className='text-center mt-4'>No users found.</h5>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">All Users (Admin Only)</h2>
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>PhoneNo</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.roleId?.name || user.role}</td>
              <td>{user.phoneNumber}</td>
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
