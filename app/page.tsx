import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/modetoggle";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 space-y-6">
      {/* Header Section */}
      <header className="w-full max-w-7xl flex items-center justify-between space-x-6 py-4 max-h-16">
        {" "}
        {/* Added max-h-16 */}
        <div className="flex items-center space-x-4">
          {/* Logo Image */}
          <div className="bg-black text-white p-1 rounded">
            <Image
              src="/images/logo.png"
              alt="Aiyou Logo"
              width={40}
              height={40}
            />
          </div>
          <h1 className="text-lg font-semibold">Aiyou</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="https://github.com">Host</Link>
          <Button variant="default">
            <Link href="/login">Login</Link>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <hr className="w-full max-w-7xl" />

      {/* Main Content */}
      <main className="flex flex-col md:flex-row w-full max-w-7xl space-y-6 md:space-y-0 md:space-x-6">
        {/* Left Side - Large Image */}
        <Card className="flex-1 h-64 bg-gray-200 relative">
          <Image
            src="/images/image1.jpg"
            alt="Large Image"
            layout="fill"
            objectFit="cover"
          />
        </Card>

        {/* Right Side - Text and Buttons */}
        <Card className="flex-1 space-y-4">
          <CardHeader>
            <CardTitle>Aiyou</CardTitle>
            <p className="font-semibold">
              Agentic Retrieval Augmented Generation.
              <br />
              Personalized.
              <br />
              Open Source.
              <br />
              Local.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="default" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <hr className="w-full max-w-7xl" />

      {/* About and Getting Started Section */}
      <section className="flex flex-col md:flex-row w-full max-w-7xl space-y-6 md:space-y-0 md:space-x-6">
        {/* About Section */}
        <Card className="flex-1 p-4">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Aiyou is a local agentic service leveraging RAG (Retrieve and
              Generate) technology to provide efficient information retrieval.
              Our platform processes user queries and generates contextually
              relevant responses, drawing on a variety of local data sources.
            </p>
            <p className="mt-4">
              Designed for practicality, Aiyou aims to facilitate access to
              information and insights tailored to individual and community
              needs.
            </p>
          </CardContent>
        </Card>

        {/* Getting Started Image */}
        <Card className="flex-1 h-64 bg-gray-200 relative">
          <Image
            src="/images/image2.jpg"
            alt="Getting Started Image"
            layout="fill"
            objectFit="cover"
          />
        </Card>
      </section>

      <hr className="w-full max-w-7xl" />

      {/* Footer */}
      <footer className="w-full max-w-7xl flex justify-between items-center text-sm text-gray-500 mt-6">
        <p>
          © 2024 Aiyou. All Rights Reserved. Empowering language models.
          <br />
          Contact: openinbox@mailinator.com
        </p>
        <div className="flex space-x-4">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="https://github.com">Github</Link>
        </div>
      </footer>
    </div>
  );
}
