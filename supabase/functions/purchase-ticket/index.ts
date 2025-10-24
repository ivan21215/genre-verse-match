import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const purchaseSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 tickets per purchase'),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PURCHASE-TICKET] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const validation = purchaseSchema.safeParse(body);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }
    const { ticket_id, quantity } = validation.data;
    logStep("Ticket purchase requested", { ticket_id, quantity });

    // Get ticket details
    const { data: ticketData, error: ticketError } = await supabaseClient
      .from('event_tickets')
      .select(`
        *,
        events!inner(
          id,
          title,
          event_date,
          start_time,
          venues!inner(name, address)
        )
      `)
      .eq('id', ticket_id)
      .single();

    if (ticketError || !ticketData) {
      throw new Error(`Ticket not found: ${ticket_id}`);
    }
    logStep("Ticket data retrieved", { 
      ticketType: ticketData.ticket_type, 
      price: ticketData.price,
      eventTitle: ticketData.events.title 
    });

    // Check availability
    if (ticketData.quantity_available && 
        (ticketData.quantity_available - ticketData.quantity_sold) < quantity) {
      throw new Error("Not enough tickets available");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    const totalAmount = ticketData.price * quantity;
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${ticketData.ticket_type} - ${ticketData.events.title}`,
              description: `Event: ${ticketData.events.title} on ${new Date(ticketData.events.event_date).toLocaleDateString()}`
            },
            unit_amount: ticketData.price,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/events/${ticketData.events.id}?ticket_success=true`,
      cancel_url: `${origin}/events/${ticketData.events.id}?ticket_canceled=true`,
    });

    // Create pending purchase record
    await supabaseClient.from("ticket_purchases").insert({
      user_id: user.id,
      event_id: ticketData.events.id,
      ticket_id: ticket_id,
      quantity: quantity,
      total_amount: totalAmount,
      stripe_session_id: session.id,
      status: 'pending'
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in purchase-ticket", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});