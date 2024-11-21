"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PrivacyPage: React.FC = () => {
  const router = useRouter();
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleBackToHome = () => {
    router.push("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen h-screen overflow-y-auto scroll-smooth flex flex-col items-center justify-between p-6 space-y-6">
      {/* Header */}
      <header className="w-full max-w-7xl flex items-center justify-between space-x-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="p-1 rounded">
            <Image
              src="/images/logo.png"
              alt="Aiyou Logo"
              width={40}
              height={40}
            />
          </div>
          <h1 className="text-2xl font-semibold">Aiyou Privacy Policy</h1>
        </div>
        <div className="flex items-center space-x-4 sticky top-0 z-10">
          <Button
            variant="default"
            onClick={handleBackToHome}
            className="flex items-center space-x-2"
          >
            <span>Back to Home</span>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <hr className="w-full max-w-7xl" />

      {/* Apache License Content */}
      <main className="flex flex-col w-full max-w-7xl space-y-6">
        <Card className="p-6 space-y-4 shadow-lg rounded-lg border border-gray-300 transition-transform duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-2xl">Apache License</CardTitle>
          </CardHeader>
          <CardContent className="border-t border-gray-300 pt-3">
            <p>Version 2.0, January 2004</p>
            <p>
              <strong>
                Terms and Conditions for Use, Reproduction, and Distribution
              </strong>
            </p>
            <p>
              Licensed under the Apache License, Version 2.0 (the "License");
              you may not use this file except in compliance with the License.
              You may obtain a copy of the License at:
            </p>
            <a
              href="http://www.apache.org/licenses/LICENSE-2.0"
              className="underline text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://www.apache.org/licenses/LICENSE-2.0
            </a>
            <p>
              Unless required by applicable law or agreed to in writing,
              software distributed under the License is distributed on an "AS
              IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
              express or implied. See the License for the specific language
              governing permissions and limitations under the License.
            </p>
          </CardContent>
        </Card>
      </main>

      <hr className="w-full max-w-7xl border-gray-300" />

      {/* Footer */}
      <footer className="w-full max-w-7xl flex justify-between items-center text-sm text-gray-500 mt-6">
        <p>
          © 2024 Aiyou. All Rights Reserved. <br />
          Contact: openinbox@mailinator.com
        </p>
        <div className="flex space-x-4">
          <Link
            href="/help"
            className="underline hover:text-blue-500 transition duration-200"
          >
            Help
          </Link>
          <Link
            href="/terms"
            className="underline hover:text-blue-500 transition duration-200"
          >
            Terms of Service
          </Link>
          <Link
            href="https://github.com"
            className="underline hover:text-blue-500 transition duration-200"
          >
            Github
          </Link>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default PrivacyPage;
