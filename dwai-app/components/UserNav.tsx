import Link from "next/link";
import { FC } from "react";

import { getUser } from "@/lib/session";

import { LogoutButton } from "./LogoutButton";

/**
 * The header's links: for a logged-in user, their characters and campaigns,
 * their name, and a log-out button; otherwise log-in and register links.
 */
export const UserNav: FC = async () => {
  const user = await getUser();

  return user ? (
    <div className="flex gap-4 items-center">
      <Link className="hover:underline" href="/">
        Characters
      </Link>
      <Link className="hover:underline" href="/campaigns">
        Campaigns
      </Link>
      <span>{user.displayName}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-4 items-center">
      <Link className="hover:underline" href="/login">
        Log in
      </Link>
      <Link className="hover:underline" href="/register">
        Register
      </Link>
    </div>
  );
};
