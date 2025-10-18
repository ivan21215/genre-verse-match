import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailRequest = await req.json();
    console.log("Received auth email request:", payload.email_data.email_action_type);

    const { user, email_data } = payload;
    const { token_hash, redirect_to, email_action_type } = email_data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const confirmLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    let subject = "";
    let htmlContent = "";

    if (email_action_type === "signup") {
      subject = "Welcome! Confirm your email";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">Welcome!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up! Please confirm your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Confirm Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${confirmLink}" style="color: #10b981;">${confirmLink}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      `;
    } else if (email_action_type === "recovery") {
      subject = "Reset your password";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">Reset your password</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${confirmLink}" style="color: #10b981;">${confirmLink}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `;
    } else {
      subject = "Email verification";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">Verify your email</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${confirmLink}" style="color: #10b981;">${confirmLink}</a>
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Venue Discovery <onboarding@resend.dev>",
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
