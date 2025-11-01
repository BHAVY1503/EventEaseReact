import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  Trash2, 
  Mail, 
  Phone, 
  Search, 
  Filter,
  Download,
  UserCircle,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data.data);
      setFilteredUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`/deleteuser/${userToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user", err);
      alert("Failed to delete user");
    }
  };

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      'Admin': 'bg-red-100 text-red-800 border-red-200',
      'User': 'bg-blue-100 text-blue-800 border-blue-200',
      'Organizer': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    // <div className="w-full space-y-6">
      <div className="w-full space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors">

      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h2>
            <p className="text-gray-600 text-sm">
              Manage and monitor all registered users
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white "> */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 ">

          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 ">

          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white"> */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 ">

          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Filtered</p>
                <p className="text-3xl font-bold text-purple-600">{filteredUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      {/* <Card className="border-gray-200 shadow-lg"> */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 ">

        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">All Users</CardTitle>
              <CardDescription>Complete list of registered users with management options</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Alert className="max-w-md mx-auto border-blue-200 bg-blue-50">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {/* <TableRow className="bg-gray-50"> */}
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-gray-100">
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">#</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">User</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-800 dark:text-gray-200">Role</TableHead>
                    <TableHead className="font-semibold text-right text-gray-800 dark:text-gray-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user._id} className="hover:bg-gray-200 transition-colors dark:text-gray-100 border-gray-100">
                      <TableCell className="font-medium text-gray-600 dark:text-gray-100 border-gray-100">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10 ring-2 ring-blue-100">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                              {user.fullName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.fullName}</p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-100">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-100">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phoneNumber || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.roleId?.name || user.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {user.roleId?.name || user.role || 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <span>Delete User</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.fullName}</strong>? 
              This action cannot be undone and will permanently remove the user from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="text-center mt-6">
        <Button variant="outline" asChild>
          <a href="/admin">Back to Dashboard</a>
           </Button>
       </div>

    </div>
  );
};


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export const AllUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");

  
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get("/user", {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         setUsers(res.data.data);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//  useEffect(() => {
//     if (token) fetchUsers();
//   }, [token]);

 

//     const handleDelete = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this User?")) return;
//     try {
//       await axios.delete(`/deleteuser/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       fetchUsers();
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//    if (loading) {
//     return <h4 className='text-center mt-4'>Loading users...</h4>;
//   }

//   if (!users.length) {
//     return <h5 className='text-center mt-4'>No users found.</h5>;
//   }

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">All Users (Admin Only)</h2>
//       <table className="table table-bordered table-striped">
//         <thead className="thead-dark">
//           <tr>
//             <th>#</th>
//             <th>Full Name</th>
//             <th>Email</th>
//             <th>Role</th>
//             <th>PhoneNo</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user, index) => (
//             <tr key={user._id}>
//               <td>{index + 1}</td>
//               <td>{user.fullName}</td>
//               <td>{user.email}</td>
//               <td>{user.roleId?.name || user.role}</td>
//               <td>{user.phoneNumber}</td>
//               <td> <button className='btn btn-danger btn-sm' onClick={() => handleDelete(user._id)}>
//                             Delete
//                           </button></td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="text-center mt-3">
//         <a href="/admin" className="btn btn-outline-dark">Back to Admin Home</a>
//       </div>
//     </div>
//   );
// };
