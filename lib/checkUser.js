// lib/checkUser.js
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../prisma/client"; // make sure path is correct

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  const existingUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (existingUser) return existingUser;

  return await db.user.create({
    data: {
      clerkUserId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
    },
  });
};
