import { Resend } from "resend";
import { InviteEmail } from "@/emails/invite-email";
import { WelcomeEmail } from "@/emails/welcome-email";

let resend: Resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendInviteEmail(params: {
  to: string;
  lojaName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}) {
  await getResend().emails.send({
    from: "LFV 003 <onboarding@resend.dev>",
    to: params.to,
    subject: `Voce foi convidado para ${params.lojaName}`,
    react: InviteEmail({
      lojaName: params.lojaName,
      inviterName: params.inviterName,
      role: params.role,
      inviteUrl: params.inviteUrl,
    }),
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  lojaName: string;
  email: string;
  password: string;
  loginUrl: string;
}) {
  await getResend().emails.send({
    from: "LFV 003 <onboarding@resend.dev>",
    to: params.to,
    subject: `Bem-vindo à ${params.lojaName}`,
    react: WelcomeEmail({
      lojaName: params.lojaName,
      email: params.email,
      password: params.password,
      loginUrl: params.loginUrl,
    }),
  });
}
