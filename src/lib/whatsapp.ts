import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export async function sendWhatsAppMessage(to: string, body: string): Promise<string | null> {
    if (!client || !fromNumber) {
        console.warn("Twilio not configured. Would send WhatsApp:", { to, body });
        return "MOCK_SID_" + Date.now();
    }

    try {
        const message = await client.messages.create({
            body,
            from: fromNumber,
            to: `whatsapp:${to}`,
        });
        return message.sid;
    } catch (error) {
        console.error("Error sending WhatsApp:", error);
        throw error;
    }
}
