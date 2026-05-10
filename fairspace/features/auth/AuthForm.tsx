"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/app/(auth)/actions";

type Props = { mode: "login" | "signup" };

type ActionResult = { ok: false; message: string } | undefined;

export function AuthForm({ mode }: Props) {
  const action = mode === "login" ? signIn : signUp;
  const [result, submit, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to manage your bookings."
            : "Start booking rooms with fair-use rules."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
            />
          </div>

          {result?.ok === false ? (
            <div className="text-sm text-destructive">{result.message}</div>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <Link className="text-foreground underline underline-offset-4" href="/signup">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link className="text-foreground underline underline-offset-4" href="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

