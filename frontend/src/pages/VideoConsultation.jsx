import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiMessageSquare, FiMaximize2, FiUsers, FiSettings } from "react-icons/fi";

export default function VideoConsultation() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "doctor", text: "Hello! How are you feeling today?", time: "3:00 PM" },
    { from: "patient", text: "I've been having chest pain since yesterday.", time: "3:01 PM" },
    { from: "doctor", text: "I see. Can you describe the pain? Is it sharp or dull?", time: "3:01 PM" },
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [duration, setDuration] = useState("00:04:32");

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages((prev) => [...prev, { from: "patient", text: newMsg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setNewMsg("");
  };

  const endCall = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-medium text-sm">Dr. Sarah Johnson</span>
          <span className="text-gray-400 text-sm">· {duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
            <FiUsers size={16} />
          </button>
          <button className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
            <FiSettings size={16} />
          </button>
          <button className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
            <FiMaximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Main video (doctor) */}
        <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
              SJ
            </div>
            <p className="text-white font-medium">Dr. Sarah Johnson</p>
            <p className="text-gray-400 text-sm">Cardiologist</p>
          </div>

          {/* Self video (small) */}
          <div className="absolute bottom-4 right-4 w-36 h-24 bg-gray-700 rounded-2xl overflow-hidden border-2 border-gray-600 flex items-center justify-center">
            {camOn ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                  You
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <FiVideoOff size={20} />
                <span className="text-xs">Camera off</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-gray-800 border-l border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-medium text-sm">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "patient" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.from === "patient" ? "bg-primary-600 text-white" : "bg-gray-700 text-gray-100"
                  }`}>
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button onClick={sendMessage} className="p-2 bg-primary-600 rounded-xl text-white hover:bg-primary-700 transition-colors">
                <FiMessageSquare size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-6 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-500 text-white"}`}
        >
          {micOn ? <FiMic size={22} /> : <FiMicOff size={22} />}
        </button>

        <button
          onClick={() => setCamOn(!camOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${camOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-500 text-white"}`}
        >
          {camOn ? <FiVideo size={22} /> : <FiVideoOff size={22} />}
        </button>

        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg"
        >
          <FiPhone size={24} className="rotate-[135deg]" />
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${chatOpen ? "bg-primary-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"}`}
        >
          <FiMessageSquare size={22} />
        </button>

        <button className="w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center transition-all">
          <FiMaximize2 size={22} />
        </button>
      </div>
    </div>
  );
}
