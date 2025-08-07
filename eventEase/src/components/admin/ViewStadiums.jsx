import React, { useEffect, useState } from "react";
import axios from "axios"; // Uncommented for API usage
import { Link } from "react-router-dom"; // Uncommented for navigation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Users,
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Building,
  Grid3X3,
  List,
  Maximize2,
  Star,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";

const ViewStadiums = () => {
  const [stadiums, setStadiums] = useState([]);
  const [expandedZone, setExpandedZone] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneView, setZoneView] = useState("grid"); // grid, list, or visual
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get("/admin/stadiums", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setStadiums(res.data);
      } catch (err) {
        console.error("Error fetching stadiums:", err);
        setError(
          err.response?.data?.message || 
          err.message || 
          "Failed to load stadiums. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchStadiums();
  }, [token]);

  const toggleZone = (stadiumId, zoneIndex) => {
    const key = `${stadiumId}_${zoneIndex}`;
    setExpandedZone((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExpandAll = (expand) => {
    const newState = {};
    stadiums.forEach((stadium) => {
      stadium.zones.forEach((_, i) => {
        const key = `${stadium._id}_${i}`;
        newState[key] = expand;
      });
    });
    setExpandedZone(newState);
  };

  const getZoneName = (index) => String.fromCharCode(65 + index);

  const renderSeatsGrid = (seats) => (
    <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border">
      {seats.map((seat, idx) => (
        <div
          key={idx}
          className="bg-blue-100 hover:bg-blue-200 transition-colors p-1.5 text-center rounded text-xs font-medium border border-blue-200 cursor-pointer"
        >
          {seat}
        </div>
      ))}
    </div>
  );

  const renderSeatsList = (seats) => (
    <div className="max-h-32 overflow-y-auto p-3 bg-slate-50 rounded-lg border">
      <div className="flex flex-wrap gap-1">
        {seats.map((seat, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {seat}
          </Badge>
        ))}
      </div>
    </div>
  );

  const renderSeatsVisual = (zone, zoneIndex) => (
    <div className="p-4 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg border">
      <div className="text-center mb-3">
        <div className="inline-block px-4 py-2 bg-slate-800 text-white rounded-full text-sm font-medium">
          🎭 STAGE
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(Math.ceil(zone.seatLabels.length / 10))].map((_, rowIndex) => {
          const rowSeats = zone.seatLabels.slice(rowIndex * 10, (rowIndex + 1) * 10);
          return (
            <div key={rowIndex} className="flex justify-center gap-1">
              {rowSeats.map((seat, seatIndex) => (
                <div
                  key={seatIndex}
                  className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-t-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors"
                  title={seat}
                >
                  💺
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <Skeleton className="h-64 w-full rounded-t-lg" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const RetryButton = () => (
    <Button 
      variant="outline" 
      onClick={() => window.location.reload()}
      className="border-blue-200 text-blue-600 hover:bg-blue-50"
    >
      Try Again
    </Button>
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Stadium Overview
          </h1>
          <p className="text-lg text-slate-600">Loading stadiums...</p>
        </div>
        <LoadingSkeleton />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Stadium Overview
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Manage and explore all stadiums with detailed seating arrangements and zone configurations.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>{error}</span>
              <RetryButton />
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        {stadiums.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Stadium Management</h3>
                <Badge variant="secondary">{stadiums.length} stadiums</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpandAll(true)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpandAll(false)}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Collapse All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stadiums Grid */}
        {stadiums.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {stadiums.map((stadium) => (
              <Card 
                key={stadium._id} 
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden"
              >
                {/* Stadium Image */}
                <div className="relative overflow-hidden">
                  {stadium.imageUrl ? (
                    <img
                      src={stadium.imageUrl}
                      alt={stadium.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop';
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <Building className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-slate-700 shadow-lg">
                      <Users className="w-3 h-3 mr-1" />
                      {stadium.totalSeats} seats
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-blue-500/90 text-white shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Stadium
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {stadium.name}
                      </CardTitle>
                      {stadium.location?.address && (
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-2 text-green-500" />
                          {stadium.location.latitude && stadium.location.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors flex items-center gap-1"
                            >
                              {stadium.location.address}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span>{stadium.location.address}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stadium Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stadium.zones?.length || 0}
                      </div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">Zones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stadium.totalSeats || 0}</div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">Total Seats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stadium.zones?.length > 0 ? 
                          `₹${Math.min(...stadium.zones.map(z => z.price || 0))}` : 
                          '₹0'
                        }
                      </div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">From</div>
                    </div>
                  </div>

                  {/* Zone Configuration */}
                  {stadium.zones && stadium.zones.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Grid3X3 className="w-4 h-4" />
                          Zone Configuration
                        </h4>
                        <Tabs value={zoneView} onValueChange={setZoneView} className="w-auto">
                          <TabsList className="grid w-full grid-cols-3 bg-white/50">
                            <TabsTrigger value="grid" className="text-xs">
                              <Grid3X3 className="w-3 h-3 mr-1" />
                              Grid
                            </TabsTrigger>
                            <TabsTrigger value="list" className="text-xs">
                              <List className="w-3 h-3 mr-1" />
                              List
                            </TabsTrigger>
                            <TabsTrigger value="visual" className="text-xs">
                              <Maximize2 className="w-3 h-3 mr-1" />
                              Visual
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <Accordion type="multiple" className="space-y-2">
                        {stadium.zones.map((zone, i) => {
                          const key = `${stadium._id}_${i}`;
                          const isOpen = expandedZone[key];
                          const zoneName = getZoneName(i);

                          return (
                            <AccordionItem 
                              key={i} 
                              value={`zone-${i}`}
                              className="border border-slate-200 rounded-lg overflow-hidden bg-white/50"
                            >
                              <AccordionTrigger 
                                className="px-4 py-3 hover:bg-slate-50/50 transition-colors [&[data-state=open]>svg]:rotate-180"
                                onClick={() => toggleZone(stadium._id, i)}
                              >
                                <div className="flex items-center justify-between w-full mr-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {zoneName}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-900">Zone {zoneName}</div>
                                      <div className="text-sm text-slate-600">
                                        {zone.seatLabels?.length || 0} seats
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                      <IndianRupee className="w-3 h-3 mr-1" />
                                      {zone.price || 0}
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-3">
                                  {zone.seatLabels && zone.seatLabels.length > 0 && (
                                    <>
                                      <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span>
                                          Seat Range: {zone.seatLabels[0]} - {zone.seatLabels[zone.seatLabels.length - 1]}
                                        </span>
                                        <span>Price per seat: ₹{zone.price || 0}</span>
                                      </div>
                                      
                                      {zoneView === "grid" && renderSeatsGrid(zone.seatLabels)}
                                      {zoneView === "list" && renderSeatsList(zone.seatLabels)}
                                      {zoneView === "visual" && renderSeatsVisual(zone, i)}
                                    </>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <Link to={`/admin/editstadium/${stadium._id}`}>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Stadium
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {stadiums.length === 0 && !loading && !error && (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <Building className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No stadiums found</h3>
            <p className="text-slate-600 mb-6">
              There are currently no stadiums available to display.
            </p>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              Add New Stadium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStadiums;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// const ViewStadiums = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const [expandedZone, setExpandedZone] = useState({});
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchStadiums = async () => {
//       try {
//         const res = await axios.get("/admin/stadiums", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setStadiums(res.data);
//       } catch (err) {
//         console.error("Error fetching stadiums:", err);
//       }
//     };
//     fetchStadiums();
//   }, [token]);

//   const toggleZone = (stadiumId, zoneIndex) => {
//     const key = `${stadiumId}_${zoneIndex}`;
//     setExpandedZone((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const handleExpandAll = (expand) => {
//     const newState = {};
//     stadiums.forEach((stadium) => {
//       stadium.zones.forEach((_, i) => {
//         const key = `${stadium._id}_${i}`;
//         newState[key] = expand;
//       });
//     });
//     setExpandedZone(newState);
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">All Stadiums</h2>

//       <div className="text-end mb-3">
//         <button
//           className="btn btn-outline-secondary me-2"
//           onClick={() => handleExpandAll(true)}
//         >
//           Expand All
//         </button>
//         <button
//           className="btn btn-outline-secondary"
//           onClick={() => handleExpandAll(false)}
//         >
//           Collapse All
//         </button>
//       </div>

//       <div className="row">
//         {stadiums.map((stadium) => (
//           <div className="col-md-6 mb-4" key={stadium._id}>
//             <div className="card shadow-sm h-100">
//               {stadium.imageUrl && (
//                 <img
//                   src={stadium.imageUrl}
//                   alt={stadium.name}
//                   className="card-img-top"
//                   style={{ height: "250px", objectFit: "cover" }}
//                 />
//               )}
//               <div className="card-body">
//                 <h5 className="card-title">{stadium.name}</h5>
//                 <p>
//                   <strong>Address:</strong>{" "}
//                   <a
//                     href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {stadium.location?.address}
//                   </a>
//                 </p>
//                 <p>
//                   <strong>Total Seats:</strong> {stadium.totalSeats}
//                 </p>

//                 <strong>Zones:</strong>
//                 <div className="mt-2">
//                   {stadium.zones.map((zone, i) => {
//                     const key = `${stadium._id}_${i}`;
//                     const isOpen = expandedZone[key];
//                     const zoneName = String.fromCharCode(65 + i);
//                     return (
//                       <div key={key} className="mb-2">
//                         <button
//                           className="btn btn-outline-primary btn-sm w-100 text-start"
//                           onClick={() => toggleZone(stadium._id, i)}
//                         >
//                           {isOpen ? "▼" : "▶"} Zone {zoneName}{" "}
//                           {zone.price && ` - ₹${zone.price}`}
//                         </button>

//                         {isOpen && (
//                           <div className="mt-2 p-2 border rounded bg-light">
//                             <p className="text-muted mb-2">
//                               Total Seats: {zone.seatLabels.length}
//                             </p>
//                             <div
//                               style={{
//                                 display: "grid",
//                                 gridTemplateColumns: "repeat(10, 1fr)",
//                                 gap: "6px",
//                               }}
//                             >
//                               {zone.seatLabels.map((seat, idx) => (
//                                 <div
//                                   key={idx}
//                                   style={{
//                                     backgroundColor: "#e6f0ff",
//                                     padding: "6px",
//                                     textAlign: "center",
//                                     borderRadius: "4px",
//                                     fontSize: "14px",
//                                     fontWeight: "500",
//                                     border: "1px solid #cce",
//                                   }}
//                                 >
//                                   {seat}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//                      <Link to={`/admin/editstadium/${stadium._id}`} className="btn btn-warning">
//                          Edit
//                       </Link>
//               </div>
//             </div>
//           </div>
//         ))}

//       </div>
//     </div>
//   );
// };

// export default ViewStadiums;




