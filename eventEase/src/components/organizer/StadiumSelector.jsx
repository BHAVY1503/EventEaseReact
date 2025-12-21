import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ScrollArea
} from "@/components/ui/scroll-area";
import {
  MapPin,
  Users,
  Loader2,
  Building,
  Ticket,
  Eye,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const StadiumSelector = () => {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const queryParams = new URLSearchParams(location.search);
  const role = localStorage.getItem("role");

  // Get the redirect URL from query params
  const redirectTo = queryParams.get("redirectTo");

  useEffect(() => {
    const fetchStadiums = async () => {
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/admin/stadiums", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (Array.isArray(response.data)) {
          setStadiums(response.data);
        } else if (response.data.stadiums && Array.isArray(response.data.stadiums)) {
          setStadiums(response.data.stadiums);
        } else {
          setStadiums([]);
        }
      } catch (error) {
        console.error("Error fetching stadiums:", error);
        setError("Failed to fetch stadiums. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStadiums();
  }, [token]);

  const selectStadium = (stadium) => {
    try {
      localStorage.setItem("selectedStadium", JSON.stringify(stadium));
      localStorage.setItem("selectedCategory", "Indoor");

      // Check if we have a specific redirect URL (like /updateevent/:id)
      if (redirectTo) {
        // Navigate to the exact redirect URL provided
        navigate(redirectTo);
      } else {
        // Default behavior for new events - navigate with hash
        if (role === "Organizer") {
          navigate("/organizer#addevent");
        } else if (role === "Admin") {
          navigate("/admin#addevent");
        }
      }
    } catch (error) {
      console.error("Error selecting stadium:", error);
      alert("Failed to select stadium. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-semibold">Loading Stadiums...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we load stadiums.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600 dark:bg-purple-500 rounded-full blur opacity-25 animate-pulse"></div>
            <div className="relative p-4 bg-purple-600 dark:bg-purple-500 rounded-full shadow-xl">
              <Building className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Select Your Stadium
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose from a collection of premium world-class venues for your next event.
        </p>
      </div>

      {/* Stadium List */}
      {error ? (
        <div className="text-center text-red-500 font-medium">{error}</div>
      ) : stadiums.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Building className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Stadiums Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're updating our venue collection. Please check back soon!
          </p>
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
          >
            <Clock className="w-4 h-4 mr-2" /> Notify Me
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stadiums.map((stadium) => (
            <Card
              key={stadium._id}
              className="group flex flex-col bg-white/80 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              <div className="relative">
                {stadium.imageUrl ? (
                  <img
                    src={stadium.imageUrl}
                    alt={stadium.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Building className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge className="bg-white/90 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold px-3 py-1.5 shadow">
                    <Users className="h-4 w-4 mr-1" />
                    {stadium.totalSeats || "N/A"}
                  </Badge>
                  <Badge className="bg-purple-600 dark:bg-purple-500 text-white font-semibold px-3 py-1.5 shadow">
                    {stadium.zones?.length || 0} Zones
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                  {stadium.name}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {stadium.location?.address || "No address available"}
                </p>
              </CardHeader>

              <CardContent className="space-y-2">
                <Tabs defaultValue="overview">
                  <TabsList className="grid grid-cols-2 mb-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="zones">Zones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Total Seats:</span>
                      <span>{stadium.totalSeats || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Total Zones:</span>
                      <span>{stadium.zones?.length || 0}</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="zones">
                    <ScrollArea className="h-24">
                      {stadium.zones?.map((zone, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-1"
                        >
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                            Zone {String.fromCharCode(65 + idx)}
                          </span>
                          <Badge className="bg-purple-600 dark:bg-purple-500 text-white text-xs px-2 py-0.5">
                            ₹{zone.price}
                          </Badge>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex gap-3 p-4">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
                  onClick={() => setSelectedStadium(stadium)}
                >
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>

                <Button
                  onClick={() => selectStadium(stadium)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold"
                >
                  <Building className="h-4 w-4 mr-2" /> Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StadiumSelector;


// import axios from "axios";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import {
//   ScrollArea
// } from "@/components/ui/scroll-area";
// import {
//   MapPin,
//   Users,
//   Loader2,
//   Building,
//   Ticket,
//   Eye,
//   Clock,
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// export const StadiumSelector = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedStadium, setSelectedStadium] = useState(null);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const queryParams = new URLSearchParams(location.search);
//   const role = localStorage.getItem("role");

//   const redirectTo =
//     queryParams.get("redirectTo") ||
//     (role === "Admin" ? "/admin#events" : "/organizer#addevent");

//   useEffect(() => {
//     const fetchStadiums = async () => {
//       if (!token) {
//         setError("Authentication token not found. Please login again.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get("/admin/stadiums", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (Array.isArray(response.data)) {
//           setStadiums(response.data);
//         } else if (response.data.stadiums && Array.isArray(response.data.stadiums)) {
//           setStadiums(response.data.stadiums);
//         } else {
//           setStadiums([]);
//         }
//       } catch (error) {
//         console.error("Error fetching stadiums:", error);
//         setError("Failed to fetch stadiums. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStadiums();
//   }, [token]);

//   // const selectStadium = (stadium) => {
//   //   try {
//   //     localStorage.setItem("selectedStadium", JSON.stringify(stadium));
//   //     localStorage.setItem("selectedCategory", "Indoor");
//   //     navigate(redirectTo);
//   //   } catch (error) {
//   //     console.error("Error selecting stadium:", error);
//   //     alert("Failed to select stadium. Please try again.");
//   //   }
//   // };

//   const selectStadium = (stadium) => {
//   try {
//     localStorage.setItem("selectedStadium", JSON.stringify(stadium));
//     localStorage.setItem("selectedCategory", "Indoor");

//     // Instead of a full reload, scroll to AddEvent on the same page
//     if (role === "Organizer") {
//       navigate("/organizer");
//       setTimeout(() => {
//         const section = document.getElementById("addevent");
//         if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
//       }, 300); // wait until page loads
//     } else if (role === "Admin") {
//       navigate("/admin#events");
//     }
//   } catch (error) {
//     console.error("Error selecting stadium:", error);
//     alert("Failed to select stadium. Please try again.");
//   }
// };


//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//         <div className="flex flex-col items-center space-y-4">
//           <Loader2 className="h-10 w-10 animate-spin text-purple-600 dark:text-purple-400" />
//           <h2 className="text-2xl font-semibold">Loading Stadiums...</h2>
//           <p className="text-gray-600 dark:text-gray-400">Please wait while we load stadiums.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//       {/* Header */}
//       <div className="text-center mb-12">
//         <div className="flex justify-center mb-6">
//           <div className="relative">
//             <div className="absolute inset-0 bg-purple-600 dark:bg-purple-500 rounded-full blur opacity-25 animate-pulse"></div>
//             <div className="relative p-4 bg-purple-600 dark:bg-purple-500 rounded-full shadow-xl">
//               <Building className="h-12 w-12 text-white" />
//             </div>
//           </div>
//         </div>
//         <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
//           Select Your Stadium
//         </h1>
//         <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//           Choose from a collection of premium world-class venues for your next event.
//         </p>
//       </div>

//       {/* Stadium List */}
//       {error ? (
//         <div className="text-center text-red-500 font-medium">{error}</div>
//       ) : stadiums.length === 0 ? (
//         <div className="text-center py-16">
//           <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
//             <Building className="w-12 h-12 text-gray-400 dark:text-gray-600" />
//           </div>
//           <h3 className="text-xl font-semibold mb-2">No Stadiums Available</h3>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             We’re updating our venue collection. Please check back soon!
//           </p>
//           <Button
//             variant="outline"
//             className="border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
//           >
//             <Clock className="w-4 h-4 mr-2" /> Notify Me
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {stadiums.map((stadium) => (
//             <Card
//               key={stadium._id}
//               className="group flex flex-col bg-white/80 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
//             >
//               <div className="relative">
//                 {stadium.imageUrl ? (
//                   <img
//                     src={stadium.imageUrl}
//                     alt={stadium.name}
//                     className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                 ) : (
//                   <div className="h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//                     <Building className="h-16 w-16 text-gray-400 dark:text-gray-600" />
//                   </div>
//                 )}
//                 <div className="absolute top-4 right-4 flex flex-col gap-2">
//                   <Badge className="bg-white/90 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold px-3 py-1.5 shadow">
//                     <Users className="h-4 w-4 mr-1" />
//                     {stadium.totalSeats || "N/A"}
//                   </Badge>
//                   <Badge className="bg-purple-600 dark:bg-purple-500 text-white font-semibold px-3 py-1.5 shadow">
//                     {stadium.zones?.length || 0} Zones
//                   </Badge>
//                 </div>
//               </div>

//               <CardHeader>
//                 <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
//                   {stadium.name}
//                 </CardTitle>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
//                   <MapPin className="h-4 w-4" />
//                   {stadium.location?.address || "No address available"}
//                 </p>
//               </CardHeader>

//               <CardContent className="space-y-2">
//                 <Tabs defaultValue="overview">
//                   <TabsList className="grid grid-cols-2 mb-3">
//                     <TabsTrigger value="overview">Overview</TabsTrigger>
//                     <TabsTrigger value="zones">Zones</TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="overview">
//                     <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
//                       <span>Total Seats:</span>
//                       <span>{stadium.totalSeats || "N/A"}</span>
//                     </div>
//                     <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
//                       <span>Total Zones:</span>
//                       <span>{stadium.zones?.length || 0}</span>
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="zones">
//                     <ScrollArea className="h-24">
//                       {stadium.zones?.map((zone, idx) => (
//                         <div
//                           key={idx}
//                           className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-1"
//                         >
//                           <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
//                             Zone {String.fromCharCode(65 + idx)}
//                           </span>
//                           <Badge className="bg-purple-600 dark:bg-purple-500 text-white text-xs px-2 py-0.5">
//                             ₹{zone.price}
//                           </Badge>
//                         </div>
//                       ))}
//                     </ScrollArea>
//                   </TabsContent>
//                 </Tabs>
//               </CardContent>

//               <CardFooter className="flex gap-3 p-4">
//                 <Button
//                   variant="outline"
//                   className="flex-1 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
//                   onClick={() => setSelectedStadium(stadium)}
//                 >
//                   <Eye className="h-4 w-4 mr-2" /> Preview
//                 </Button>

//                 <Button
//                   onClick={() => selectStadium(stadium)}
//                   className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold"
//                 >
//                   <Building className="h-4 w-4 mr-2" /> Select
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StadiumSelector;













