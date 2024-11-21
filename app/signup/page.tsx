"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ModeToggle } from "@/components/ui/modetoggle";
import { apiCall } from "../../lib/apicall";
import { storedTokenValidation, storeTokenInIndexedDB } from "@/lib/tokenutils";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    storedTokenValidation(toast, router);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error(
        "Error during submission:",
        "password does not match the confirmPassword",
      );
      toast({
        title: "Re-enter confirm password",
        description: "The password and the confirmPassword do not match",
        variant: "destructive",
      });
    } else
      try {
        const result = await apiCall("createUser", {
          credentials: { email: email, password: password },
        });
        if (result.error) {
          console.error(
            "Error during submission:",
            result.error || "Unknown error",
          );
          toast({
            title: result.message,
            description: result.error || "An error occurred during submission.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Submission Successful",
            description:
              "The data was successfully processed. You're now logged in!",
          });
          await storeTokenInIndexedDB(result.token);
          router.push("/main");
        }
      } catch (err) {
        console.error("Network or server error:", err);
        toast({
          title: "Error",
          description: "A network or server error occurred.",
          variant: "destructive",
        });
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <div className="absolute top-4 right-4">
        <ModeToggle/>
      </div>
      <header className="flex flex-col items-center space-y-2 mb-8">
        <div className="bg-black text-white p-2 rounded">
          <Image
            src="/images/logo.png"
            alt="Aiyou Logo"
            width={50}
            height={50}
          />
        </div>
        <h1 className="text-2xl font-semibold">Aiyou Signup</h1>
      </header>

      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle>Create Your Aiyou Account</CardTitle>
          <p className="text-gray-500">
            Get started with your personalized RAG chatbot
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <Button variant="default" type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <footer className="w-full max-w-md text-center text-sm text-gray-500 mt-6">
        <p>© 2024 Aiyou. All Rights Reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
