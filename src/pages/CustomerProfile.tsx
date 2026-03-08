import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Save, User } from "lucide-react";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("customer_profiles")
      .update({ full_name: fullName, phone, address })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0]?.toUpperCase() || "?";

  if (loading) return <MobileLayout title="Profile"><div className="p-5"><div className="h-40 bg-muted rounded-xl animate-pulse" /></div></MobileLayout>;

  return (
    <MobileLayout title="Profile">
      <div className="px-5 pt-5 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" type="tel" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full text-destructive border-destructive/20" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
};

export default CustomerProfile;
