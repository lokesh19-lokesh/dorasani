/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseClient.ts';

const DEFAULT_RECIPIENT_EMAIL = 'dorasanisarees@gmail.com';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function trySendViaResend(params: {
  recipients: string[];
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  inquiryId: string;
  submittedAtIst: string;
}): Promise<{ sent: boolean; provider: string; id?: string; error?: string }> {
  const resendApiKey = (Deno.env.get('RESEND_API_KEY') || '').trim();
  if (!resendApiKey) {
    return { sent: false, provider: 'none' };
  }

  const fromEmail = (
    Deno.env.get('RESEND_FROM_EMAIL') || 'DORASANI Contact <onboarding@resend.dev>'
  ).trim();

  const emailSubject = `[DORASANI Contact] ${params.subject} — ${params.senderName}`;

  const textBody = [
    'New Contact Form Submission — DORASANI',
    '======================================',
    `Name: ${params.senderName}`,
    `Email: ${params.senderEmail}`,
    `Subject: ${params.subject}`,
    `Submitted (IST): ${params.submittedAtIst}`,
    params.inquiryId ? `Inquiry ID: ${params.inquiryId}` : '',
    '',
    'Message:',
    params.message,
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `
  <div style="font-family: Georgia, serif; background:#FAF5EE; padding:24px; color:#1A3B2B;">
    <div style="max-width:600px; margin:0 auto; background:#FFFFFF; border:1px solid #D8C7B5; border-radius:16px; overflow:hidden;">
      <div style="background:#285A3C; color:#FFFFFF; padding:20px 24px;">
        <h1 style="margin:0; font-size:20px; letter-spacing:1px;">DORASANI</h1>
        <p style="margin:4px 0 0; font-size:12px; color:#D0E9C0;">New Contact Us Inquiry</p>
      </div>
      <div style="padding:24px; font-family: Arial, sans-serif; font-size:14px; line-height:1.6; color:#3A443D;">
        <table style="width:100%; border-collapse:collapse; margin-bottom:18px;">
          <tr>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF; width:130px; font-weight:700; color:#1A3B2B;">Name</td>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF;">${escapeHtml(params.senderName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF; font-weight:700; color:#1A3B2B;">Email</td>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF;">
              <a href="mailto:${escapeHtml(params.senderEmail)}" style="color:#285A3C; text-decoration:none; font-weight:600;">${escapeHtml(params.senderEmail)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF; font-weight:700; color:#1A3B2B;">Subject</td>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF;">${escapeHtml(params.subject)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF; font-weight:700; color:#1A3B2B;">Submitted</td>
            <td style="padding:8px 0; border-bottom:1px solid #E8DCCF;">${escapeHtml(params.submittedAtIst)}</td>
          </tr>
        </table>
        <div style="background:#FAF5EE; border:1px solid #E8DCCF; border-radius:10px; padding:16px;">
          <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#285A3C; margin-bottom:8px;">Message</div>
          <div style="white-space:pre-wrap; color:#1A3B2B;">${escapeHtml(params.message)}</div>
        </div>
        ${
          params.inquiryId
            ? `<p style="margin:18px 0 0; font-size:11px; color:#647268;">Inquiry Reference ID: <code>${escapeHtml(params.inquiryId)}</code>. Reply directly to this email to respond to ${escapeHtml(params.senderName)}.</p>`
            : ''
        }
      </div>
    </div>
  </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.recipients,
        reply_to: params.senderEmail,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        sent: false,
        provider: 'resend',
        error: data?.message || data?.error || `Resend failed (${res.status})`,
      };
    }

    return { sent: true, provider: 'resend', id: data?.id };
  } catch (err: any) {
    return {
      sent: false,
      provider: 'resend',
      error: err?.message || 'Resend email request failed.',
    };
  }
}

async function trySendViaWeb3Forms(params: {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  inquiryId: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  const accessKey = (Deno.env.get('WEB3FORMS_ACCESS_KEY') || '').trim();
  if (!accessKey) {
    return { sent: false, provider: 'none' };
  }

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        from_name: 'DORASANI Website Contact',
        name: params.senderName,
        email: params.senderEmail,
        replyto: params.senderEmail,
        subject: `[DORASANI Contact] ${params.subject}`,
        message: `${params.message}${params.inquiryId ? `\n\n---\nInquiry ID: ${params.inquiryId}` : ''}`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      return {
        sent: false,
        provider: 'web3forms',
        error: data?.message || `Web3Forms failed (${res.status})`,
      };
    }

    return { sent: true, provider: 'web3forms' };
  } catch (err: any) {
    return {
      sent: false,
      provider: 'web3forms',
      error: err?.message || 'Web3Forms request failed.',
    };
  }
}

async function trySendViaWebhook(params: {
  recipients: string[];
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  inquiryId: string;
  submittedAtIst: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  const webhookUrl = (Deno.env.get('CONTACT_EMAIL_WEBHOOK_URL') || '').trim();
  if (!webhookUrl) {
    return { sent: false, provider: 'none' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.recipients[0] || DEFAULT_RECIPIENT_EMAIL,
        recipients: params.recipients,
        name: params.senderName,
        email: params.senderEmail,
        subject: params.subject,
        message: params.message,
        inquiryId: params.inquiryId,
        submittedAtIst: params.submittedAtIst,
      }),
    });

    if (!res.ok) {
      return {
        sent: false,
        provider: 'webhook',
        error: `Webhook returned HTTP ${res.status}`,
      };
    }

    return { sent: true, provider: 'webhook' };
  } catch (err: any) {
    return {
      sent: false,
      provider: 'webhook',
      error: err?.message || 'Contact webhook request failed.',
    };
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Invalid contact payload.' }, 400);
    }

    const cleanName = String(body.fullName || body.full_name || body.name || '').trim();
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const cleanSubject = String(body.subject || '').trim();
    const cleanMessage = String(body.message || '').trim();

    if (!cleanName || cleanName.length < 2) {
      return jsonResponse({ error: 'Please enter your name.' }, 400);
    }
    if (!isValidEmail(cleanEmail)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }
    if (!cleanSubject) {
      return jsonResponse({ error: 'Please enter a subject.' }, 400);
    }
    if (!cleanMessage) {
      return jsonResponse({ error: 'Please enter your message.' }, 400);
    }

    const admin = getSupabaseAdmin();

    const { data: insertedRow, error: insertError } = await admin
      .from('contact_messages')
      .insert({
        full_name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      return jsonResponse({ error: 'Could not save your inquiry right now. Please try again.' }, 500);
    }

    const inquiryId = insertedRow?.id ? String(insertedRow.id) : '';
    const submittedAtIst = new Date(insertedRow?.created_at || Date.now()).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const configuredTo = (Deno.env.get('CONTACT_TO_EMAIL') || '').trim().toLowerCase();
    const recipients = Array.from(
      new Set([DEFAULT_RECIPIENT_EMAIL, ...(configuredTo ? [configuredTo] : [])])
    );

    let emailResult: { sent: boolean; provider: string; id?: string; error?: string } =
      await trySendViaResend({
        recipients,
        senderName: cleanName,
        senderEmail: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        inquiryId,
        submittedAtIst,
      });

    if (!emailResult.sent) {
      const web3Result = await trySendViaWeb3Forms({
        senderName: cleanName,
        senderEmail: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        inquiryId,
      });
      if (web3Result.sent || web3Result.provider !== 'none') {
        emailResult = web3Result;
      }
    }

    if (!emailResult.sent) {
      const webhookResult = await trySendViaWebhook({
        recipients,
        senderName: cleanName,
        senderEmail: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        inquiryId,
        submittedAtIst,
      });
      if (webhookResult.sent || webhookResult.provider !== 'none') {
        emailResult = webhookResult;
      }
    }

    return jsonResponse({
      success: true,
      saved: true,
      id: inquiryId,
      recipient: DEFAULT_RECIPIENT_EMAIL,
      emailSent: emailResult.sent,
      provider: emailResult.provider,
      emailError: emailResult.error || null,
    });
  } catch (err: any) {
    return jsonResponse(
      { error: err?.message || 'Unexpected error while submitting contact inquiry.' },
      500
    );
  }
});

