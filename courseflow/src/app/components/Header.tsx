// Server part - no "use client" directive
import { getUserSession } from '../../../lib/session';
import HeaderClient from './HeaderClient';

// This part runs on the server
export default async function Header() {
  const session = await getUserSession();
  
  // Pass the session to the client component
  return <HeaderClient session={session} />;
}