"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I get started?",
    answer: "Follow our setup guide in the documentation.",
  },
  {
    question: "How can I reset my password?",
    answer: "Go to the login page and select 'Forgot Password' to reset it.",
  },
  {
    question: "I don’t have an account. How can I register?",
    answer: "Visit the registration page to create an account.",
  },
  {
    question: "How can I contact support?",
    answer: "Reach out via email at support@aiyou.com or call 1-800-123-4567.",
  },
  {
    question: "How do I chat with a model?",
    answer:
      "Navigate to the 'Chat' section in the application and start interacting with the model.",
  },
  {
    question: "What endpoints are supported?",
    answer:
      "Refer to our API documentation for the list of supported endpoints.",
  },
  {
    question: "Do I need internet access?",
    answer:
      "Yes, internet access is required to use the service and connect to the models.",
  },
  {
    question: "How do I add a file to the RAG Store?",
    answer:
      "Go to the 'File Upload' section and upload your file through the provided interface.",
  },
  {
    question: "What file types are supported?",
    answer:
      "Common file types such as .txt, .pdf, and .docx are supported. Check the documentation for a full list.",
  },
  {
    question: "What is the method used for chunking?",
    answer:
      "The system uses a smart chunking algorithm that divides text into manageable segments while preserving context.",
  },
  {
    question: "What should I do if chunking fails for my text file?",
    answer:
      "Ensure the file format is correct and not corrupted. Refer to the troubleshooting guide in the documentation for more details.",
  },
];

const HelpPage: React.FC = () => {
  const router = useRouter();
  const [faqState, setFaqState] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqState((prev) => (prev === index ? null : index));
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto flex flex-col items-center justify-between p-6 space-y-6 bg-gray-50">
      {/* Header Section */}
      <header className="w-full max-w-7xl flex items-center justify-between space-x-6 py-4 max-h-16">
        <div className="flex items-center space-x-4">
          <div className="bg-black text-white p-1 rounded">
            <Image
              src="/images/logo.png"
              alt="Aiyou Logo"
              width={40}
              height={40}
            />
          </div>
          <h1 className="text-2xl font-semibold">Aiyou Help & Support</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">Home</Link>
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

      <hr className="w-full max-w-7xl border-gray-300" />

      {/* Welcome Section */}
      <section className="w-full max-w-7xl text-center space-y-4">
        <h2 className="text-3xl font-semibold">Welcome to Aiyou Support</h2>
        <p className="text-lg">
          Find all the resources you need to make the most out of your
          experience with Aiyou.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Register
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Help Content */}
      <main className="flex flex-col w-full max-w-7xl space-y-6">
        {/* FAQ Section */}
        <Card className="p-6 space-y-4 shadow-lg bg-white rounded-lg">
          <CardHeader className="flex items-center space-x-3">
            <CardTitle className="text-2xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full text-left text-lg font-semibold"
                >
                  <span>{faq.question}</span>
                  <span className="text-xl">
                    {faqState === index ? <ChevronDown /> : <ChevronUp />}
                  </span>
                </button>
                {faqState === index && <p className="mt-2">{faq.answer}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support Section */}
        <Card className="p-6 space-y-4 shadow-lg bg-white rounded-lg">
          <CardHeader className="flex items-center space-x-3">
            <CardTitle className="text-2xl">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you need further assistance, please contact our support team:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                Email:{" "}
                <a href="mailto:support@aiyou.com" className="underline">
                  support@aiyou.com
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="p-6 space-y-4 shadow-lg bg-white rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Features & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc ml-6 space-y-2">
              <li>Step-by-step guides for new users</li>
              <li>Interactive tutorials to maximize productivity</li>
              <li>FAQs to quickly resolve common issues</li>
              <li>Contact support for personalized assistance</li>
              <li>Documentation for advanced users</li>
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
          <Link href="/terms_and_condition" className="underline">
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
};

export default HelpPage;
