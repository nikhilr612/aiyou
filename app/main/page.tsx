"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/ui/modetoggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, Send, Check, ChevronsUpDown, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Message, Endpoint, agentic_call, chunkText } from "@/lib/llmcall";
import Markdown from "react-markdown";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/newcommand";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import Link from "next/link";
import materialDark from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";
import { useRouter } from "next/navigation";
import { getTokenFromIndexedDB, storedTokenValidation } from "@/lib/tokenutils";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { apiCall } from "@/lib/apicall";

interface Thread {
  id: number;
  name: string;
}

const THREAD_IMAGE_PLACEHOLDER: string = "/images/bot-avatar.png";
const USER_AVATAR_PLACEHOLDER: string = "/images/user-avatar.png";

const initialEndpoints: Endpoint[] = [
  { name: "ollama-local", target: "http://localhost:11434" },
];

// TODO: Replace local storage.

/*
async function storeInIndexedDB(key: string, value: string): Promise<void> {
  const dbName = "ThreadDB";
  const storeName = "KeyValueStore";

  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = (event) =>
      resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (err) =>
      reject(
        new Error(
          "Error opening the database: " + (err.target as IDBRequest).error,
        ),
      );
  });

  if (!db.objectStoreNames.contains(storeName)) {
    db.close();
    throw new Error(`Object store "${storeName}" not found.`);
  }

  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  await new Promise<void>((resolve, reject) => {
    const addRequest = store.put({ id: key, value });
    addRequest.onsuccess = () => resolve();
    addRequest.onerror = (err) =>
      reject(
        new Error(
          "Error storing the key-value pair: " +
            (err.target as IDBRequest).error,
        ),
      );
  });

  transaction.oncomplete = () => db.close();
}*/

/*
async function getFromIndexedDB(key: string): Promise<string | null> {
  const dbName = "ThreadDB";
  const storeName = "KeyValueStore";

  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = (event) =>
      resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (err) =>
      reject(
        new Error(
          "Error opening the database: " + (err.target as IDBRequest).error,
        ),
      );
  });

  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const result = await new Promise<any>((resolve, reject) => {
    const getRequest = store.get(key);
    getRequest.onsuccess = () => resolve(getRequest.result || null);
    getRequest.onerror = (err) =>
      reject(
        new Error(
          "Error retrieving the value: " + (err.target as IDBRequest).error,
        ),
      );
  });

  transaction.oncomplete = () => db.close();

  return result;
}*/

