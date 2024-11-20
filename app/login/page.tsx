"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/modetoggle";
import { useToast } from "@/hooks/use-toast";

async function storeTokenInIndexedDB(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UserDB", 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("tokens", "readwrite");
      const store = transaction.objectStore("tokens");

      // Check if a token already exists
      const getRequest = store.get("authToken");

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          console.debug("Token already exists. Replacing with new token.");
        } else {
          console.debug("No token found. Storing new token.");
        }

        // Replace or insert the token
        store.put({ id: "authToken", token });

        transaction.oncomplete = () => {
          console.debug("Token stored successfully in IndexedDB");
          resolve();
        };

        transaction.onerror = () => {
          console.error("Error storing token in IndexedDB");
          reject(transaction.error);
        };
      };

      getRequest.onerror = () => {
        console.error("Error checking existing token in IndexedDB");
        reject(getRequest.error);
      };
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
      reject(request.error);
    };
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.debug(email, password);

    try {
      // Send request to the API
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta: JSON.stringify({
            credentials: { email: email, password: password }
          }),
          method: "authenticateUser", // Specify the login method
        }),
      });

      console.debug(response);
      const result = await response.json();

      if (!response.ok || result.error) {
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
        <ModeToggle className="space-x-4 space-y-6" />
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
