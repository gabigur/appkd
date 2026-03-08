import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      return new Response(
        JSON.stringify({ error: 'FCM server key not configured. Add FCM_SERVER_KEY secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all device tokens
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tokens, error: fetchError } = await supabase
      .from('device_tokens')
      .select('token');

    if (fetchError) throw fetchError;

    if (!tokens || tokens.length === 0) {
      // Still log the notification
      await supabase.from('notifications').insert({
        title,
        body,
        sent_count: 0,
        status: 'sent',
      });

      return new Response(
        JSON.stringify({ message: 'No devices registered', sent_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send to FCM (legacy HTTP API for simplicity)
    const registrationIds = tokens.map((t: any) => t.token);

    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        registration_ids: registrationIds,
        notification: {
          title,
          body,
          sound: 'default',
        },
        data: {
          title,
          body,
        },
      }),
    });

    const fcmResult = await fcmResponse.json();
    const sentCount = fcmResult.success || 0;

    // Log notification
    await supabase.from('notifications').insert({
      title,
      body,
      sent_count: sentCount,
      status: 'sent',
      data: { fcm_result: fcmResult },
    });

    return new Response(
      JSON.stringify({ 
        message: 'Notification sent', 
        sent_count: sentCount,
        failure_count: fcmResult.failure || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
