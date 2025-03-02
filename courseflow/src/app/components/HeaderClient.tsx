"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, User, LogOut } from "lucide-react";
import { signOut, SessionProvider } from "next-auth/react";
import { useState } from "react";
import { useSession } from "next-auth/react";

// This is the client component that receives the session from the server component
export default function HeaderClient({ session }: { session: any }) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: sessionStatus, status } = useSession();
  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-white">CourseSync</span>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex space-x-2">
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>
              <NavLink
                href={
                  status === "authenticated" ? "/create" : "./api/auth/signin"
                }
                active={pathname === "/create"}
              >
                Create
              </NavLink>
            </nav>

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-violet-600 text-white px-4 py-2 rounded-md">
                  <User className="w-4 h-4" />
                  <span>{session.user?.name || "User"}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70"
                >
                  {isSigningOut ? (
                    <span>Signing out...</span>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="./api/auth/signin"
                className="flex items-center space-x-1 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`btn ${active ? "btn-primary" : "btn-outline"}`}
    >
      {children}
    </Link>
  );
}
