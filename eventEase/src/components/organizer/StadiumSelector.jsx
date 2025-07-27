// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { MapPin, Users, Loader2, Stadium, Ticket, Grid3X3, Eye, MapIcon, Info } from 'lucide-react';

// export const StadiumSelector = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedStadiumForPreview, setSelectedStadiumForPreview] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = localStorage.getItem("token");

//   const queryParams = new URLSearchParams(location.search);
//   const redirectTo = queryParams.get("redirectTo") || "/organizer#addevent";

//   useEffect(() => {
//     const fetchStadiums = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get("/admin/stadiums", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setStadiums(response.data);
//       } catch (error) {
//         console.error("Error fetching stadiums:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStadiums();
//   }, [token]);

//   const selectStadium = (stadium) => {
//     localStorage.setItem("selectedStadium", JSON.stringify(stadium));
//     localStorage.setItem("selectedCategory", "Indoor");
//     navigate(redirectTo);
//   };

//   const getZoneColorClass = (index) => {
//     const colors = [
//       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "bg-emerald-500" },
//       { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", accent: "bg-blue-500" },
//       { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", accent: "bg-purple-500" },
//       { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", accent: "bg-orange-500" },
//       { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", accent: "bg-rose-500" },
//       { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "bg-amber-500" }
//     ];
//     return colors[index % colors.length];
//   };

//   const ZoneCard = ({ zone, zoneIndex, isCompact = false }) => {
//     const colorClass = getZoneColorClass(zoneIndex);
    
//     return (
//       <div className={`relative p-4 rounded-xl border-2 ${colorClass.bg} ${colorClass.border} hover:shadow-md transition-all duration-200`}>
//         <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${colorClass.accent}`}></div>
//         <div className="ml-6">
//           <div className="flex items-center justify-between mb-3">
//             <h4 className={`font-bold text-lg ${colorClass.text}`}>
//               Zone {String.fromCharCode(65 + zoneIndex)}
//             </h4>
//             <Badge className={`${colorClass.accent} text-white font-bold px-3 py-1`}>
//               ₹{zone.price}
//             </Badge>
//           </div>
          
//           <div className="flex items-center gap-4 mb-3">
//             <div className="flex items-center gap-1">
//               <Ticket className="h-4 w-4" />
//               <span className="text-sm font-medium">{zone.seatLabels.length} seats</span>
//             </div>
//           </div>

//           {!isCompact && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-700">Available Seats:</p>
//               <div className="grid grid-cols-6 gap-1 max-h-20 overflow-y-auto">
//                 {zone.seatLabels.map((label, seatIndex) => (
//                   <div
//                     key={seatIndex}
//                     className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-center font-medium hover:bg-gray-50 transition-colors"
//                   >
//                     {label}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const StadiumPreviewDialog = ({ stadium, open, onOpenChange }) => (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-2xl">
//             <Stadium className="h-6 w-6 text-green-600" />
//             {stadium?.name}
//           </DialogTitle>
//           <DialogDescription className="flex items-center gap-2 text-base">
//             <MapPin className="h-4 w-4" />
//             {stadium?.location?.address}
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="space-y-6">
//           {stadium?.imageUrl && (
//             <img
//               src={stadium.imageUrl}
//               alt={stadium.name}
//               className="w-full h-64 object-cover rounded-lg"
//             />
//           )}
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <h3 className="text-xl font-bold text-gray-900">Stadium Information</h3>
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <Users className="h-5 w-5 text-gray-500" />
//                   <span className="font-medium">Total Capacity: {stadium?.totalSeats} seats</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Grid3X3 className="h-5 w-5 text-gray-500" />
//                   <span className="font-medium">Zones: {stadium?.zones?.length}</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="space-y-4">
//               <h3 className="text-xl font-bold text-gray-900">Zone Overview</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {stadium?.zones?.map((zone, zoneIndex) => (
//                   <ZoneCard key={zoneIndex} zone={zone} zoneIndex={zoneIndex} isCompact={true} />
//                 ))}
//               </div>
//             </div>
//           </div>
          
//           <div className="space-y-4">
//             <h3 className="text-xl font-bold text-gray-900">Detailed Seating Layout</h3>
//             <div className="space-y-4">
//               {stadium?.zones?.map((zone, zoneIndex) => (
//                 <ZoneCard key={zoneIndex} zone={zone} zoneIndex={zoneIndex} />
//               ))}
//             </div>
//           </div>
          
//           <div className="flex gap-3 pt-4">
//             <Button 
//               onClick={() => selectStadium(stadium)}
//               className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
//               size="lg"
//             >
//               <Stadium className="h-5 w-5 mr-2" />
//               Select This Stadium
//             </Button>
//             <Button 
//               variant="outline" 
//               onClick={() => onOpenChange(false)}
//               className="px-6"
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="relative">
//             <Stadium className="h-16 w-16 text-green-600 animate-pulse" />
//             <Loader2 className="h-6 w-6 animate-spin absolute -top-1 -right-1 text-green-500" />
//           </div>
//           <span className="text-xl font-medium text-gray-700">Loading stadiums...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
//       <div className="container mx-auto py-12 px-4">
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center mb-6">
//             <div className="p-4 bg-green-600 rounded-full shadow-lg">
//               <Stadium className="h-12 w-12 text-white" />
//             </div>
//           </div>
//           <h1 className="text-5xl font-bold text-gray-900 mb-4">Select Your Stadium</h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Choose the perfect venue for your event from our premium stadium collection
//           </p>
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
//           {stadiums.map((stadium) => (
//             <Card key={stadium._id} className="group flex flex-col h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
//               <div className="relative">
//                 {stadium.imageUrl ? (
//                   <div className="relative overflow-hidden rounded-t-xl">
//                     <img
//                       src={stadium.imageUrl}
//                       alt={stadium.name}
//                       className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//                     <div className="absolute top-4 right-4 flex gap-2">
//                       <Badge className="bg-white/90 text-gray-800 font-bold px-3 py-2">
//                         <Users className="h-4 w-4 mr-1" />
//                         {stadium.totalSeats}
//                       </Badge>
//                       <Badge className="bg-green-600 text-white font-bold px-3 py-2">
//                         {stadium.zones?.length} Zones
//                       </Badge>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
//                     <Stadium className="h-16 w-16 text-gray-400" />
//                   </div>
//                 )}
//               </div>
              
