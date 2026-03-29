import { Resend } from "resend";
import { InviteEmail } from "@/emails/invite-email";

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
    from: `Minha Loja <noreply@${process.env.BETTER_AUTH_URL?.replace("https://", "").replace("http://", "") || "localhost"}>`,
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
