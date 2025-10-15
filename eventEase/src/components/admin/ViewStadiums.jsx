import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Users, ExternalLink, Edit, Eye, X, Search, ChevronDown } from "lucide-react";

const ViewStadiums = () => {
  const [stadiums, setStadiums] = useState([]);
  const [filteredStadiums, setFilteredStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [expandedZones, setExpandedZones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneView, setZoneView] = useState("grid");
  const token = localStorage.getItem("token");

  // Filter states
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterName, setFilterName] = useState("");

  // Fetch stadiums from API
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
        setStadiums(res.data || []);
      } catch (err) {
        console.error("Error fetching stadiums:", err);
        setError(
          err.response?.data?.message || "Failed to load stadiums. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStadiums();
    }
  }, [token]);

  // Get unique states and cities from stadiums
  const uniqueStates = useMemo(() => {
    return [...new Set(stadiums.map((s) => s.location?.state).filter(Boolean))];
  }, [stadiums]);

  const uniqueCities = useMemo(() => {
    if (filterState) {
      return [
        ...new Set(
          stadiums
            .filter((s) => s.location?.state === filterState)
            .map((s) => s.location?.city)
            .filter(Boolean)
        ),
      ];
    }
    return [...new Set(stadiums.map((s) => s.location?.city).filter(Boolean))];
  }, [stadiums, filterState]);

  // Apply filters
  useEffect(() => {
    let result = stadiums;

    if (filterState) {
      result = result.filter((s) => s.location?.state === filterState);
    }

    if (filterCity) {
      result = result.filter((s) => s.location?.city === filterCity);
    }

    if (filterName) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    setFilteredStadiums(result);
  }, [filterState, filterCity, filterName, stadiums]);

  const toggleZone = (zoneIndex) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneIndex]: !prev[zoneIndex],
    }));
  };

  const handleExpandAll = (expand) => {
    const newState = {};
    selectedStadium?.zones?.forEach((_, i) => {
      newState[i] = expand;
    });
    setExpandedZones(newState);
  };

  const getZoneName = (index) => String.fromCharCode(65 + index);

  const handleClearFilters = () => {
    setFilterState("");
    setFilterCity("");
    setFilterName("");
  };

  const renderSeatsGrid = (seats) => (
    <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded border">
      {seats.map((seat, idx) => (
        <div
          key={idx}
          className="bg-blue-100 hover:bg-blue-200 p-1 text-center rounded text-xs font-medium border border-blue-200"
        >
          {seat}
        </div>
      ))}
    </div>
  );

  const renderSeatsList = (seats) => (
    <div className="max-h-32 overflow-y-auto p-3 bg-slate-50 rounded border">
      <div className="flex flex-wrap gap-2">
        {seats.map((seat, idx) => (
          <span
            key={idx}
            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-200"
          >
            {seat}
          </span>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center text-slate-900 mb-4">
            Stadium Overview
          </h1>
          <div className="text-center text-slate-600">Loading stadiums...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-2">Stadium Overview</h1>
          <p className="text-lg text-slate-600">Browse and manage all stadiums</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 max-w-4xl mx-auto">
            ⚠️ {error}
          </div>
        )}

        {/* Filters Section */}
        {stadiums.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Filter Stadiums
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Stadium Name Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-2">
                  Stadium Name
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* State Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-2">
                  State
                </label>
                <select
                  value={filterState}
                  onChange={(e) => {
                    setFilterState(e.target.value);
                    setFilterCity("");
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  {uniqueStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-2">
                  City
                </label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  disabled={!filterState}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Button */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filterState || filterCity || filterName) && (
              <div className="flex flex-wrap gap-2">
                {filterName && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Name: {filterName}
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-blue-900"
                      onClick={() => setFilterName("")}
                    />
                  </span>
                )}
                {filterState && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    State: {filterState}
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-green-900"
                      onClick={() => {
                        setFilterState("");
                        setFilterCity("");
                      }}
                    />
                  </span>
                )}
                {filterCity && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    City: {filterCity}
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-purple-900"
                      onClick={() => setFilterCity("")}
                    />
                  </span>
                )}
              </div>
            )}

            <div className="mt-4 text-sm text-slate-600">
              Showing <strong>{filteredStadiums.length}</strong> of{" "}
              <strong>{stadiums.length}</strong> stadiums
            </div>
          </div>
        )}

        {/* Stadium Cards - Summary View */}
        {filteredStadiums.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredStadiums.map((stadium) => (
              <div
                key={stadium._id}
                onClick={() => setSelectedStadium(stadium)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer group border border-slate-100"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img
                    src={stadium.imageUrl || "https://via.placeholder.com/500x300?text=Stadium"}
                    alt={stadium.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/500x300?text=No+Image";
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-sm font-semibold">
                    <Users className="w-4 h-4 text-blue-600" />
                    {stadium.totalSeats} seats
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {stadium.name}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{stadium.location?.city}</p>
                      <p className="text-xs">{stadium.location?.state}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStadium(stadium);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredStadiums.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              📍
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No stadiums found</h3>
            <p className="text-slate-600">
              {stadiums.length === 0
                ? "There are currently no stadiums available."
                : "No stadiums match your filter criteria."}
            </p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedStadium && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
              {/* Modal Header with Image */}
              <div className="relative">
                <img
                  src={selectedStadium.imageUrl || "https://via.placeholder.com/800x300?text=Stadium"}
                  alt={selectedStadium.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x300?text=No+Image";
                  }}
                />
                <button
                  onClick={() => setSelectedStadium(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-900 rounded-full p-2 transition-all shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <h2 className="text-4xl font-bold text-slate-900 mb-2">
                  {selectedStadium.name}
                </h2>

                {/* Location */}
                <div className="flex items-center gap-2 text-slate-600 mb-6">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <span>{selectedStadium.location?.address}</span>
                  {selectedStadium.location?.latitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedStadium.location.latitude},${selectedStadium.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 ml-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Maps
                    </a>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedStadium.zones?.length || 0}
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-wide mt-1">
                      Zones
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedStadium.totalSeats || 0}
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-wide mt-1">
                      Total Seats
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      ₹
                      {selectedStadium.zones?.length > 0
                        ? Math.min(
                            ...selectedStadium.zones.map((z) => z.price || 0)
                          )
                        : 0}
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-wide mt-1">
                      From
                    </div>
                  </div>
                </div>

                {/* Zone Configuration */}
                {selectedStadium.zones && selectedStadium.zones.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900">
                        Zone Configuration
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExpandAll(true)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          Expand All
                        </button>
                        <button
                          onClick={() => handleExpandAll(false)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    {/* View Type Tabs */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setZoneView("grid")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          zoneView === "grid"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Grid View
                      </button>
                      <button
                        onClick={() => setZoneView("list")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          zoneView === "list"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        List View
                      </button>
                    </div>

                    {/* Zones */}
                    <div className="space-y-3">
                      {selectedStadium.zones.map((zone, i) => (
                        <div
                          key={i}
                          className="border border-slate-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleZone(i)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {getZoneName(i)}
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-slate-900">
                                  Zone {getZoneName(i)}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {zone.seatLabels?.length || 0} seats
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                ₹{zone.price || 0}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition-transform ${
                                  expandedZones[i] ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {/* Zone Details */}
                          {expandedZones[i] && zone.seatLabels && (
                            <div className="p-4 border-t border-slate-200 bg-white">
                              <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                <span>
                                  Seat Range: {zone.seatLabels[0]} -{" "}
                                  {zone.seatLabels[zone.seatLabels.length - 1]}
                                </span>
                                <span>Price per seat: ₹{zone.price || 0}</span>
                              </div>

                              {zoneView === "grid" && renderSeatsGrid(zone.seatLabels)}
                              {zoneView === "list" && renderSeatsList(zone.seatLabels)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Button */}
                <Link to={`/editstadium/${selectedStadium._id}`}>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Edit className="w-5 h-5" />
                    Edit Stadium
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStadiums;


// import React, { useEffect, useState } from "react";
// import axios from "axios"; // Uncommented for API usage
// import { Link } from "react-router-dom"; // Uncommented for navigation
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   MapPin,
//   Users,
//   ExternalLink,
//   Edit,
//   Eye,
//   EyeOff,
//   ChevronDown,
//   ChevronRight,
//   Building,
//   Grid3X3,
//   List,
//   Maximize2,
//   Star,
//   IndianRupee,
//   AlertTriangle,
// } from "lucide-react";

// const ViewStadiums = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const [expandedZone, setExpandedZone] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [zoneView, setZoneView] = useState("grid"); // grid, list, or visual
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchStadiums = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const res = await axios.get("/admin/stadiums", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
        
//         setStadiums(res.data);
//       } catch (err) {
//         console.error("Error fetching stadiums:", err);
//         setError(
//           err.response?.data?.message || 
//           err.message || 
//           "Failed to load stadiums. Please check your connection and try again."
//         );
//       } finally {
//         setLoading(false);
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

//   const getZoneName = (index) => String.fromCharCode(65 + index);

//   const renderSeatsGrid = (seats) => (
//     <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border">
//       {seats.map((seat, idx) => (
//         <div
//           key={idx}
//           className="bg-blue-100 hover:bg-blue-200 transition-colors p-1.5 text-center rounded text-xs font-medium border border-blue-200 cursor-pointer"
//         >
//           {seat}
//         </div>
//       ))}
//     </div>
//   );

//   const renderSeatsList = (seats) => (
//     <div className="max-h-32 overflow-y-auto p-3 bg-slate-50 rounded-lg border">
//       <div className="flex flex-wrap gap-1">
//         {seats.map((seat, idx) => (
//           <Badge key={idx} variant="outline" className="text-xs">
//             {seat}
//           </Badge>
//         ))}
//       </div>
//     </div>
//   );

//   const renderSeatsVisual = (zone, zoneIndex) => (
//     <div className="p-4 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg border">
//       <div className="text-center mb-3">
//         <div className="inline-block px-4 py-2 bg-slate-800 text-white rounded-full text-sm font-medium">
//           🎭 STAGE
//         </div>
//       </div>
//       <div className="space-y-2">
//         {[...Array(Math.ceil(zone.seatLabels.length / 10))].map((_, rowIndex) => {
//           const rowSeats = zone.seatLabels.slice(rowIndex * 10, (rowIndex + 1) * 10);
//           return (
//             <div key={rowIndex} className="flex justify-center gap-1">
//               {rowSeats.map((seat, seatIndex) => (
//                 <div
//                   key={seatIndex}
//                   className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-t-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors"
//                   title={seat}
//                 >
//                   💺
//                 </div>
//               ))}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   const LoadingSkeleton = () => (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {[1, 2, 3, 4].map((i) => (
//         <Card key={i}>
//           <Skeleton className="h-64 w-full rounded-t-lg" />
//           <CardHeader>
//             <Skeleton className="h-6 w-3/4" />
//             <Skeleton className="h-4 w-1/2" />
//           </CardHeader>
//           <CardContent>
//             <Skeleton className="h-20 w-full" />
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );

//   const RetryButton = () => (
//     <Button 
//       variant="outline" 
//       onClick={() => window.location.reload()}
//       className="border-blue-200 text-blue-600 hover:bg-blue-50"
//     >
//       Try Again
//     </Button>
//   );

//   if (loading) return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//             Stadium Overview
//           </h1>
//           <p className="text-lg text-slate-600">Loading stadiums...</p>
//         </div>
//         <LoadingSkeleton />
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//             Stadium Overview
//           </h1>
//           <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
//             Manage and explore all stadiums with detailed seating arrangements and zone configurations.
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <Alert className="mb-8 border-red-200 bg-red-50 max-w-2xl mx-auto">
//             <AlertTriangle className="h-4 w-4" />
//             <AlertDescription className="text-red-800 flex items-center justify-between">
//               <span>{error}</span>
//               <RetryButton />
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Controls */}
//         {stadiums.length > 0 && (
//           <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Building className="w-5 h-5 text-blue-600" />
//                 <h3 className="text-lg font-semibold text-slate-900">Stadium Management</h3>
//                 <Badge variant="secondary">{stadiums.length} stadiums</Badge>
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleExpandAll(true)}
//                   className="border-blue-200 text-blue-600 hover:bg-blue-50"
//                 >
//                   <Eye className="w-4 h-4 mr-1" />
//                   Expand All
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleExpandAll(false)}
//                   className="border-slate-200 text-slate-600 hover:bg-slate-50"
//                 >
//                   <EyeOff className="w-4 h-4 mr-1" />
//                   Collapse All
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stadiums Grid */}
//         {stadiums.length > 0 && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {stadiums.map((stadium) => (
//               <Card 
//                 key={stadium._id} 
//                 className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden"
//               >
//                 {/* Stadium Image */}
//                 <div className="relative overflow-hidden">
//                   {stadium.imageUrl ? (
//                     <img
//                       src={stadium.imageUrl}
//                       alt={stadium.name}
//                       className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
//                       onError={(e) => {
//                         e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop';
//                       }}
//                     />
//                   ) : (
//                     <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
//                       <Building className="w-16 h-16 text-slate-400" />
//                     </div>
//                   )}
//                   <div className="absolute top-4 right-4">
//                     <Badge className="bg-white/90 text-slate-700 shadow-lg">
//                       <Users className="w-3 h-3 mr-1" />
//                       {stadium.totalSeats} seats
//                     </Badge>
//                   </div>
//                   <div className="absolute top-4 left-4">
//                     <Badge variant="secondary" className="bg-blue-500/90 text-white shadow-lg">
//                       <Star className="w-3 h-3 mr-1" />
//                       Stadium
//                     </Badge>
//                   </div>
//                 </div>

//                 <CardHeader className="pb-4">
//                   <div className="flex items-start justify-between">
//                     <div className="space-y-2">
//                       <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
//                         {stadium.name}
//                       </CardTitle>
//                       {stadium.location?.address && (
//                         <div className="flex items-center text-sm text-slate-600">
//                           <MapPin className="w-4 h-4 mr-2 text-green-500" />
//                           {stadium.location.latitude && stadium.location.longitude ? (
//                             <a
//                               href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="hover:text-blue-600 transition-colors flex items-center gap-1"
//                             >
//                               {stadium.location.address}
//                               <ExternalLink className="w-3 h-3" />
//                             </a>
//                           ) : (
//                             <span>{stadium.location.address}</span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-6">
//                   {/* Stadium Stats */}
//                   <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-blue-600">
//                         {stadium.zones?.length || 0}
//                       </div>
//                       <div className="text-xs text-slate-600 uppercase tracking-wide">Zones</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-green-600">{stadium.totalSeats || 0}</div>
//                       <div className="text-xs text-slate-600 uppercase tracking-wide">Total Seats</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-purple-600">
//                         {stadium.zones?.length > 0 ? 
//                           `₹${Math.min(...stadium.zones.map(z => z.price || 0))}` : 
//                           '₹0'
//                         }
//                       </div>
//                       <div className="text-xs text-slate-600 uppercase tracking-wide">From</div>
//                     </div>
//                   </div>

//                   {/* Zone Configuration */}
//                   {stadium.zones && stadium.zones.length > 0 && (
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
//                           <Grid3X3 className="w-4 h-4" />
//                           Zone Configuration
//                         </h4>
//                         <Tabs value={zoneView} onValueChange={setZoneView} className="w-auto">
//                           <TabsList className="grid w-full grid-cols-3 bg-white/50">
//                             <TabsTrigger value="grid" className="text-xs">
//                               <Grid3X3 className="w-3 h-3 mr-1" />
//                               Grid
//                             </TabsTrigger>
//                             <TabsTrigger value="list" className="text-xs">
//                               <List className="w-3 h-3 mr-1" />
//                               List
//                             </TabsTrigger>
//                             <TabsTrigger value="visual" className="text-xs">
//                               <Maximize2 className="w-3 h-3 mr-1" />
//                               Visual
//                             </TabsTrigger>
//                           </TabsList>
//                         </Tabs>
//                       </div>

//                       <Accordion type="multiple" className="space-y-2">
//                         {stadium.zones.map((zone, i) => {
//                           const key = `${stadium._id}_${i}`;
//                           const isOpen = expandedZone[key];
//                           const zoneName = getZoneName(i);

//                           return (
//                             <AccordionItem 
//                               key={i} 
//                               value={`zone-${i}`}
//                               className="border border-slate-200 rounded-lg overflow-hidden bg-white/50"
//                             >
//                               <AccordionTrigger 
//                                 className="px-4 py-3 hover:bg-slate-50/50 transition-colors [&[data-state=open]>svg]:rotate-180"
//                                 onClick={() => toggleZone(stadium._id, i)}
//                               >
//                                 <div className="flex items-center justify-between w-full mr-4">
//                                   <div className="flex items-center gap-3">
//                                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                       {zoneName}
//                                     </div>
//                                     <div>
//                                       <div className="font-semibold text-slate-900">Zone {zoneName}</div>
//                                       <div className="text-sm text-slate-600">
//                                         {zone.seatLabels?.length || 0} seats
//                                       </div>
//                                     </div>
//                                   </div>
//                                   <div className="flex items-center gap-2">
//                                     <Badge variant="outline" className="text-green-600 border-green-200">
//                                       <IndianRupee className="w-3 h-3 mr-1" />
//                                       {zone.price || 0}
//                                     </Badge>
//                                   </div>
//                                 </div>
//                               </AccordionTrigger>
                              
//                               <AccordionContent className="px-4 pb-4">
//                                 <div className="space-y-3">
//                                   {zone.seatLabels && zone.seatLabels.length > 0 && (
//                                     <>
//                                       <div className="flex items-center justify-between text-sm text-slate-600">
//                                         <span>
//                                           Seat Range: {zone.seatLabels[0]} - {zone.seatLabels[zone.seatLabels.length - 1]}
//                                         </span>
//                                         <span>Price per seat: ₹{zone.price || 0}</span>
//                                       </div>
                                      
//                                       {zoneView === "grid" && renderSeatsGrid(zone.seatLabels)}
//                                       {zoneView === "list" && renderSeatsList(zone.seatLabels)}
//                                       {zoneView === "visual" && renderSeatsVisual(zone, i)}
//                                     </>
//                                   )}
//                                 </div>
//                               </AccordionContent>
//                             </AccordionItem>
//                           );
//                         })}
//                       </Accordion>
//                     </div>
//                   )}

//                   {/* Action Button */}
//                   <div className="pt-4 border-t border-slate-100">
//                     <Link to={`/editstadium/${stadium._id}`}>
//                       <Button 
//                         className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
//                       >
//                         <Edit className="w-4 h-4 mr-2" />
//                         Edit Stadium
//                       </Button>
//                     </Link>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Empty State */}
//         {stadiums.length === 0 && !loading && !error && (
//           <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
//             <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
//               <Building className="w-12 h-12 text-blue-500" />
//             </div>
//             <h3 className="text-xl font-semibold text-slate-900 mb-2">No stadiums found</h3>
//             <p className="text-slate-600 mb-6">
//               There are currently no stadiums available to display.
//             </p>
//             <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
//               Add New Stadium
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewStadiums;






