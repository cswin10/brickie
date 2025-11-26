"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card } from "@brickie/ui";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail, isValidPassword } from "@brickie/lib";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message || "Invalid password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md" padding="lg">
      <h1 className="text-2xl font-bold text-warm-900 text-center mb-6">
        Create Account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-warm-600">
        Already have an account?{" "}
        <Link href="/login" className="text-brick-500 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
