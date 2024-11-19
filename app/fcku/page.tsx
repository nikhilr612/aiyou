"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";
export default function NotFoundPage() {
  return (
    <div>
    <div className="absolute top-4 right-4">
      <ModeToggle className="space-x-4 space-y-6" />
    </div>
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <header className="flex flex-col items-center space-y-4">
        <div className="bg-black text-white p-3 rounded">
          <Image src="/images/logo.png" alt="Aiyou Logo" width={50} height={50} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">404 - Page Not Found</h1>
      </header>

      <div className="flex flex-col items-center text-center space-y-4">
        <p className="text-gray-600 text-lg">
          Oops! The page you're looking for doesn't exist or may have been moved.
        </p>
        <Image
          src="/images/404.png" // Add a relevant image for the 404 page
          alt="Page Not Found"
          width={400}
          height={300}
          className="rounded-lg"
        />
        <Button variant="default" className="mt-4">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>

      <footer className="w-full max-w-md text-center text-sm text-gray-500 mt-6">
        <p>© 2024 Aiyou. All Rights Reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
    </div>
  );
}
