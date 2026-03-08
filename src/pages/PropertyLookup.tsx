import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Package } from "lucide-react";

const PropertyLookup = () => {
  const [address, setAddress] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("key_orders")
      .select("*")
      .ilike("property_address", `%${address}%`)
      .order("created_at", { ascending: false });
    setResults(data || []);
    setLoading(false);
  };

  return (
    <MobileLayout title="Property Lookup" showBack>
      <div className="px-5 pt-5">
        <p className="text-sm text-muted-foreground mb-4">Search for key orders by property address</p>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter address..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!address.trim() || loading} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {loading && <p className="text-center text-muted-foreground py-8">Searching...</p>}

        {!loading && searched && results.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No results found</p>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{order.property_address}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.order_type.replace("_", " ")} • {order.status.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default PropertyLookup;
