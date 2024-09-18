import { Webhook } from "svix";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import type { WebhookEvent } from "@clerk/clerk-sdk-node"; // Use an alternative type

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Disable Next.js's default body parsing
  // We'll handle raw body parsing ourselves
  const payload = await getRawBody(req); // We'll define getRawBody below

  const headers = req.headers;

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent; // Change to the new type

  try {
    // Extract and cast headers to the expected types
    const svixHeaders = {
      "svix-id": headers["svix-id"] as string,
      "svix-timestamp": headers["svix-timestamp"] as string,
      "svix-signature": headers["svix-signature"] as string,
    };

    evt = wh.verify(payload.toString(), svixHeaders) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const userId = evt.data.id as string;
    const email = evt.data.email_addresses[0]?.email_address || "";
    const name = evt.data.first_name || "";

    // Upsert user in the database
    await db.user.upsert({
      where: { id: userId },
      update: {
        email,
        name,
      },
      create: {
        id: userId,
        email,
        name,
      },
    });
  }

  res.status(200).json({ success: true });
}

// Helper function to get raw body
import rawBody from "raw-body";

async function getRawBody(req: NextApiRequest) {
  const body = await rawBody(req);
  return body;
}

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};
