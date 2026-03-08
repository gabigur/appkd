import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Send, Users, History, LogOut, Loader2, Settings, User, UserPlus, Key } from 'lucide-react';
import { toast } from 'sonner';
import AdminAuth from '@/components/AdminAuth';
import type { Session } from '@supabase/supabase-js';

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Account management state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Create account state
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchData();
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session) return;
    const { data } = await supabase
      .from('admin_profiles')
      .select('username')
      .eq('user_id', session.user.id)
      .single();
    if (data) {
      setUsername(data.username);
      setNewUsername(data.username);
    }
  };

  const fetchData = async () => {
    const { count } = await supabase
      .from('device_tokens')
      .select('*', { count: 'exact', head: true });
    setDeviceCount(count || 0);

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || !session) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('admin_profiles')
      .update({ username: newUsername.trim() })
      .eq('user_id', session.user.id);
    if (error) {
      toast.error('Failed to update username');
    } else {
      setUsername(newUsername.trim());
      toast.success('Username updated');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      setNewPassword('');
    }
    setChangingPassword(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createPassword || !createUsername.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setCreating(true);

    // Use edge function to create account (so current session isn't affected)
    const response = await supabase.functions.invoke('create-admin', {
      body: { email: createEmail, password: createPassword, username: createUsername.trim() },
    });

    if (response.error || response.data?.error) {
      toast.error(response.data?.error || response.error?.message || 'Failed to create account');
    } else {
      toast.success(`Account created for ${createEmail}`);
      setCreateEmail('');
      setCreatePassword('');
      setCreateUsername('');
      setShowCreateDialog(false);
    }
    setCreating(false);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    setSending(true);
    try {
      const response = await supabase.functions.invoke('send-notification', {
        body: { title, body },
      });
      if (response.error) throw response.error;
      toast.success(`Notification sent to ${response.data?.sent_count || 0} devices`);
      setTitle('');
      setBody('');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to send: ' + (err.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <AdminAuth onAuthenticated={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">KeyDirect Notifications</h1>
              <p className="text-sm text-muted-foreground">Welcome, {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Admin Account</DialogTitle>
                  <DialogDescription>Create a new admin account for your team</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <Input
                    placeholder="Username"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <Button type="submit" disabled={creating} className="w-full">
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create Account
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered Devices</p>
              <p className="text-3xl font-bold">{deviceCount}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notifications Sent</p>
              <p className="text-3xl font-bold">{notifications.length}</p>
            </div>
          </div>
        </div>

        {/* Send Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Push Notification
            </CardTitle>
            <CardDescription>
              Compose and send a notification to all {deviceCount} registered devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input
                  placeholder="e.g. New Sale This Week!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Message</label>
                <Textarea
                  placeholder="e.g. Check out our latest deals on key programmers..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !title.trim() || !body.trim()}
                className="w-full h-12 text-base font-semibold"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to All Devices
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Username
              </label>
              <div className="flex gap-2">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-10"
                />
                <Button
                  onClick={handleUpdateUsername}
                  disabled={savingProfile || newUsername === username}
                  variant="secondary"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" /> Change Password
              </label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10"
                  minLength={6}
                />
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || newPassword.length < 6}
                  variant="secondary"
                >
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Signed in as {session.user.email}
            </p>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Notification History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No notifications sent yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.sent_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{n.sent_count} sent</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