//               <CardHeader className="pb-4">
//                 <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
//                   {stadium.name}
//                 </CardTitle>
//                 <CardDescription className="flex items-center space-x-2 text-base">
//                   <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
//                   <a
//                     href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:text-blue-800 hover:underline truncate transition-colors"
//                   >
//                     {stadium.location?.address}
//                   </a>
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="flex-1 space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   {stadium.zones?.slice(0, 4).map((zone, zoneIndex) => {
//                     const colorClass = getZoneColorClass(zoneIndex);
//                     return (
//                       <div key={zoneIndex} className={`p-3 rounded-lg ${colorClass.bg} ${colorClass.border} border`}>
//                         <div className="flex items-center justify-between">
//                           <span className={`font-semibold text-sm ${colorClass.text}`}>
//                             Zone {String.fromCharCode(65 + zoneIndex)}
//                           </span>
//                           <Badge variant="secondary" className="text-xs font-bold">
//                             ₹{zone.price}
//                           </Badge>
//                         </div>
//                         <div className="flex items-center mt-1">
//                           <Ticket className="h-3 w-3 mr-1 text-gray-500" />
//                           <span className="text-xs text-gray-600">{zone.seatLabels?.length} seats</span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
                
//                 {stadium.zones?.length > 4 && (
//                   <div className="text-center">
//                     <Badge variant="outline" className="text-gray-600">
//                       +{stadium.zones.length - 4} more zones
//                     </Badge>
//                   </div>
//                 )}
//               </CardContent>

//               <CardFooter className="flex gap-3 pt-6">
//                 <Dialog>
//                   <DialogTrigger asChild>
//                     <Button 
//                       variant="outline" 
//                       className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
//                     >
//                       <Eye className="h-4 w-4 mr-2" />
//                       Preview
//                     </Button>
//                   </DialogTrigger>
//                   <StadiumPreviewDialog 
//                     stadium={stadium} 
//                     open={false} 
//                     onOpenChange={() => {}} 
//                   />
//                 </Dialog>
                
//                 <Button 
//                   onClick={() => selectStadium(stadium)}
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
//                   size="lg"
//                 >
//                   <Stadium className="h-5 w-5 mr-2" />
//                   Select
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>

//         {stadiums.length === 0 && !loading && (
//           <div className="text-center py-20">
//             <div className="max-w-md mx-auto">
//               <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
//                 <Stadium className="h-24 w-24 mx-auto mb-6 text-gray-300" />
//                 <h3 className="text-2xl font-bold mb-3 text-gray-700">No Stadiums Available</h3>
//                 <p className="text-lg text-gray-500">
//                   There are currently no stadiums to display. Please check back later.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, Users, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

export const StadiumSelector = () => {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openZones, setOpenZones] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirectTo") || "/organizer#addevent";

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/stadiums", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStadiums(response.data);
      } catch (error) {
        console.error("Error fetching stadiums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStadiums();
  }, [token]);

  const selectStadium = (stadium) => {
    localStorage.setItem("selectedStadium", JSON.stringify(stadium));
    localStorage.setItem("selectedCategory", "Indoor");
    navigate(redirectTo);
  };

  const toggleZone = (stadiumId, zoneIndex) => {
    const key = `${stadiumId}-${zoneIndex}`;
    setOpenZones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading stadiums...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Select a Stadium</h1>
        <p className="text-gray-600">Choose the perfect venue for your event</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium, stadiumIndex) => (
          <Card key={stadium._id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            {stadium.imageUrl && (
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={stadium.imageUrl}
                  alt={stadium.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">{stadium.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Total Seats: {stadium.totalSeats}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                <a
                  href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline line-clamp-2"
                >
                  {stadium.location?.address}
                </a>
              </div>

              {/* Zones */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Zones & Pricing</h4>
                {stadium.zones.map((zone, zoneIndex) => {
                  const isOpen = openZones[`${stadium._id}-${zoneIndex}`];
                  return (
                    <Collapsible key={zoneIndex}>
                      <CollapsibleTrigger
                        onClick={() => toggleZone(stadium._id, zoneIndex)}
                        className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">
                            Zone {String.fromCharCode(65 + zoneIndex)}
                          </span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ₹{zone.price}
                          </Badge>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="pt-2">
                        <div className="p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Available Seats:</p>
                          <div className="flex flex-wrap gap-1">
                            {zone.seatLabels.map((label, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button 
                onClick={() => selectStadium(stadium)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Select Stadium
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {stadiums.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No Stadiums Available</h3>
            <p>There are currently no stadiums to display.</p>
          </div>
        </div>
      )}
    </div>
  );
};

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



