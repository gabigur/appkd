import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, CheckCircle2, Clock, Truck } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "in_progress", label: "In Progress", icon: Clock },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get("id")) {
      fetchOrder(searchParams.get("id")!);
    }
  }, [searchParams]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("key_orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setOrder(data);
    setLoading(false);
  };

  const getStepIndex = (status: string) => statusSteps.findIndex(s => s.key === status);

  return (
    <MobileLayout title="Track Order" showBack>
      <div className="px-5 pt-5">
        {/* Search */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter order ID..."
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => fetchOrder(orderId)} disabled={!orderId || loading} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {loading && <p className="text-center text-muted-foreground py-8">Loading...</p>}

        {!loading && searched && !order && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Order not found</p>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">{order.property_address}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {order.order_type.replace("_", " ")} • Placed {new Date(order.created_at).toLocaleDateString()}
                </p>

                {/* Progress */}
                <div className="space-y-0">
                  {statusSteps.map((step, i) => {
                    const currentIdx = getStepIndex(order.status);
                    const done = i <= currentIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div className={`w-0.5 h-8 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default TrackOrder;
