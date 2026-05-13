import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

// --- POLYFILLS FOR DENO 2.0 COMPATIBILITY ---
// The smtp library (v0.7.0) uses deprecated Deno APIs removed in newer versions.
if (!(Deno as any).writeAll) {
  (Deno as any).writeAll = async (w: any, arr: Uint8Array) => {
    let nwritten = 0;
    while (nwritten < arr.length) {
      const n = await w.write(arr.subarray(nwritten));
      if (n === null) break;
      nwritten += n;
    }
  };
}
// --------------------------------------------

const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com'
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME')
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload))
    
    const { record } = payload
    if (!record) throw new Error('No record found in payload')

    const ticketId = record.id
    const message = record.message
    const createdAt = new Date(record.created_at).toLocaleString()

    console.log(`Attempting to send email via ${SMTP_HOSTNAME}:${SMTP_PORT}...`)
    const client = new SmtpClient();

    try {
      await client.connectTLS({
        hostname: SMTP_HOSTNAME,
        port: SMTP_PORT,
        username: SMTP_USERNAME,
        password: SMTP_PASSWORD,
      });
      console.log('SMTP connected successfully');
    } catch (connErr) {
      console.error('SMTP Connection Error:', connErr.message);
      throw new Error(`Failed to connect to SMTP server: ${connErr.message}`);
    }

    try {
      await client.send({
        from: "magukevin439@gmail.com", // The Bot (magukevin439)
        to: "kevomagunas439@gmail.com",   // The Receiver (kevomagunas439)
        subject: `Bingwa Support: New Ticket [${ticketId.substring(0, 8)}]`,
        content: `
New Support Request Received:

Ticket ID: ${ticketId}
Date: ${createdAt}

Message:
"${message}"

---
This is an automated notification from BingwaShambani Bot.
        `,
      });
      console.log('Email sent successfully');
    } catch (sendErr) {
      console.error('SMTP Send Error:', sendErr.message);
      throw new Error(`Failed to send email: ${sendErr.message}`);
    } finally {
      try {
        await client.close();
      } catch (closeErr) {
        // Ignore close errors
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Notify-support Logic Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
