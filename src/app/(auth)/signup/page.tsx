import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your account — Vouch" };

export default function SignupPage() {
  return (
    <AuthShell
      title={<>Start <span className="serif blue">vouching.</span></>}
      subtitle="Create an account, grab an API key and track your first post in a minute."
      footer={<>Already have an account? <Link href="/login">Sign in</Link></>}
    >
      <SignupForm />
    </AuthShell>
  );
}
