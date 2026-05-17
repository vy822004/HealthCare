import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);

    // Dummy response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "This is a demo response." }
      ]);
    }, 600);

    setInput("");
  };

  return (
    <div className="flex h-screen bg-[#343541] text-white">

      {/* Sidebar */}
      <div className="w-64 bg-[#202123] flex flex-col p-3">
        <button className="border border-gray-600 rounded-md p-2 hover:bg-gray-700 transition">
          + New Chat
        </button>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          <div className="p-2 rounded-md hover:bg-gray-700 cursor-pointer">
            Chat 1
          </div>
          <div className="p-2 rounded-md hover:bg-gray-700 cursor-pointer">
            Chat 2
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[700px] px-4 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#19c37d] text-white"
                    : "bg-[#444654]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-700 bg-[#343541]">
          <div className="flex items-center bg-[#40414f] rounded-lg px-3 py-2">
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Message AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-3 bg-[#19c37d] px-4 py-1 rounded-md hover:opacity-90"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}