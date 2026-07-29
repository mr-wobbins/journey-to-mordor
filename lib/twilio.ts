import twilio from "twilio";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export async function sendInviteSms(to: string, body: string) {
  const client = twilio(
    requireEnv("TWILIO_ACCOUNT_SID"),
    requireEnv("TWILIO_AUTH_TOKEN"),
  );

  return client.messages.create({
    to,
    from: requireEnv("TWILIO_PHONE_NUMBER"),
    body,
  });
}