export default function MainPage() {
  // For Showing toasts.
  const { toast } = useToast();
  const router = useRouter();

  const [threads, setThreads] = useState<Thread[]>([{ id: 1, name: "Thread" }]);

  const [currentThread, setCurrentThread] = useState<Thread>(threads[0]);

  type ThreadMap = { [key: number]: Message[] };

  const [messages, setMessages] = useState<ThreadMap>({
    1: [],
    2: [],
  });

  const [search, setSearch] = useState("");

  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(
    initialEndpoints[0],
  );

  useEffect(() => {
    storedTokenValidation(toast, router); // W: Return value is discarded.
    const storedThreads = localStorage.getItem("AIYOU_threads");
    setThreads(
      storedThreads ? JSON.parse(storedThreads) : [{ id: 1, name: "Thread" }],
    );
    const storedMessages = localStorage.getItem("AIYOU_messages");
    setMessages(
      storedMessages
        ? JSON.parse(storedMessages)
        : {
            1: [],
            2: [],
          },
    );
    const storedCurrentThread = localStorage.getItem("AIYOU_currentThread");
    setCurrentThread(
      storedCurrentThread ? JSON.parse(storedCurrentThread) : threads[0],
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("AIYOU_threads", JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem("AIYOU_currentThread", JSON.stringify(currentThread));
  }, [currentThread]);

  useEffect(() => {
    localStorage.setItem("AIYOU_messages", JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = { content: text, isUser: true };
    setMessages((msgs) => {
      return {
        ...msgs,
        [currentThread.id]: [...msgs[currentThread.id], newMessage],
      };
    });
    try {
      const token = (await getTokenFromIndexedDB()) || "NULL_TOKEN";
      const response = await agentic_call(
        selectedEndpoint,
        messages[currentThread.id],
        text,
        undefined, // For now.
        token,
      );
      const response_message: Message = { content: response, isUser: false };
      if (response.trim().length > 0) {
        setMessages((msgs) => {
          return {
            ...msgs,
            [currentThread.id]: [...msgs[currentThread.id], response_message],
          };
        });
      }
    } catch (error) {
      console.error("Error occurred during LLM call\n", error);
      toast({
        title: "LLM call failed",
        description:
          "An unexpected error occurred during call to LLM endpoint. Check logs.",
        variant: "destructive",
      });
    }
  };
  const handleNewThread = () => {
    if (search.trim()) {
      const newThread = { id: threads.length + 1, name: search };
      setThreads([...threads, newThread]);
      setCurrentThread(newThread);
      setMessages({ ...messages, [newThread.id]: [] });
      setSearch("");
    }
  };

  const addEndpoint = (endpoint: Endpoint) => {
    setEndpoints([...endpoints, endpoint]);
    setSelectedEndpoint(endpoint);
    toast({
      title: "Created New Endpoint",
      description: `You can now choose ${endpoint.name} to connect to ${endpoint.target}`,
      duration: 1000,
    });
  };

  return (
    <div className="flex h-screen" style={{ overflow: "hidden" }}>
      <SidePanel
        threads={threads}
        onSelectThread={setCurrentThread}
        onNewThread={handleNewThread}
        search={search}
        setSearch={setSearch}
      />
      <div className="flex flex-col flex-grow">
        <TopBar
          threadName={currentThread?.name}
          endpoints={endpoints}
          selectedEndpoint={selectedEndpoint}
          setSelectedEndpoint={setSelectedEndpoint}
          addEndpoint={addEndpoint}
          router={router}
        />
        <ChatPanel messages={messages[currentThread.id] || []} />
        <InputArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

// Sidebar Component
interface SidePanelProps {
  threads: Thread[];
  onSelectThread: (thread: Thread) => void;
  onNewThread: () => void;
  search: string;
  setSearch: (search: string) => void;
}

function SidePanel({
  threads,
  onSelectThread,
  onNewThread,
  search,
  setSearch,
}: SidePanelProps) {
  const filteredThreads = threads.filter((thread) =>
    thread.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-64 mt-2 mb-2 ml-2 p-2 border-r hidden lg:block h-full">
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search or Create"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <Button onClick={onNewThread} className="ml-2" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="h-full space-y-2">
        {filteredThreads.map((thread) => (
          <Card
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className="cursor-pointer p-2 rounded hover:bg-secondary flex items-center mb-2 mr-3"
          >
            <Avatar className="mr-3">
              <AvatarImage src={THREAD_IMAGE_PLACEHOLDER} alt={thread.name} />
              <AvatarFallback>{thread.name[0]}</AvatarFallback>
            </Avatar>
            <span>{thread.name}</span>
          </Card>
        ))}
        <span className="px-60" />
      </ScrollArea>
    </aside>
  );
}

interface EndpointSelectProps {
  endpoints: Endpoint[];
  selectedEndpoint: Endpoint;
  setSelectedEndpoint: (endpoint: Endpoint) => void;
  addEndpoint: (endpoint: Endpoint) => void;
}

function EndpointSelect({
  endpoints,
  selectedEndpoint,
  setSelectedEndpoint,
  addEndpoint,
}: EndpointSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button role="combobox" aria-expanded={open}>
          {selectedEndpoint.name || "Select endpoint..."}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search endpoint..." />
          <CommandList>
            <CommandEmpty>No endpoint found.</CommandEmpty>
            <CommandGroup>
              {endpoints.map((endpoint) => (
                <CommandItem
                  key={endpoint.target}
                  value={endpoint.target}
                  className="hover:bg-secondary cursor-pointer"
                  onSelect={(currentValue: string) => {
                    const endpoint = endpoints.find(
                      (ep) => ep.target === currentValue,
                    );
                    if (endpoint) setSelectedEndpoint(endpoint);
                    setOpen(false);
                  }}
                >
                  {endpoint.name}
                  <Check
                    className={
                      selectedEndpoint.target === endpoint.target
                        ? "visible"
                        : "invisible"
                    }
                  />
                </CommandItem>
              ))}
              <NewEndpointDialog addEndpoint={addEndpoint} />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface NewEndpointDialogProps {
  addEndpoint: (endpoint: Endpoint) => void;
  className?: string; // Pass down
}

interface LogoutButtonProps {
  router: AppRouterInstance;
}

function LogoutButton({ router }: LogoutButtonProps) {
  function handleLogout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase("UserDB");
      console.log(router);
      request.onsuccess = () => {
        console.log("IndexedDB successfully deleted");
        router.push("/login");
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting IndexedDB:", event);
        reject(new Error("Error deleting IndexedDB"));
      };

      request.onblocked = () => {
        console.warn(
          "IndexedDB deletion blocked. Close all other tabs using this database.",
        );
      };
    });
  }
  return (
    <Button
      variant="ghost"
      className="justify-start px-2 w-full"
      onClick={handleLogout}
    >
      logout
    </Button>
  );
}

function NewEndpointDialog({ addEndpoint }: NewEndpointDialogProps) {
  const [newEndpointName, setNewEndpointName] = useState("");
  const [newEndpointUrl, setNewEndpointUrl] = useState("");

  const handleAddEndpoint = () => {
    if (newEndpointName.trim() && newEndpointUrl.trim()) {
      addEndpoint({ name: newEndpointName, target: newEndpointUrl });
      setNewEndpointName("");
      setNewEndpointUrl("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-left px-2 py-0 mb-0"
        >
          New Endpoint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Endpoint</DialogTitle>
          <DialogDescription>
            Enter the details for the new endpoint.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Endpoint Name"
            value={newEndpointName}
            onChange={(e) => setNewEndpointName(e.target.value)}
          />
          <Input
            placeholder="Endpoint URL"
            value={newEndpointUrl}
            onChange={(e) => setNewEndpointUrl(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAddEndpoint}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TopBarProps {
  threadName: string | undefined;
  endpoints: Endpoint[];
  selectedEndpoint: Endpoint;
  setSelectedEndpoint: (endpoint: Endpoint) => void;
  addEndpoint: (endpoint: Endpoint) => void;
  router: AppRouterInstance;
}

const USER_RAG_CHUNK_SIZE = 512;
const TEXT_DELIMS = [".\n\n", "\n\n", ".\n", "\n", ". ", "."];

function IngestItem() {
  const { toast } = useToast();

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt"; // Only allow text files
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0] || null;
      if (file) {
        console.debug("Got:", file);
        const text_content = await file.text();
        const chunks = chunkText(
          text_content,
          USER_RAG_CHUNK_SIZE,
          TEXT_DELIMS,
        );
        // TODO: Check this
        const promises = chunks.map(async (chunk) =>
          apiCall(
            "ingest",
            {
              token: (await getTokenFromIndexedDB()) || "NULL_TOKEN",
              chunk_source: file.name,
            },
            { text: chunk },
          ),
        );
        const results = await Promise.all(promises);
        console.debug(results);
        const error_count = results.filter((a) => a.error).length;
        if (error_count > 0) {
          console.error(
            "Failed to ingest",
            error_count,
            "chunk(s) out of",
            results.length,
            "(",
            (error_count / results.length) * 100,
            "% )",
          );
          toast({
            title: "Incomplete Ingestion",
            description: "Some chunks were not ingested.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Successful Ingestion",
            description:
              "The provided document was completely chunked and ingested.",
          });
        }
      }
    };
    input.click();
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className="hover:bg-secondary cursor-pointer"
    >
      Ingest
    </DropdownMenuItem>
  );
}

function TopBar({
  threadName,
  endpoints,
  selectedEndpoint,
  setSelectedEndpoint,
  addEndpoint,
  router,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">{threadName}</h2>
      <div className="flex items-center space-x-2">
        <ModeToggle />
        <EndpointSelect
          endpoints={endpoints}
          selectedEndpoint={selectedEndpoint}
          setSelectedEndpoint={setSelectedEndpoint}
          addEndpoint={addEndpoint}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-lg">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <NewEndpointDialog
              addEndpoint={addEndpoint}
              className="hover:bg-secondary"
            />
            <IngestItem />
            <DropdownMenuItem>
              <Link href="/help">Help</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 w-full">
              <LogoutButton router={router} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Chat Panel Component
interface ChatPanelProps {
  messages: Message[];
}

function ChatPanel({ messages }: ChatPanelProps) {
  return (
    <>
      <style>
        {`
          .hide-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE 10+ */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
        `}
      </style>
      <ScrollArea className="flex flex-col p-4 space-y-4 w-full flex-grow overflow-y-auto hide-scrollbar">
        {messages.map((message, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <div
                className={`relative flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`relative inline-flex flex-col items-start p-3 rounded-[30px] bg-secondary `}
                  style={{
                    borderRadius: "20px / 30px",
                    maxWidth: "80%", // Max width for long messages
                  }}
                >
                  {/* Avatar */}
                  <div
                    className={`absolute top-1 ${
                      message.isUser ? "right-1" : "left-1"
                    }`}
                  >
                    <Avatar>
                      <AvatarImage
                        src={
                          message.isUser
                            ? USER_AVATAR_PLACEHOLDER
                            : THREAD_IMAGE_PLACEHOLDER
                        }
                        alt={message.content}
                      />
                      <AvatarFallback>
                        {message.isUser ? "U" : "R"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Tooltip Trigger: Wrap the message content */}
                  <TooltipTrigger asChild>
                    <div
                      className={`${
                        message.isUser
                          ? "mr-12 ml-2 text-sm mt-1 mb-1"
                          : "ml-12 mr-2 text-sm mt-1 mb-1"
                      }`}
                    >
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </TooltipTrigger>
                </div>
              </div>
              {/* Tooltip Content */}
              <TooltipContent className="absolute -translate-x-1/2 bottom-full mb-4 whitespace-nowrap px-2 py-1 bg-primary text-secondary">
                <p>{message.isUser ? "Sent by you" : "Received"}</p>
              </TooltipContent>
              <div className="mb-4" />
            </Tooltip>
          </TooltipProvider>
        ))}
      </ScrollArea>
    </>
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div style={{ position: "relative" }}>
      <SyntaxHighlighter
        language={language}
        style={materialDark}
        showLineNumbers
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
      <Button
        onClick={handleCopy}
        variant="outline"
        style={{ position: "absolute", top: "10px", right: "10px" }}
      >
        <Copy /> Copy
      </Button>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Markdown
      className="display-block"
      components={{
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <CodeBlock
              language={match[1]}
              code={String(children).replace(/\n$/, "")}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}

// Input Area Component
interface InputAreaProps {
  onSendMessage: (text: string) => void;
}

function InputArea({ onSendMessage }: InputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="flex items-center p-4 border-t">
      <style>
        {`
        .scrollable-content {
          overflow-y: auto;
          max-height: 300px; /* Adjust this value to control the textarea scrollable height */
        }
      `}
      </style>
      <div className="flex-grow mr-3">
        <ScrollArea>
          <div className="scrollable-content">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full mb-0 border rounded resize-none"
              rows={1}
              style={{ overflow: "hidden" }}
            />
          </div>
        </ScrollArea>
      </div>
      <Button
        onClick={handleSend}
        className="flex items-center justify-center"
        variant="outline"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
