// components/admin/PendingEventsBadge.jsx
// Save this file and import it in AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const PendingEventsBadge = ({ onNavigate }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/event/groupedeventsbyorganizer", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let pending = [];
      res.data.data.forEach((group) => {
        group.events.forEach((event) => {
          if (event.approvalStatus === "Pending") {
            pending.push({
              ...event,
              organizerName: group.organizerName,
              organizerEmail: group.organizerEmail,
            });
          }
        });
      });

      // Sort by creation date (newest first)
      pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPendingEvents(pending);
      setPendingCount(pending.length);
    } catch (err) {
      console.error("Failed to fetch pending events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
    
    // Poll every 30 seconds for new events
    const interval = setInterval(fetchPendingEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-red-50 dark:hover:bg-gray-800"
          title={`${pendingCount} pending event${pendingCount !== 1 ? 's' : ''}`}
        >
          <Bell 
            className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${
              pendingCount > 0 ? "animate-pulse" : ""
            }`} 
          />
          {pendingCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-600 text-white h-5 min-w-[20px] flex items-center justify-center p-0 text-xs font-bold animate-pulse">
              {pendingCount > 99 ? "99+" : pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pending Approvals
          </h3>
          <p className="text-sm text-red-100 mt-1">
            {pendingCount} event{pendingCount !== 1 ? "s" : ""} awaiting your review
          </p>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          ) : pendingCount === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700 dark:text-gray-300">All caught up!</p>
              <p className="text-sm text-gray-400 mt-1">
                No pending events to review
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingEvents.slice(0, 5).map((event) => {
                const isNew = new Date() - new Date(event.createdAt) < 3600000; // Less than 1 hour old
                
                return (
                  <div
                    key={event._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => onNavigate && onNavigate("groupbyevent")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
                        {event.eventName}
                      </h4>
                      {isNew && (
                        <Badge className="ml-2 bg-green-600 text-white text-xs">
                          NEW
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.organizerName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {pendingEvents.length > 5 && (
                <div className="p-3 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800">
                  +{pendingEvents.length - 5} more event{pendingEvents.length - 5 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {pendingCount > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
            <Button
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white"
              size="sm"
              onClick={() => onNavigate && onNavigate("groupbyevent")}
            >
              Review All {pendingCount} Event{pendingCount !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PendingEventsBadge;