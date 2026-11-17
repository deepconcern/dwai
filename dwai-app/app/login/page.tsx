import { redirect } from "next/navigation";
import { FC } from "react";

import { AuthForm } from "@/components/AuthForm";
import { safeNext } from "@/lib/safeNext";
import { getUser } from "@/lib/session";

export type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/** Logs in, then returns to `?next=` (a path on this site) or home. */
export const LoginPage: FC<LoginPageProps> = async ({ searchParams }) => {
  const next = safeNext((await searchParams).next);

  if (await getUser()) redirect(next);

  return <AuthForm mode="login" next={next} />;
};

export default LoginPage;
