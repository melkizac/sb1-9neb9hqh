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
    const { to, firstName } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Send email using Supabase's built-in email service
    const { error } = await supabaseClient.auth.admin.sendRawEmail({
      to,
      subject: 'Thank You for Contacting NEXIUS Labs',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D2A4D;">Thank You for Reaching Out!</h2>
          
          <p>Dear ${firstName},</p>
          
          <p>Thank you for your interest in NEXIUS Labs. We're excited to learn more about your business and discuss how our AI solutions can help drive your growth and efficiency.</p>
          
          <p>One of our AI consultants will be in touch with you within the next 24-48 business hours to schedule a personalized consultation.</p>
          
          <p>In the meantime, you might find these resources helpful:</p>
          <ul>
            <li>Our AI Implementation Guide</li>
            <li>Case Studies</li>
            <li>Client Success Stories</li>
          </ul>
          
          <p>If you have any immediate questions, feel free to reply to this email.</p>
          
          <p>Best regards,<br>
          The NEXIUS Labs Team</p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>NEXIUS Labs - Empowering Business Growth Through AI</p>
          </div>
        </div>
      `,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
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