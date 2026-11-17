import { redirect } from "next/navigation";
import { FC } from "react";

import { AuthForm } from "@/components/AuthForm";
import { safeNext } from "@/lib/safeNext";
import { getUser } from "@/lib/session";

export type RegisterPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/** Creates an account and logs in, then goes to `?next=` (a path on this site) or home. */
export const RegisterPage: FC<RegisterPageProps> = async ({ searchParams }) => {
  const next = safeNext((await searchParams).next);

  if (await getUser()) redirect(next);

  return <AuthForm mode="register" next={next} />;
};

export default RegisterPage;
