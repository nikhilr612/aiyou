"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
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

      // Store the token
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

    request.onerror = () => {
      console.error("Error opening IndexedDB");
      reject(request.error);
    };
  });
}
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  let { toast } = useToast();


  const handleSubmit = async (e) => {
  e.preventDefault();


  try {
    // Send request to the API
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: JSON.stringify({ email, password }),
        email,
        password,
        method: 'checkUser',
      }),
    });
    const result = await response.json();
    if (!response.ok || result.error) {
      console.error("Error during submission:", result.error || "Unknown error");
      toast({
        title: result.message,
        description: result.error || "An error occurred during submission.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Submission Successful",
        description: "The data was successfully processed.",
      });
      await storeTokenInIndexedDB(result.token); 
      router.push('/main');
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
      <header className="flex flex-col items-center space-y-2 mb-8">
        <div className="bg-black text-white p-2 rounded">
          <Image src="/images/logo.png" alt="Aiyou Logo" width={50} height={50} />
        </div>
        <h1 className="text-2xl font-semibold">Aiyou Signup</h1>
      </header>

      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle>Create Your Aiyou Account</CardTitle>
          <p className="text-gray-500">Get started with your personalized RAG chatbot</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button variant="default" type="submit" className="w-full">Create Account</Button>
          </form>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
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