import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in — Vouch" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const q = await searchParams;
  return (
    <AuthShell
      title={<>Welcome <span className="serif blue">back.</span></>}
      subtitle="Sign in to your Vouch console."
      footer={<>New to Vouch? <Link href="/signup">Create an account</Link></>}
    >
      <LoginForm next={typeof q.next === "string" ? q.next : undefined} linkError={q.error === "link"} />
    </AuthShell>
  );
}
