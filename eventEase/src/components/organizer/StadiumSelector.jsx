{/* <Building classNameimport React, { useEffect, useState } from "react"; */}
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Loader2, Building, Ticket, Grid3X3, Eye, Map, Info, Star, Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from "react";

const StadiumSelector = () => {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Get token from localStorage (adjust based on your auth implementation)
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  // Get redirect URL from query params (for navigation after selection)
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return "/organizer#addevent";
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("redirectTo") || "/organizer#addevent";
  };

  // Fetch stadiums from API
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
            'Content-Type': 'application/json'
          },
        });

        // Handle the response data
        if (response.data && Array.isArray(response.data)) {
          setStadiums(response.data);
        } else if (response.data.stadiums && Array.isArray(response.data.stadiums)) {
          // In case the API returns { stadiums: [...] }
          setStadiums(response.data.stadiums);
        } else {
          setStadiums([]);
        }

      } catch (error) {
        console.error("Error fetching stadiums:", error);
        
        // Handle different error types
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
          // Optionally redirect to login
          // window.location.href = "/login";
        } else if (error.response?.status === 403) {
          setError("You don't have permission to view stadiums.");
        } else if (error.response?.status === 404) {
          setError("Stadium service not found.");
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          setError("Network error. Please check your connection.");
        } else {
          setError(error.response?.data?.message || "Failed to fetch stadiums. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStadiums();
  }, [token]);

  // Handle stadium selection
  const selectStadium = (stadium) => {
    try {
      // Store selected stadium in localStorage
      localStorage.setItem("selectedStadium", JSON.stringify(stadium));
      localStorage.setItem("selectedCategory", "Indoor");
      
      // Navigate to the redirect URL
      const redirectTo = getRedirectUrl();
      window.location.href = redirectTo;
      
      // Or if using React Router:
      // navigate(redirectTo);
      
    } catch (error) {
      console.error("Error selecting stadium:", error);
      alert("Failed to select stadium. Please try again.");
    }
  };

  const getZoneColorClass = (index) => {
    const colors = [
      { bg: "bg-gradient-to-br from-emerald-50 to-emerald-100", text: "text-emerald-800", border: "border-emerald-300", accent: "bg-emerald-600" },
      { bg: "bg-gradient-to-br from-blue-50 to-blue-100", text: "text-blue-800", border: "border-blue-300", accent: "bg-blue-600" },
      { bg: "bg-gradient-to-br from-purple-50 to-purple-100", text: "text-purple-800", border: "border-purple-300", accent: "bg-purple-600" },
      { bg: "bg-gradient-to-br from-amber-50 to-amber-100", text: "text-amber-800", border: "border-amber-300", accent: "bg-amber-600" },
      { bg: "bg-gradient-to-br from-rose-50 to-rose-100", text: "text-rose-800", border: "border-rose-300", accent: "bg-rose-600" },
      { bg: "bg-gradient-to-br from-indigo-50 to-indigo-100", text: "text-indigo-800", border: "border-indigo-300", accent: "bg-indigo-600" }
    ];
    return colors[index % colors.length];
  };

  const ZoneCard = ({ zone, zoneIndex, isDetailed = false }) => {
    const colorClass = getZoneColorClass(zoneIndex);
    
    return (
      <div className={`relative p-4 rounded-xl border-2 ${colorClass.bg} ${colorClass.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
        <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${colorClass.accent} shadow-sm`}></div>
        <div className="ml-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className={`font-bold text-lg ${colorClass.text}`}>
                Zone {String.fromCharCode(65 + zoneIndex)}
              </h4>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <Badge className={`${colorClass.accent} text-white font-bold px-3 py-1.5 shadow-sm`}>
              ₹{zone.price.toLocaleString()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <Ticket className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{zone.seatLabels.length} seats available</span>
            </div>
          </div>

          {isDetailed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Available Seats:</p>
                <Badge variant="outline" className="text-xs">
                  {zone.seatLabels.length} total
                </Badge>
              </div>
              <ScrollArea className="h-24">
                <div className="grid grid-cols-6 gap-1.5">
                  {zone.seatLabels.map((label, seatIndex) => (
                    <div
                      key={seatIndex}
                      className="bg-white/80 border border-gray-300 rounded-md px-2 py-1.5 text-xs text-center font-medium hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StadiumPreviewSheet = ({ stadium, open, onOpenChange }) => (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:w-[600px] lg:w-[800px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold">{stadium?.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-base mt-1">
                <MapPin className="h-4 w-4" />
                {stadium?.location?.address}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {stadium?.imageUrl && (
            <div className="relative">
              <img
                src={stadium.imageUrl}
                alt={stadium.name}
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  {stadium.totalSeats?.toLocaleString()} seats
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                  Stadium Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Capacity</span>
                  <Badge variant="secondary" className="font-semibold">
                    {stadium?.totalSeats?.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Number of Zones</span>
                  <Badge variant="secondary" className="font-semibold">
                    {stadium?.zones?.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price Range</span>
                  <Badge variant="secondary" className="font-semibold">
                    ₹{Math.min(...(stadium?.zones?.map(z => z.price) || [0])).toLocaleString()} - ₹{Math.max(...(stadium?.zones?.map(z => z.price) || [0])).toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Map className="h-5 w-5 text-green-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://www.google.com/maps?q=${stadium?.location?.latitude},${stadium?.location?.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm leading-relaxed transition-colors"
                >
                  {stadium?.location?.address}
                </a>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-green-600" />
              Seating Zones & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stadium?.zones?.map((zone, zoneIndex) => (
                <div 
                  key={zoneIndex}
                  className={`relative p-6 rounded-2xl border-2 ${getZoneColorClass(zoneIndex).bg} ${getZoneColorClass(zoneIndex).border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getZoneColorClass(zoneIndex).accent} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-sm">
                          {String.fromCharCode(65 + zoneIndex)}
                        </span>
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${getZoneColorClass(zoneIndex).text}`}>
                          Zone {String.fromCharCode(65 + zoneIndex)}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">Premium Seating</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full ${getZoneColorClass(zoneIndex).accent} text-white font-bold shadow-lg`}>
                        ₹{zone.price?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Available Seats</span>
                      </div>
                      <Badge variant="outline" className="text-sm font-semibold">
                        {zone.seatLabels?.length || 0} seats
                      </Badge>
                    </div>
                    
                    <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                      <ScrollArea className="h-24">
                        <div className="grid grid-cols-8 gap-1">
                          {zone.seatLabels?.map((label, seatIndex) => (
                            <div
                              key={seatIndex}
                              className="bg-white border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center font-bold hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer shadow-sm"
                            >
                              {label}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Price per seat: <span className="font-semibold">₹{zone.price?.toLocaleString() || 'N/A'}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getZoneColorClass(zoneIndex).bg} ${getZoneColorClass(zoneIndex).text}`}>
                        {zone.seatLabels?.length || 0} available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t">
            <Button 
              onClick={() => {
                selectStadium(stadium);
                onOpenChange(false);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Building className="h-5 w-5 mr-2" />
              Select This Stadium
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative p-4 bg-green-600 rounded-full shadow-lg">
              {/* <Stadium className="h-12 w-12 text-white" /> */}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Stadiums</h2>
            <p className="text-gray-600">Finding the perfect venues for you...</p>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            <span className="text-sm text-gray-500">Please wait</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-600 rounded-full blur opacity-20 animate-pulse"></div>
              <div className="relative p-4 bg-green-600 rounded-full shadow-xl">
                <Building className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Select Your <span className="text-green-600">Stadium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose from our premium collection of world-class venues for your special event
          </p>
        </div>
        
        {/* Stadium Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {stadiums.map((stadium) => (
            <Card key={stadium._id} className="group flex flex-col h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="relative">
                {stadium.imageUrl ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={stadium.imageUrl}
                      alt={stadium.name}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Badge className="bg-white/95 text-gray-800 font-bold px-3 py-2 shadow-lg">
                        <Users className="h-4 w-4 mr-1" />
                        {stadium.totalSeats?.toLocaleString() || 'N/A'}
                      </Badge>
                      <Badge className="bg-green-600 text-white font-bold px-3 py-2 shadow-lg">
                        {stadium.zones?.length || 0} Zones
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold mb-1">{stadium.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">
                          {stadium.location?.address.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Stadium className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <CardContent className="flex-1 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Zone Pricing</h4>
                    <p className="text-sm text-gray-600">Starting from the most affordable</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ₹{stadium.zones?.length > 0 ? Math.min(...stadium.zones.map(z => z.price || 0)).toLocaleString() : 'N/A'}+
                  </Badge>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="zones" className="text-xs">Zones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Total Seats</div>
                        <div className="font-semibold text-lg">{stadium.totalSeats.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Zones</div>
                        <div className="font-semibold text-lg">{stadium.zones.length}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="zones" className="space-y-2">
                    <ScrollArea className="h-32">
                      {stadium.zones?.slice(0, 3).map((zone, zoneIndex) => {
                        const colorClass = getZoneColorClass(zoneIndex);
                        return (
                          <div key={zoneIndex} className={`p-3 mb-2 rounded-lg ${colorClass.bg} ${colorClass.border} border`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold text-sm ${colorClass.text}`}>
                                Zone {String.fromCharCode(65 + zoneIndex)}
                              </span>
                              <Badge className={`${colorClass.accent} text-white text-xs font-bold`}>
                                ₹{zone.price?.toLocaleString() || 'N/A'}
                              </Badge>
                            </div>
                            <div className="flex items-center mt-1">
                              <Ticket className="h-3 w-3 mr-1 text-gray-500" />
                              <span className="text-xs text-gray-600">{zone.seatLabels?.length || 0} seats</span>
                            </div>
                          </div>
                        );
                      })}
                      {stadium.zones?.length > 3 && (
                        <div className="text-center py-2">
                          <Badge variant="outline" className="text-gray-600">
                            +{stadium.zones.length - 3} more zones
                          </Badge>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex gap-3 p-6 pt-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300"
                      onClick={() => setSelectedStadium(stadium)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </SheetTrigger>
                  <StadiumPreviewSheet 
                    stadium={selectedStadium} 
                    open={false} 
                    onOpenChange={setPreviewOpen} 
                  />
                </Sheet>
                
                <Button 
                  onClick={() => selectStadium(stadium)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Building className="h-5 w-5 mr-2" />
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {stadiums.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="mb-6">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Stadium className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-700">No Stadiums Available</h3>
                  <p className="text-lg text-gray-500 leading-relaxed">
                    We're currently updating our venue collection. Please check back soon for amazing stadium options.
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Notify Me When Available
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { StadiumSelector };
export default StadiumSelector;



//oldest
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";

// export const StadiumSelector = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const navigate = useNavigate();
//    const location = useLocation();
//   const token = localStorage.getItem("token");

//   const queryParams = new URLSearchParams(location.search);
//   const redirectTo = queryParams.get("redirectTo") || "/organizer#addevent"

//   console.log("redirectTo:", redirectTo);
//   useEffect(() => {
//     axios
//       .get("/admin/stadiums", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setStadiums(res.data))
//       .catch((err) => console.error(err));
//   }, []);

//    const selectStadium = (stadium) => {
//     localStorage.setItem("selectedStadium", JSON.stringify(stadium));
//     localStorage.setItem("selectedCategory", "Indoor");
//     navigate(redirectTo);
//   };

//   // const selectStadium = (stadium) => {
//   //   localStorage.setItem("selectedStadium", JSON.stringify(stadium));
//   //   localStorage.setItem("selectedCategory", "Indoor");
//   //   window.location.href = "/organizer#addevent";
//   // };

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">Select a Stadium</h2>
//       <div className="row">
//         {stadiums.map((s, stadiumIndex) => (
//           <div className="col-md-6 mb-4" key={s._id}>
//             <div className="card h-100 shadow border-0">
//               {s.imageUrl && (
//                 <img
//                   src={s.imageUrl}
//                   className="card-img-top"
//                   alt={s.name}
//                   style={{ height: "200px", objectFit: "cover" }}
//                 />
//               )}
//               <div className="card-body">
//                 <h5 className="card-title">{s.name}</h5>
//                 <p className="card-text">Total Seats: {s.totalSeats}</p>
//                 <p>
//                   <strong>Address:</strong>{" "}
//                   <a
//                     href={`https://www.google.com/maps?q=${s.location.latitude},${s.location.longitude}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {s.location?.address}
//                   </a>
//                 </p>

//                 {/* Zones Accordion */}
//                 <div className="accordion" id={`zonesAccordion${stadiumIndex}`}>
//                   {s.zones.map((zone, index) => (
//                     <div className="accordion-item" key={index}>
//                       <h2 className="accordion-header" id={`heading-${stadiumIndex}-${index}`}>
//                         <button
//                           className="accordion-button collapsed"
//                           type="button"
//                           data-bs-toggle="collapse"
//                           data-bs-target={`#collapse-${stadiumIndex}-${index}`}
//                           aria-expanded="false"
//                           aria-controls={`collapse-${stadiumIndex}-${index}`}
//                         >
//                           Zone {String.fromCharCode(65 + index)} – ₹{zone.price}
//                         </button>
//                       </h2>
//                       <div
//                         id={`collapse-${stadiumIndex}-${index}`}
//                         className="accordion-collapse collapse"
//                         aria-labelledby={`heading-${stadiumIndex}-${index}`}
//                         data-bs-parent={`#zonesAccordion${stadiumIndex}`}
//                       >
//                         <div className="accordion-body">
//                           <div className="d-flex flex-wrap gap-2">
//                             {zone.seatLabels.map((label, i) => (
//                               <span key={i} className="badge bg-secondary">
//                                 {label}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <button
//                   className="btn btn-success mt-3 w-100"
//                   onClick={() => selectStadium(s)}
//                 >
//                   Select Stadium
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };



