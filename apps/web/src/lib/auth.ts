import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/auth-schema";
import { sendInviteEmail } from "@/lib/resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    nextCookies(),
    organization({
      async sendInvitationEmail(data) {
        const inviteUrl = `${process.env.BETTER_AUTH_URL}/convite/${data.id}`;
        await sendInviteEmail({
          to: data.email,
          lojaName: data.organization.name,
          inviterName: data.inviter.user.name,
          role: data.role,
          inviteUrl,
        });
      },
    }),
  ],
});
