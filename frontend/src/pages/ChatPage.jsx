import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiSend, FiPaperclip, FiVideo, FiPhone, FiMoreVertical, FiSmile } from "react-icons/fi";
import { Link } from "react-router-dom";

const conversations = [
  { id: 1, name: "Dr. Sarah Johnson", role: "Cardiologist", lastMsg: "See you at 3 PM tomorrow!", time: "2m", unread: 2, online: true },
  { id: 2, name: "Dr. Michael Chen",  role: "Neurologist",  lastMsg: "Your test results look good.", time: "1h", unread: 0, online: false },
  { id: 3, name: "Dr. Emily Davis",   role: "Dermatologist",lastMsg: "Apply the cream twice daily.", time: "2h", unread: 1, online: true },
  { id: 4, name: "Support Team",      role: "Healthcare",   lastMsg: "How can we help you today?", time: "1d", unread: 0, online: true },
];

const initialMessages = {
  1: [
    { id: 1, from: "doctor", text: "Hello! How are you feeling today?", time: "2:55 PM" },
    { id: 2, from: "me",     text: "Much better, thank you! The medication is working.", time: "2:57 PM" },
    { id: 3, from: "doctor", text: "That's great to hear! Keep taking it as prescribed.", time: "2:58 PM" },
    { id: 4, from: "doctor", text: "See you at 3 PM tomorrow!", time: "3:00 PM" },
  ],
};

export default function ChatPage() {
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [messages, setMessages] = useState(initialMessages[1] || []);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages((prev) => [...prev, {
      id: Date.now(), from: "me", text: newMsg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setNewMsg("");
  };

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 lg:-m-6 overflow-hidden rounded-2xl border border-gray-100 shadow-card">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9 text-sm py-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${activeConv.id === conv.id ? "bg-primary-50" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm">
                  {conv.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 text-sm truncate">{conv.name}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-500 truncate">{conv.lastMsg}</p>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 ml-2 font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm">
                {activeConv.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              {activeConv.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{activeConv.name}</p>
              <p className="text-xs text-gray-500">{activeConv.online ? "Online" : "Offline"} · {activeConv.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/video-call/1" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <FiVideo size={18} />
            </Link>
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <FiPhone size={18} />
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <FiMoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              {msg.from !== "me" && (
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
                  {activeConv.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className={`max-w-[65%] ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  msg.from === "me"
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-primary-400 transition-colors">
            <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <FiPaperclip size={18} />
            </button>
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <FiSmile size={18} />
            </button>
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim()}
              className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            >
              <FiSend size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
