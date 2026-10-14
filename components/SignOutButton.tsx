// components/SignOutButton.tsx
"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="btn btn-light"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
