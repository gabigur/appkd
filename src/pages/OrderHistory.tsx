import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Package } from "lucide-react";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("key_orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-accent/10 text-accent";
      case "in_progress": return "bg-blue-50 text-blue-600";
      case "pending": return "bg-amber-50 text-amber-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <MobileLayout title="Order History">
      <div className="px-5 pt-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Your key orders will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <Card key={order.id} className="cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/track-order?id=${order.id}`)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{order.property_address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.order_type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
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

export default OrderHistory;
