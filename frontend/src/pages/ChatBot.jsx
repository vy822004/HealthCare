import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await axios.get("/api/chatbot/history", { withCredentials: true });
      setChatSessions(res.data);
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const loadChat = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/chatbot/history/${id}`, { withCredentials: true });
      setChatId(id);
      
      const formattedMessages = res.data.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      setMessages([
        { role: "assistant", content: "Here is your past conversation." },
        ...formattedMessages
      ]);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setChatId(null);
    setMessages([{ role: "assistant", content: "How can I help you today?" }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/chatbot/chat", {
        message: currentInput,
        chatId: chatId
      }, {
        withCredentials: true
      });

      const aiReply = response.data.reply;
      if (response.data.chatId) {
          setChatId(response.data.chatId);
          loadSessions(); // Refresh sidebar titles
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: aiReply }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error occurred";
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Error: Could not connect to the AI Agent. (${errorMessage})` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#343541] text-white font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-[#202123] flex flex-col p-3 border-r border-gray-700">
        <button 
          onClick={startNewChat}
          className="border border-gray-600 rounded-md p-3 hover:bg-gray-700 transition flex items-center justify-center font-medium mb-4"
        >
          + New Chat
        </button>

        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold px-2">Recent Chats</p>
          {chatSessions.map((session) => (
            <div 
              key={session._id}
              onClick={() => loadChat(session._id)}
              className={`p-3 rounded-md cursor-pointer transition truncate text-sm ${chatId === session._id ? 'bg-[#343541] text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800'}`}
              title={session.title}
            >
              💬 {session.title}
            </div>
          ))}
          {chatSessions.length === 0 && (
            <p className="text-gray-500 text-sm italic px-2">No previous chats</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-[#444654] text-gray-100 border border-gray-700 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-[#444654] text-gray-300 px-5 py-3 rounded-2xl rounded-bl-sm border border-gray-700 animate-pulse text-sm">
                 Typing...
               </div>
             </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#343541]">
          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-center bg-[#40414f] border border-gray-600 rounded-xl px-4 py-3 shadow-lg focus-within:ring-1 focus-within:ring-gray-400 transition">
              <input
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                placeholder="Ask about your medical history or symptoms..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`ml-3 px-4 py-1.5 rounded-lg font-medium transition ${loading || !input.trim() ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
              >
                Send
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              AI Agents can make mistakes. Always consult a real doctor for medical advice.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}