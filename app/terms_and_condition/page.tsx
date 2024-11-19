"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";
import { useRouter } from "next/navigation";

const TermsPage: React.FC = () => {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto flex flex-col items-center justify-between p-6 space-y-6">
      {/* Header Section */}
      <header className="w-full max-w-7xl flex items-center justify-between space-x-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="p-1 rounded">
            <Image src="/images/logo.png" alt="Aiyou Logo" width={40} height={40} />
          </div>
          <h1 className="text-2xl font-semibold">Aiyou Terms and Conditions</h1>
        </div>
        <div className="flex items-center space-x-4 sticky top-0 z-10">
          {/* <Link href="/">Home</Link> */}
          <Button variant="default" onClick={handleBackToHome} className="flex items-center space-x-2">
            <span>Back to Home</span>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <hr className="w-full max-w-7xl" />

      {/* Terms and Conditions Content */}
      <main className="flex flex-col w-full max-w-7xl space-y-6">
        {/* Added hover effect */}
        <Card className="p-6 space-y-4 shadow-lg  rounded-lg border border-gray-300 transition-transform duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-2xl">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="border-t border-gray-300 pt-3">
            <p>Last updated: [Insert Date]</p>

            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              Welcome to Aiyou. These terms and conditions govern your use of our services and website. By accessing or using Aiyou, you agree to comply with these terms. If you do not agree, do not use our service.
            </p>

            <h2 className="text-xl font-semibold">2. License to Use</h2>
            <p>
              Aiyou grants you a non-exclusive, non-transferable license to use the website and services for personal or business purposes, subject to these terms.
            </p>

            <h2 className="text-xl font-semibold">3. User Obligations</h2>
            <p>
              As a user, you agree not to misuse or disrupt the service in any way, including but not limited to unauthorized access, sharing of personal information, and violating intellectual property rights.
            </p>

            <h2 className="text-xl font-semibold">4. Intellectual Property</h2>
            <p>
              All content, logos, images, and software on Aiyou are protected by intellectual property laws. You agree not to copy, distribute, or modify these without proper authorization.
            </p>

            <h2 className="text-xl font-semibold">5. Disclaimer of Warranties</h2>
            <p>
              Aiyou provides the service “as is” and makes no representations or warranties regarding the accuracy, completeness, or reliability of the content.
            </p>

            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p>
              Aiyou is not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.
            </p>

            <h2 className="text-xl font-semibold">7. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of [Insert Jurisdiction]. Any disputes will be resolved in the appropriate courts of [Insert Jurisdiction].
            </p>

            <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Changes will be posted on this page, and the date of the last update will be reflected.
            </p>

            <h2 className="text-xl font-semibold">9. Contact Us</h2>
            <p>
              If you have any questions or concerns about these terms, please contact us at
              <a href="mailto:support@aiyou.com">support@aiyou.com</a>.
            </p>
          </CardContent>
        </Card>
      </main>

      <hr className="w-full max-w-7xl" />

      {/* Footer */}
      <footer className="w-full max-w-7xl flex justify-between items-center text-sm mt-6">
        <p>
          © 2024 Aiyou. All Rights Reserved. <br />
          Contact: openinbox@mailinator.com
        </p>
        <div className="flex space-x-4">
          <Link href="/help" className="underline">Help</Link>
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          <Link href="https://github.com" className="underline">Github</Link>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
