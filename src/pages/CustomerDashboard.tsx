import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Search, Upload, Clock, KeyRound, ChevronRight } from "lucide-react";

const quickActions = [
  { icon: Package, label: "Track Order", path: "/track-order", color: "bg-primary/10 text-primary" },
  { icon: Search, label: "Property Lookup", path: "/property-lookup", color: "bg-accent/10 text-accent" },
  { icon: Upload, label: "Upload Docs", path: "/documents/upload", color: "bg-info/10 text-blue-500" },
  { icon: Clock, label: "Order History", path: "/orders", color: "bg-warning/10 text-amber-500" },
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");

      const { data: orders } = await supabase
        .from("key_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (orders) setRecentOrders(orders);
    };
    loadData();
  }, [navigate]);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-accent/10 text-accent";
      case "in_progress": return "bg-blue-50 text-blue-600";
      case "pending": return "bg-amber-50 text-amber-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <MobileLayout>
      {/* Greeting */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-muted-foreground text-sm">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},</p>
        <h1 className="text-2xl font-bold text-foreground">{userName || "there"} 👋</h1>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ icon: Icon, label, path, color }) => (
            <Card key={path} className="cursor-pointer active:scale-[0.98] transition-transform border-0 shadow-sm" onClick={() => navigate(path)}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          <button className="text-sm text-primary font-medium" onClick={() => navigate("/orders")}>
            View all
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <KeyRound className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Your key orders will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Card key={order.id} className="cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/track-order?id=${order.id}`)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{order.property_address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default CustomerDashboard;
