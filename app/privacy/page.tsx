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
    <div className="min-h-screen h-screen overflow-y-auto scroll-smooth flex flex-col items-center justify-between p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <header className="w-full max-w-7xl bg-white flex items-center justify-between space-x-6 py-4 px-6 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-black text-white p-1 rounded">
            <Image src="/images/logo.png" alt="Aiyou Logo" width={40} height={40} />
          </div>
          <h1 className="text-2xl font-semibold">Aiyou Privacy Policy</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-500 transition duration-200">
            Home
          </Link>
          <Button
            variant="default"
            onClick={handleBackToHome}
            className="flex items-center space-x-2 hover:bg-blue-500 hover:text-white transition duration-200"
          >
            <span>Back to Home</span>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <hr className="w-full max-w-7xl border-gray-300" />

      {/* Privacy Policy Content */}
      <main className="flex flex-col w-full max-w-7xl space-y-6">
        <Card className="p-6 space-y-4 shadow-lg bg-white rounded-lg transition transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Last updated: [Insert Date]</p>

            <h2 className="text-xl font-semibold mt-4">1. Introduction</h2>
            <p className="text-gray-700">
              Welcome to Aiyou. This Privacy Policy explains how we collect, use, and protect your personal information
              when you use our services. By accessing or using Aiyou, you agree to the collection and use of your
              information in accordance with this policy.
            </p>

            <h2 className="text-xl font-semibold mt-4">2. Information We Collect</h2>
            <p className="text-gray-700">
              We collect several types of information for various purposes to provide and improve our service to you:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Personal Data:</strong> While using our service, we may ask you to provide certain personally
                identifiable information, such as your name, email address, phone number, etc.
              </li>
              <li>
                <strong>Usage Data:</strong> We may also collect information on how the service is accessed and used,
                including your IP address, browser type, device information, and usage data.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies and similar tracking technologies to monitor activity on our
                service and retain certain information.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-4">3. How We Use Your Information</h2>
            <p className="text-gray-700">
              We use the collected data for various purposes, including:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>To provide, operate, and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>

            <h2 className="text-xl font-semibold mt-4">4. Data Sharing</h2>
            <p className="text-gray-700">
              We do not sell, rent, or trade your personal data. We may share your information in the following
              circumstances:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                <strong>Service Providers:</strong> We may employ third-party companies to facilitate our service or
                provide services on our behalf.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your personal data if required by law or in
                response to valid legal requests by public authorities.
              </li>
              <li>
                <strong>Business Transfers:</strong> If Aiyou is involved in a merger, acquisition, or asset sale, your
                personal data may be transferred.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-4">5. Data Security</h2>
            <p className="text-gray-700">
              We take reasonable measures to protect your data from unauthorized access, alteration, disclosure, or
              destruction. However, please be aware that no method of electronic transmission or storage is 100%
              secure.
            </p>

            <h2 className="text-xl font-semibold mt-4">6. Your Rights</h2>
            <p className="text-gray-700">
              You have the right to access, update, or delete your personal information. You can request to exercise
              these rights by contacting us at [Insert Contact Email].
            </p>

            <h2 className="text-xl font-semibold mt-4">7. Cookies</h2>
            <p className="text-gray-700">
              We use cookies to track activity on our service and hold certain information. You can instruct your
              browser to refuse all cookies or indicate when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our service.
            </p>

            <h2 className="text-xl font-semibold mt-4">8. Links to Other Websites</h2>
            <p className="text-gray-700">
              Our service may contain links to other websites that are not operated by us. We are not responsible for
              the content, privacy policies, or practices of third-party sites. We recommend that you review the privacy
              policy of every site you visit.
            </p>

            <h2 className="text-xl font-semibold mt-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page, and we will update the "Last updated" date at the top of this policy.
            </p>

            <h2 className="text-xl font-semibold mt-4">10. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>
                Email: <a href="mailto:support@aiyou.com" className="underline text-blue-500">support@aiyou.com</a>
              </li>
            </ul>
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
          <Link href="/help" className="underline hover:text-blue-500 transition duration-200">
            Help
          </Link>
          <Link href="/terms_and_condition" className="underline hover:text-blue-500 transition duration-200">
            Terms of Service
          </Link>
          <Link href="https://github.com" className="underline hover:text-blue-500 transition duration-200">
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
