// src/components/admin/AdminInbox.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  Trash2,
  MailOpen,
  Clock,
  AlertCircle
} from "lucide-react";

export const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/contactus", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.data || []);
        setFilteredMessages(res.data.data || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch inbox messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Filter messages based on search and role
  useEffect(() => {
    let filtered = messages;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== "All") {
      filtered = filtered.filter((msg) => msg.senderRole === filterRole);
    }

    setFilteredMessages(filtered);
  }, [searchTerm, filterRole, messages]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "organizer":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "user":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Admin Inbox
            </h2>
            <p className="text-red-100 text-lg">
              {filteredMessages.length} {filteredMessages.length === 1 ? "message" : "messages"} in your inbox
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <p className="text-sm font-semibold">Total Messages</p>
              <p className="text-4xl font-bold">{messages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-gray-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search messages by name, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              {["All", "Organizer", "User", "Guest"].map((role) => (
                <Button
                  key={role}
                  variant={filterRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole(role)}
                  className={
                    filterRole === role
                      ? "bg-gradient-to-r from-red-600 to-purple-600 text-white"
                      : "hover:bg-gray-100"
                  }
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center">
            <MailOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Messages Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== "All"
                ? "Try adjusting your filters"
                : "Your inbox is empty"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((msg) => (
            <Card
              key={msg._id}
              className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-red-300"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header: Name, Role, and Time */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg ">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{msg.name}</h4>
                        <Badge className={`${getRoleBadgeColor(msg.senderRole)} text-xs`}>
                          {msg.senderRole || "Guest"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatDate(msg.createdAt)}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-red-600" />
                      <span className="text-gray-700">{msg.email}</span>
                    </div>
                    {msg.phoneNo && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-red-600" />
                        <span className="text-gray-700">{msg.phoneNo}</span>
                      </div>
                    )}
                    {msg.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-red-600" />
                        <span className="text-gray-700">{msg.company}</span>
                      </div>
                    )}
                    {msg.eventType && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="text-gray-700">{msg.eventType}</span>
                      </div>
                    )}
                  </div>

                  {/* Question/Heard About Us */}
                  {msg.question && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 mb-1">How they heard about us:</p>
                      <p className="text-sm text-gray-700">{msg.question}</p>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                      <p className="text-sm font-semibold text-gray-700">Message:</p>
                    </div>
                    <p className="text-gray-800 leading-relaxed pl-7">{msg.message}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
                      onClick={() => window.open(`mailto:${msg.email}`, "_blank")}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <MailOpen className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="text-center mt-6">
               <Button variant="outline" asChild>
                <a href="/admin">Back to Dashboard</a>
                </Button>
             </div>
    </div>
  );
};



// src/components/admin/AdminInbox.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// export const AdminInbox = () => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get("/contactus", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMessages(res.data.data || []);
//         setError("");
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch inbox messages.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, []);

//   if (loading) return <p>Loading inbox...</p>;
//   if (error) return <Alert><AlertDescription>{error}</AlertDescription></Alert>;

//   return (
//     <div className="space-y-4">
//       {messages.length === 0 && <p>No messages in inbox.</p>}
//       {messages.map((msg) => (
//         <Card key={msg._id} className="border-gray-200/20">
//           <CardContent>
//             <div className="flex justify-between items-center">
//               <div>
//                 <Badge variant="secondary" className="mb-2">{msg.name}</Badge>
//                 <Badge variant="secondary" className="mb-2">{msg.email}</Badge>

//                 <p className="text-sm text-gray-700">{msg.subject}</p>
//                 <p className="text-xs text-gray-500">{msg.message}</p>
//               </div>
//               <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
       

//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// };
