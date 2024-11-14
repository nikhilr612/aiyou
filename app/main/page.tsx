"use client"; 

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/ui/modetoggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; 
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"; 
import { Plus, Send, Check, ChevronsUpDown, Copy } from "lucide-react"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Message, Endpoint, agentic_call } from "@/lib/llmcall";
import Markdown from "react-markdown";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import Link from "next/link";

import  materialDark  from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";

interface Thread {
  id: number;
  name: string;
}

const THREAD_IMAGE_PLACEHOLDER: string = "/images/bot-avatar.png";
const USER_AVATAR_PLACEHOLDER: string = "/images/user-avatar.png";

const initialEndpoints: Endpoint[] = [
  { name: "ollama-local", target: "http://localhost:11434" },
];

export default function MainPage() {
  const [threads, setThreads] = useState<Thread[]>([{ id: 1, name: "Thread" }]);

  const [currentThread, setCurrentThread] = useState<Thread>(threads[0]);

  type ThreadMap = { [key: number]: Message[] };

  const [messages, setMessages] = useState<ThreadMap>({
    1: [],
    2: [],
  });

  const [search, setSearch] = useState("");

  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(initialEndpoints[0]);
  
  // For sShowing toasts.
  const { toast } = useToast();

  useEffect(() => {
    const storedThreads = localStorage.getItem('AIYOU_threads');
    setThreads(storedThreads ? JSON.parse(storedThreads) : [{ id: 1, name: "Thread" }]);

    const storedMessages = localStorage.getItem('AIYOU_messages');
    setMessages(storedMessages ? JSON.parse(storedMessages) : {
      1: [],
      2: [],
    });

    const storedCurrentThread = localStorage.getItem('AIYOU_currentThread');
    setCurrentThread(storedCurrentThread ? JSON.parse(storedCurrentThread) : threads[0]);
  }, []);

  useEffect(() => {
    localStorage.setItem('AIYOU_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('AIYOU_currentThread', JSON.stringify(currentThread));
  }, [currentThread]);

  useEffect(() => {
    localStorage.setItem('AIYOU_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = { content: text, isUser: true };
    
    setMessages(msgs => {
      return {...msgs, [currentThread.id]: [...msgs[currentThread.id], newMessage]};
    });

    try {
      const response = await agentic_call(selectedEndpoint, messages[currentThread.id], text);
      const response_message: Message = { content: response, isUser: false };
      if (response.trim().length > 0) {
        setMessages(msgs => {
          return {...msgs, [currentThread.id]: [...msgs[currentThread.id], response_message]};
        });
      }
    } catch (error) {
      console.error("Error occurred during LLM call\n", error);
      toast({
        title: "LLM call failed",
        description: "An unexpected error occurred during call to LLM endpoint. Check logs.",
        variant: "destructive"
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

  const respondToUserMessage = (endpoint: Endpoint, chatHistory: Message[], userMessage: Message) : string => {
    // Implement the logic to respond to the user's message using the endpoint, chat history, and user message
    console.log("Endpoint:", endpoint);
    console.log("Chat History:", chatHistory);
    console.log("User Message:", userMessage);
    // Example: Make an API call to the endpoint with the chat history and user message
    throw new Error("Not implemented!");
  };

  const addEndpoint = (endpoint: Endpoint) => {
    setEndpoints([...endpoints, endpoint]);
    setSelectedEndpoint(endpoint);
    toast({
      title: "Created New Endpoint",
      description: `You can now choose ${endpoint.name} to connect to ${endpoint.target}`,
      duration: 1000
    })
  };

  return (
    <div className="flex h-screen" style={{overflow: "hidden"}}>
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

function SidePanel({ threads, onSelectThread, onNewThread, search, setSearch }: SidePanelProps) {
  const filteredThreads = threads.filter((thread) =>
    thread.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 p-4 border-r hidden lg:block h-full">
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search..."
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
            className="cursor-pointer p-2 rounded"
          >
            <CardContent className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={THREAD_IMAGE_PLACEHOLDER} alt={thread.name} />
                <AvatarFallback>{thread.name[0]}</AvatarFallback>
              </Avatar>
              <span>{thread.name}</span>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </aside>
  );
}

interface EndpointSelectProps {
  endpoints: Endpoint[];
  selectedEndpoint: Endpoint;
  setSelectedEndpoint: (endpoint: Endpoint) => void;
}

function EndpointSelect({ endpoints, selectedEndpoint, setSelectedEndpoint }: EndpointSelectProps) {
  const [open, setOpen] = useState(false)

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
                  onSelect={(currentValue: string) => {
                    const endpoint = endpoints.find(ep => ep.target === currentValue)
                    if (endpoint) setSelectedEndpoint(endpoint)
                    setOpen(false)
                  }}
                >
                  {endpoint.name}
                  <Check className={selectedEndpoint.target === endpoint.target ? "visible" : "invisible"} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface NewEndpointDialogProps {
  addEndpoint: (endpoint: Endpoint) => void;
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
        <Button variant="ghost">New Endpoint</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Endpoint</DialogTitle>
          <DialogDescription>Enter the details for the new endpoint.</DialogDescription>
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
}


interface IngestItemProps {
    onFileIngested: (file: File) => Promise<void>;
}

function IngestItem({ onFileIngested } : IngestItemProps) {

    const handleClick = () => {
      const input = document.createElement('input'); input.type = 'file'; input.accept = '.txt'; // Only allow text files 
      input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0] || null; 
          if (file) await onFileIngested(file);
      };
      input.click();
    };

    return (<DropdownMenuItem onClick={handleClick}>Ingest</DropdownMenuItem>);
};


function TopBar({ threadName, endpoints, selectedEndpoint, setSelectedEndpoint, addEndpoint }: TopBarProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">{threadName}</h2>
      <div className="flex items-center space-x-2">
        <ModeToggle />
        <EndpointSelect
          endpoints={endpoints}
          selectedEndpoint={selectedEndpoint}
          setSelectedEndpoint={setSelectedEndpoint}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-lg">⋮</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <IngestItem onFileIngested={ async (f) => { 
              console.log(await f.text());
            } }/>
            <DropdownMenuItem><Link href="/help">Help</Link></DropdownMenuItem>
            <NewEndpointDialog addEndpoint={addEndpoint} />
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
    <ScrollArea className="flex flex-col p-4 space-y-4 flex-grow overflow-y-auto">
      {messages.map((message, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center space-x-3 p-2 rounded ${
                  message.isUser ? "self-end" : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={ message.isUser ? USER_AVATAR_PLACEHOLDER : THREAD_IMAGE_PLACEHOLDER } alt={ message.content } />
                  <AvatarFallback>{ message.isUser ? "U" : "R" }</AvatarFallback>
                </Avatar>
                <MarkdownRenderer content={message.content}/>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message.isUser ? "Sent by you" : "Received"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </ScrollArea>
  );
}

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div style={{position: "relative"}}>
      <SyntaxHighlighter
        language={language}
        style={materialDark}
        showLineNumbers
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
      <Button onClick={handleCopy} variant="outline" style = {{position: "absolute", top: "10px", right: "10px"}} >
        <Copy/> Copy
      </Button>
    </div>
  )
}

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Markdown
      className="display-block"
      components={{
        code(props) {
          const { children, className, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <CodeBlock
              {...rest}
              language={match[1]}
              code={String(children).replace(/\n$/, '')}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </Markdown>
  )
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
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow p-2 border rounded resize-none"
        rows={1}
        style={{ overflow: "hidden" }}
      />
      <Button onClick={handleSend} className="ml-2" variant="outline">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}