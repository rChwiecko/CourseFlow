import { getServerSession } from "next-auth/next";

// Import your auth options
// Adjust the path based on your file structure
import { authOption } from "@/app/api/auth/[...nextauth]/route";

export async function getUserSession() {
  return await getServerSession(authOption);
}