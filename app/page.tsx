import Image from "next/image"; // Import Next.js Image component for optimized images
import Link from "next/link"; // Import Next.js Link component for routing
import { Button } from "@/components/ui/button"; // Import custom Button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import custom Card components
import { ModeToggle } from "@/components/ui/modetoggle"; // Import ModeToggle component for theme switching

export default function HomePage() {
  return (
    <div className="min-h-screen h-screen overflow-y-scroll scrollbar-hide flex flex-col items-center justify-between p-4 space-y-4 light:bg-gray-300">
      {/* Header Section */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          {/* Logo Image */}
          <div className="bg-black text-white p-2 rounded-lg ">
            <Image
              src="/images/logo.png"
              alt="Aiyou Logo"
              width={32}
              height={32}
            />
          </div>
          <h1 className="text-xl font-bold">Aiyou</h1>
        </div>
        <div className="flex items-center space-x-4 sticky top-0 z-10 ">
          {/* Host Link */}
          <Link
            href="https://github.com"
            className="text-gray-700 hover:text-gray-900 text-lg dark:text-gray-300 "
          >
            Host
          </Link>
          {/* Login Button */}
          <Button variant="default" className="px-3 py-1 text-sm">
            <Link href="/login">Login</Link>
          </Button>
          {/* Theme Toggle */}
          <ModeToggle />
        </div>
      </header>

      <hr className="w-full max-w-6xl border-gray-300" />

      {/* Main Content */}
      <main className="w-full max-w-6xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 ">
        {/* Left Section: Large Image */}
        <Card className="flex-1 h-[300px] overflow-hidden rounded-lg flex items-center justify-cente">
          <Image
            className="rounded-lg object-cover max-h-full"
            src="/images/image1.jpg"
            alt="Large Image"
            width={350}
            height={300}
            layout="responsive"
            objectFit="cover"
            quality={100}
          />
        </Card>

        {/* Right Section: Text and Button */}
        <Card className="w-[300px] h-[300px] flex-1 p-4 shadow-md bg-secondary border border-gray-300">
          {" "}
          {/* Ensures the card background adapts */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Aiyou
            </CardTitle>{" "}
            {/* Changes color in dark mode */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Agentic Retrieval Augmented Generation.
              <br />
              Personalized.
              <br />
              Open Source.
              <br />
              Local.
            </p>
          </CardHeader>
          <CardContent>
            {/* Call-to-action Button */}
            <Button
              variant="default"
              className="px-3 py-1 hover:bg-gray-600 text-sm"
            >
              <Link href="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <hr className="w-full max-w-6xl border-gray-300" />

      {/* About Section */}
      <section className="w-full max-w-6xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Left Section: About Text */}
        <Card className="flex-1 p-4 shadow-md bg-secondary border border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-white">
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Aiyou is a local agentic service leveraging RAG (Retrieve and
              Generate) technology to provide efficient information retrieval.
              It processes user queries and generates contextually relevant
              responses using various data sources.
            </p>
          </CardContent>
        </Card>

        {/* Right Section: Second Image */}
        <Card className="flex-1 dark:bg-gray-800 ">
          <Image
            className="rounded-lg"
            src="/images/image2.jpg"
            alt="Getting Started Image"
            width={350}
            height={150}
            layout="responsive"
            objectFit="cover"
            quality={100}
          />
        </Card>
      </section>

      <hr className="w-full max-w-6xl border-gray-300" />

      {/* Footer Section */}
      <footer className="w-full max-w-6xl flex justify-between items-center text-xs text-gray-500 mt-4">
        <p>
          © 2024 Aiyou. All Rights Reserved.
          <br />
          Contact: openinbox@mailinator.com
        </p>
        <div className="flex space-x-3">
          {/* Footer Links */}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          <Link href="https://github.com" className="underline">
            Github
          </Link>
        </div>
      </footer>
    </div>
  );
}
