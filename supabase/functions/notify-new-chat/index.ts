import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get admin users with active email notifications
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from('admin_users')
      .select(`
        email,
        notification_settings!inner(
          email_notifications
        )
      `)
      .eq('notification_settings.email_notifications', true);

    if (adminError) throw adminError;

    // Send email to each admin
    for (const admin of adminUsers) {
      await supabaseClient.auth.admin.sendRawEmail({
        to: admin.email,
        subject: 'New Chat Session Started',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1D2A4D;">New Chat Session Started</h2>
            
            <p>A new chat session has been initiated:</p>
            
            <ul>
              <li><strong>Visitor Name:</strong> ${session.visitor_name || 'Anonymous'}</li>
              <li><strong>Visitor Email:</strong> ${session.visitor_email || 'Not provided'}</li>
              <li><strong>Started At:</strong> ${new Date(session.created_at).toLocaleString()}</li>
            </ul>
            
            <p>Please log in to the admin portal to respond to this chat session.</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>NEXIUS Labs - Chat Notification System</p>
            </div>
          </div>
        `,
      });
    }

    return new Response(
      JSON.stringify({ message: 'Notifications sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});