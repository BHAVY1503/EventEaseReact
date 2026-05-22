import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchStadiums } from "../../features/stadiums/stadiumsSlice";
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
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectStadium as selectStadiumAction } from "../../features/stadiums/stadiumsSlice";
import '../../styles/components/StadiumSelector.css';

export const StadiumSelector = () => {
  const dispatch = useAppDispatch();
  const { list: stadiums, status, error } = useAppSelector((s) => s.stadiums);
  const selectedStadium = useAppSelector((s) => s.stadiums.selectedStadium);

  const navigate = useNavigate();
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const queryParams = new URLSearchParams(location.search);
  const role = localStorage.getItem("role");

  // Get the redirect URL from query params
  const redirectTo = queryParams.get("redirectTo");

  useEffect(() => {
    if (!token) return; // auth handled elsewhere
    dispatch(fetchStadiums());
  }, [token, dispatch]);

  const selectStadium = (stadium) => {
    try {
      // Persist for legacy code that reads from localStorage
      localStorage.setItem("selectedStadium", JSON.stringify(stadium));
      localStorage.setItem("selectedCategory", "Indoor");

      // keep in redux for app-wide access
      dispatch(selectStadiumAction(stadium));

      // Navigate to redirect or default location
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        if (role === "Organizer") {
          navigate("/organizer/addevent");
        } else if (role === "Admin") {
          navigate("/admin/addevent");
        } else {
          navigate("/organizer");
        }
      }
    } catch (error) {
      console.error("Error selecting stadium:", error);
      alert("Failed to select stadium. Please try again.");
    }
  };

  if (status === 'loading') {
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

  if (status === 'failed') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-red-600">Failed to load stadiums</h2>
        <p className="text-gray-600 dark:text-gray-400">{error || 'Please try again later.'}</p>
        <div className="mt-6">
          <Button onClick={() => dispatch(fetchStadiums())}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="stadium-selector-container bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="selector-header">
        <div className="selector-icon-wrapper">
          <div className="selector-icon-glow">
            <div className="selector-icon-glow-blur"></div>
            <div className="selector-icon-content">
              <Building className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
        <h1 className="selector-title">
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
        <div className="stadium-grid">
          {stadiums.map((stadium) => (
            <Card
              key={stadium._id}
              className="stadium-card group"
            >
              <div className="stadium-img-wrapper">
                {stadium.imageUrl ? (
                  <img
                    src={stadium.imageUrl}
                    alt={stadium.name}
                    className="stadium-img"
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













