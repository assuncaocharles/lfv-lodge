import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  lojaName: string;
  email: string;
  password: string;
  loginUrl: string;
}

export function WelcomeEmail({
  lojaName,
  email,
  password,
  loginUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo à {lojaName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Bem-vindo à {lojaName}</Heading>
          <Text style={text}>
            Você foi adicionado como membro de <strong>{lojaName}</strong>.
            Use as credenciais abaixo para acessar o sistema:
          </Text>
          <Section style={credentialsBox}>
            <Text style={credentialLabel}>Email</Text>
            <Text style={credentialValue}>{email}</Text>
            <Text style={credentialLabel}>Senha</Text>
            <Text style={credentialValue}>{password}</Text>
          </Section>
          <Text style={text}>
            Recomendamos que você altere sua senha após o primeiro acesso,
            acessando <strong>Meu Perfil</strong>.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={loginUrl}>
              Acessar o Sistema
            </Button>
          </Section>
          <Text style={footerText}>
            Se você não esperava este email, ignore-o.
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

const credentialsBox = {
  backgroundColor: "#1E293B",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "0 0 24px",
};

const credentialLabel = {
  color: "#94A3B8",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const credentialValue = {
  color: "#F8FAFC",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 16px",
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
