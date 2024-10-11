import { Webhook } from "svix";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import type { WebhookEvent } from "@clerk/clerk-sdk-node"; // Use an alternative type

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET ?? "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const payload = await getRawBody(req); 
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent; 

  try {
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
    const email = evt.data.email_addresses[0]?.email_address ?? "";
    const name = evt.data.first_name ?? "";

    // Upsert user in the database
    await db.user.upsert({
      where: { id: userId },
      update: {
        email,
      },
      create: {
        id: userId,
        email,
      },
    });
  }

  res.status(200).json({ success: true });
}

import rawBody from "raw-body";

async function getRawBody(req: NextApiRequest) {
  const body = await rawBody(req);
  return body;
}


export const config = {
  api: {
    bodyParser: false,
  },
};
