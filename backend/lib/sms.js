import twilio from "twilio";

let client;

function getClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
  client ??= twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client;
}

export async function sendBookingConfirmation({ user, booking, routeId }) {
  const twilioClient = getClient();
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER || !user?.phone) return;

  try {
    await twilioClient.messages.create({
      body: `Dumela ${user.name}! Your Kgale Cycles ${routeId ?? "cycling lesson"} booking is confirmed for ${booking.rideDate} (${booking.timeSlot}). Meet at Main Mall, Gaborone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });
  } catch (error) {
    console.error("Booking SMS could not be sent:", error.message);
  }
}