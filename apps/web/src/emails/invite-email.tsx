import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InviteEmailProps {
  lojaName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}

export function InviteEmail({
  lojaName,
  inviterName,
  role,
  inviteUrl,
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Convite para {lojaName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Convite para {lojaName}</Heading>
          <Text style={text}>
            <strong>{inviterName}</strong> convidou voce para participar de{" "}
            <strong>{lojaName}</strong> como <strong>{role}</strong>.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={inviteUrl}>
              Aceitar Convite
            </Button>
          </Section>
          <Text style={footerText}>
            Este convite expira em 48 horas. Se voce nao solicitou este convite,
            ignore este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0F172A",
  fontFamily: "'DM Sans', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading = {
  color: "#F8FAFC",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#CBD5E1",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 24px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#2B5CE0",
  borderRadius: "8px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footerText = {
  color: "#64748B",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0 0",
};
