import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export const RefundNotificationBadge = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchPendingRefunds = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/tickets/alltickets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter pending refund requests
      const pending = res.data.data.filter(
        (t) => t.status === "Cancelled" && t.refundStatus === "Pending Approval"
      );

      setPendingCount(pending.length);
      
      // Get the 5 most recent requests
      const recent = pending
        .sort((a, b) => new Date(b.cancellationDate) - new Date(a.cancellationDate))
        .slice(0, 5);
      
      setRecentRequests(recent);
    } catch (err) {
      console.error("Error fetching pending refunds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRefunds();

    // Poll every 30 seconds for new requests
    const interval = setInterval(fetchPendingRefunds, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {pendingCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs border-2 border-white dark:border-gray-900 animate-pulse">
              {pendingCount > 9 ? "9+" : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Refund Requests
            </h3>
            {pendingCount > 0 && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : pendingCount === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No pending refund requests
              </p>
            </div>
          ) : (
            <>
              {recentRequests.map((ticket) => (
                <Link key={ticket._id} to="/refunds">
                  <DropdownMenuItem className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {ticket.userId?.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {ticket.eventId?.eventName || "Event"}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            ₹{ticket.refundAmount?.toLocaleString() || 0}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(ticket.cancellationDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}

              {pendingCount > 5 && (
                <>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <div className="px-4 py-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{pendingCount - 5} more pending requests
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {pendingCount > 0 && (
          <>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <div className="px-4 py-3">
              <Link to="/refunds">
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-sm">
                  View All Requests
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};