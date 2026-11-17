"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useId, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { PageTitle } from "@/components/PageTitle";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";
import { loginHref } from "@/lib/safeNext";

const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    auth {
      login(input: $input) {
        id
      }
    }
  }
`);

const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInput!) {
    auth {
      register(input: $input) {
        id
      }
    }
  }
`);

export type AuthFormProps = {
  /** Which form to show. Registering also asks for a display name. */
  mode: "login" | "register";
  /** Where to go afterwards; already checked with `safeNext`. */
  next: string;
};

/**
 * The log-in and register forms. On success it clears the browser's Apollo
 * cache (it may hold another user's data) and goes to `next`, refreshing
 * server components so the navigation shows the new user.
 */
export const AuthForm: FC<AuthFormProps> = ({ mode, next }) => {
  const client = useApolloClient();
  const id = useId();
  const [login] = useMutation(LOGIN_MUTATION);
  const [register] = useMutation(REGISTER_MUTATION);
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";
  const otherHref = isRegister
    ? next === "/"
      ? "/login"
      : loginHref(next)
    : next === "/"
      ? "/register"
      : `/register?next=${encodeURIComponent(next)}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setErrors([]);
    setSubmitting(true);
    try {
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      if (isRegister) {
        const displayName = String(form.get("displayName") ?? "");
        await register({
          variables: { input: { displayName, email, password } },
        });
      } else {
        await login({ variables: { input: { email, password } } });
      }
      await client.clearStore();
      router.replace(next);
      router.refresh();
    } catch (error) {
      setErrors(errorMessages(error));
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <PageTitle title={isRegister ? "Register" : "Log In"} />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {isRegister && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-displayName`}>Display name</label>
            <TextInput
              autoComplete="nickname"
              id={`${id}-displayName`}
              maxLength={50}
              name="displayName"
              required
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-email`}>Email</label>
          <TextInput
            autoComplete="email"
            id={`${id}-email`}
            name="email"
            required
            type="email"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-password`}>Password</label>
          <TextInput
            autoComplete={isRegister ? "new-password" : "current-password"}
            id={`${id}-password`}
            maxLength={128}
            minLength={isRegister ? 8 : undefined}
            name="password"
            required
            type="password"
          />
          {isRegister && (
            <p className="text-gray-400 text-sm">At least 8 characters.</p>
          )}
        </div>

        <ErrorList errors={errors} />

        <Button disabled={submitting} type="submit">
          {isRegister ? "Register" : "Log In"}
        </Button>
      </form>

      <p className="mt-4 text-gray-400">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link className="hover:underline text-blue-400" href={otherHref}>
          {isRegister ? "Log in" : "Register"}
        </Link>
      </p>
    </div>
  );
};
