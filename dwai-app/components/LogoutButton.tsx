"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { FC } from "react";

import { graphql } from "@/gql";

const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    auth {
      logout
    }
  }
`);

/**
 * Logs out, clears the browser's Apollo cache so the next user can't see
 * this one's data, and goes to the login page.
 */
export const LogoutButton: FC = () => {
  const client = useApolloClient();
  const router = useRouter();
  const [logout, { loading }] = useMutation(LOGOUT_MUTATION);

  const handleClick = async () => {
    await logout();
    await client.clearStore();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      className="disabled:text-gray-500 hover:underline"
      disabled={loading}
      onClick={handleClick}
      type="button"
    >
      Log out
    </button>
  );
};
