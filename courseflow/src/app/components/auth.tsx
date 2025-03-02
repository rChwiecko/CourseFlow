// This is a server component (no "use client")
import { getUserSession } from '../../../lib/session';

// Expose a function to get the current user session
export async function getSessionData() {
  const session = await getUserSession();
  return session;
}