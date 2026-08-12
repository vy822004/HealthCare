import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat sessions and user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("/api/profile");
        setUser(res.data.user);
        
        // Update first message if it's a new chat
        setMessages(prev => {
          if (prev.length === 1 && prev[0].role === "assistant" && prev[0].content === "How can I help you today?") {
            return [{ role: "assistant", content: `How can I help you today, ${res.data.user.name.split(' ')[0]}?` }];
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    fetchUser();
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
    setMessages([{ role: "assistant", content: `How can I help you today${user ? ', ' + user.name.split(' ')[0] : ''}?` }]);
  };

  const deleteChat = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      await axios.delete(`/api/chatbot/history/${id}`, { withCredentials: true });
      setChatSessions(prev => prev.filter(c => c._id !== id));
      if (chatId === id) {
        startNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
      alert("Failed to delete chat.");
    }
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
    <div className="flex flex-col h-screen bg-transparent text-white font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white/5 backdrop-blur-xl flex flex-col p-4 border-r border-white/10 shrink-0">
        

        <Link to="/" className="text-gray-400 hover:text-white text-sm mb-4 flex items-center transition group px-2">
          <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Dashboard
        </Link>

        <button 
          onClick={startNewChat}
          className="border border-white/20 rounded-md p-3 hover:bg-white/10 transition flex items-center justify-center font-medium mb-4 bg-white/5"
        >
          + New Chat
        </button>

        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold px-2">Recent Chats</p>
          {chatSessions.map((session) => (
            <div 
              key={session._id}
              onClick={() => loadChat(session._id)}
              className={`p-2.5 rounded-md cursor-pointer transition flex items-center justify-between group text-sm ${chatId === session._id ? 'bg-blue-600/30 border border-blue-500/30 text-white shadow-sm' : 'text-gray-300 hover:bg-white/10'}`}
              title={session.title}
            >
              <div className="flex items-center truncate mr-2">
                <span className="mr-2 opacity-70">💬</span>
                <span className="truncate">{session.title}</span>
              </div>
              <button 
                onClick={(e) => deleteChat(e, session._id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
                title="Delete Chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
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
                className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-md ${
                  msg.role === "user"
                    ? "bg-blue-600/90 text-white rounded-br-sm border border-blue-500/50"
                    : "bg-white/10 text-gray-100 border border-white/10 rounded-bl-sm prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white/10 backdrop-blur-md text-gray-300 px-5 py-3 rounded-2xl rounded-bl-sm border border-white/10 animate-pulse text-sm">
                 Typing...
               </div>
             </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-transparent border-t border-white/10">
          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 shadow-lg focus-within:ring-1 focus-within:ring-blue-500/50 transition">
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
    </div>
  );
}