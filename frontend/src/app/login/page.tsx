"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Input, Button, Alert } from "@/components/ui";
import Cookies from "js-cookie";
import PasswordInput from "@/components/ui/inputs/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const queryEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState({ email: queryEmail, password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      // Success: Store token (In real app, use HTTPOnly cookies or Secure Storage)
      // localStorage.setItem("token", data.access_token);
      Cookies.set("token", data.access_token, { expires: 1, secure: true });

      // Redirect to home/dashboard
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email to sign in to your account
          </p>
        </div>

        {/* Show Success message if redirected from signup */}
        {registered && !error && (
          <Alert
            variant="success"
            title="Success"
            description="Account created! Please log in."
          />
        )}

        {error && <Alert variant="danger" title="Error" description={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="m@example.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <PasswordInput
            label="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Log In
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
