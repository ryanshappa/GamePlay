import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "~/server/db";

export async function ensureUserExists(userId: string) {
  // Check if the user exists in the database
  let user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    // Fetch user data from Clerk
    const userData = await clerkClient.users.getUser(userId);

    // Create a new user in the database
    user = await db.user.create({
      data: {
        id: userId,
        email: userData.emailAddresses[0]?.emailAddress || "",
        name: userData.firstName || "",
        // Add other fields as needed
      },
    });
  }

  return user;
}
