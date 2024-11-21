"use client";

import Image from "next/image";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/modetoggle";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiCall } from "../../lib/apicall";
import { storedTokenValidation, storeTokenInIndexedDB } from "@/lib/tokenutils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    storedTokenValidation(toast, router);
  }, []);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.debug(email, password);

    try {
      // Send request to the API
      const result = await apiCall("authenticateUser", {
        credentials: { email: email, password: password },
      });

      if (result.error) {
        console.error("Error during login:", result.error || "Unknown error");
        toast({
          title: result.message || "Login Failed",
          description: result.error || "An error occurred during login.",
          variant: "destructive",
        });
      } else {
        console.debug("Login successful, token:", result.token);
        toast({
          title: "Login Successful",
          description: "You are now logged in.",
        });
        await storeTokenInIndexedDB(result.token); // Store token in IndexedDB
        console.debug("Stored in IndexedDB!");
        router.push("/main"); // Redirect to main page after login
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
        <h1 className="text-2xl font-semibold">Aiyou Login</h1>
      </header>
      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle>Sign In to Aiyou</CardTitle>
          <p className="text-gray-500">
            Create your own personalized RAG chatbot
          </p>
        </CardHeader>
        <CardContent>
          <form method="POST" onSubmit={handleSubmit} className="space-y-4">
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
            {/*error && <p className="text-red-500 text-sm">{error}</p>*/}
            <Button variant="default" type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              New to Aiyou?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Create an account
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
