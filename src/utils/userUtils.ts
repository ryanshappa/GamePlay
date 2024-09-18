// import { clerkClient } from "@clerk/clerk-sdk-node";
// import { db } from "~/server/db";

// export async function ensureUserExists(userId: string) {
//   // Check if the user exists in the database
//   let user = await db.user.findUnique({
//     where: { id: userId },
//   });

//   if (!user) {
//     // Fetch user data from Clerk
//     const userData = await clerkClient.users.getUser(userId);

//     // Create a new user in the database
//     user = await db.user.create({
//       data: {
//         id: userId,
//         email: userData.emailAddresses[0]?.emailAddress || "",
//         name: userData.firstName || "",
//         // Add other fields as needed
//       },
//     });
//   }

//   return user;
// }


import { clerkClient } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export async function ensureUserExists(userId: string) {
  const user = await clerkClient.users.getUser(userId);

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';
    const username = user.username ?? '';
    const email = user.emailAddresses[0]?.emailAddress ?? '';

    await db.user.create({
      data: {
        id: userId,
        firstName,
        lastName,
        username,
        email,
        name: `${firstName} ${lastName}`.trim() || username || email || 'Unknown User',
      },
    });
  }
}
