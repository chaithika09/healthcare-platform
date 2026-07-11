import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend, FiRefreshCw, FiHeart, FiActivity,
  FiAlertCircle, FiInfo, FiMic
} from "react-icons/fi";
import { useAuthStore } from "../store/authStore";

// ── AI Knowledge Base ─────────────────────────────────────────
const KB = {
  greetings: ["hello","hi","hey","good morning","good evening","howdy","what's up"],
  farewells:  ["bye","goodbye","see you","take care","thanks","thank you"],

  symptoms: {
    headache: {
      response: "**Headache** can have many causes:\n\n• **Tension headache** — stress, poor posture, eye strain\n• **Migraine** — throbbing pain, nausea, light sensitivity\n• **Dehydration** — drink more water\n• **Hypertension** — if severe, check BP\n\n💊 **Home relief:** Rest in a dark room, drink water, take OTC pain relief (ibuprofen/paracetamol)\n\n⚠️ **See a doctor if:** headache is sudden & severe, with fever/stiff neck, or after head injury.",
      tags: ["headache","head pain","head ache","migraine","head hurts"]
    },
    fever: {
      response: "**Fever** (temp > 38°C / 100.4°F):\n\n• **Low-grade (38–39°C):** Common cold, flu, minor infection\n• **High fever (>39°C):** Bacterial infection, serious illness\n• **With chills & sweating:** Possible flu or malaria\n\n🌡️ **Home care:** Rest, drink fluids, paracetamol/ibuprofen\n\n⚠️ **Go to ER immediately if:** temp > 40°C, seizures, difficulty breathing, neck stiffness, or rash.",
      tags: ["fever","temperature","high temp","chills","sweating"]
    },
    cough: {
      response: "**Cough** types and causes:\n\n• **Dry cough** — viral infection, allergies, asthma\n• **Wet/productive cough** — bacterial infection, bronchitis\n• **Persistent cough (>3 weeks)** — TB, asthma, GERD, or lung issue\n\n💊 **Home relief:** Honey & warm water, steam inhalation, stay hydrated\n\n⚠️ **See doctor if:** coughing blood, shortness of breath, fever > 3 days, or weight loss.",
      tags: ["cough","coughing","throat","dry cough","wet cough"]
    },
    chest_pain: {
      response: "⚠️ **CHEST PAIN — Take seriously!**\n\n• **Sharp & stabbing** — muscle strain, pleuritis\n• **Pressure/squeezing** — possible heart attack\n• **With shortness of breath** — heart or lung issue\n• **After eating** — GERD/acid reflux\n\n🚨 **CALL 911 / EMERGENCY if:**\n- Crushing chest pain\n- Pain spreads to left arm, jaw, or back\n- Sweating, nausea, dizziness\n- Sudden shortness of breath\n\n❤️ Do NOT ignore chest pain — always consult a doctor.",
      tags: ["chest pain","chest","heart pain","chest tightness","chest pressure","heart attack"]
    },
    stomach: {
      response: "**Stomach Pain / Abdominal Pain:**\n\n• **Upper abdomen** — GERD, gastritis, ulcer\n• **Lower right** — appendicitis (seek emergency care)\n• **Cramping + diarrhea** — food poisoning, IBS\n• **Bloating** — gas, constipation, lactose intolerance\n\n💊 **Home care:** Small meals, avoid spicy food, drink water, antacids for GERD\n\n⚠️ **See doctor if:** severe/sudden pain, pain with fever, blood in stool, pain > 6 hours.",
      tags: ["stomach","stomach pain","abdomen","belly","tummy","abdominal","nausea","vomiting"]
    },
    back_pain: {
      response: "**Back Pain** — very common:\n\n• **Lower back** — muscle strain, poor posture, disc issues\n• **Upper back** — muscle tension, poor ergonomics\n• **With leg pain/numbness** — possible sciatica or disc herniation\n\n💪 **Home care:**\n- Apply ice (first 48hrs) then heat\n- Gentle stretching & walking\n- Avoid prolonged sitting\n- OTC pain relievers\n\n⚠️ **See doctor if:** pain after injury, bladder/bowel issues, numbness in legs, severe pain.",
      tags: ["back pain","back ache","lower back","spine","backache"]
    },
    breathing: {
      response: "**Breathing Difficulty / Shortness of Breath:**\n\n• **Mild** — anxiety, mild asthma, physical exertion\n• **With wheezing** — asthma or allergic reaction\n• **Sudden onset** — possible pulmonary embolism\n• **With chest pain** — cardiac issue\n\n🚨 **EMERGENCY — Call 911 if:**\n- Cannot complete sentences\n- Lips/fingers turning blue\n- Sudden severe breathlessness\n- With chest pain\n\n💊 Asthma patients: use inhaler and sit upright.",
      tags: ["breathing","shortness of breath","breathless","wheezing","can't breathe","difficulty breathing"]
    },
    diabetes: {
      response: "**Diabetes Management Tips:**\n\n🩸 **Type 1:** Body doesn't produce insulin — requires insulin therapy\n🩸 **Type 2:** Body doesn't use insulin well — managed with diet, exercise, medication\n\n✅ **Daily management:**\n- Monitor blood sugar regularly\n- Eat low-glycemic foods\n- Exercise 30 min/day\n- Take medications as prescribed\n- Regular HbA1c checks (every 3 months)\n\n⚠️ **Warning signs:** excessive thirst, frequent urination, blurred vision, slow wound healing\n\n📋 Book an appointment with an endocrinologist for personalized care.",
      tags: ["diabetes","blood sugar","insulin","diabetic","glucose","hba1c"]
    },
    hypertension: {
      response: "**High Blood Pressure (Hypertension):**\n\n📊 **Normal:** < 120/80 mmHg\n⚠️ **High:** > 130/80 mmHg\n🚨 **Crisis:** > 180/120 mmHg\n\n✅ **Lifestyle changes:**\n- Reduce salt intake\n- Exercise regularly\n- Maintain healthy weight\n- Quit smoking\n- Limit alcohol\n- Manage stress\n\n💊 Medications: ACE inhibitors, beta-blockers, calcium channel blockers\n\n📋 Monitor BP daily and keep a log to share with your doctor.",
      tags: ["hypertension","blood pressure","high bp","bp","pressure"]
    },
    cold: {
      response: "**Common Cold / Flu:**\n\n🦠 **Cold symptoms:** runny nose, sore throat, mild fever, sneezing\n🤒 **Flu symptoms:** high fever, body aches, fatigue, headache\n\n💊 **Home remedies:**\n- Rest and sleep\n- Drink warm fluids (tea, soup, warm water)\n- Honey & ginger tea\n- Steam inhalation\n- Vitamin C & Zinc supplements\n- OTC cold medicine\n\n⚠️ **See doctor if:** fever > 39°C, symptoms > 10 days, difficulty breathing, or underlying conditions.",
      tags: ["cold","flu","runny nose","sore throat","sneezing","body ache","congestion"]
    },
  },

  health_tips: [
    "💧 Drink 8 glasses of water daily to stay hydrated.",
    "🏃 Exercise at least 30 minutes a day — even a brisk walk counts!",
    "😴 Get 7-9 hours of sleep every night for optimal health.",
    "🥗 Eat 5 servings of fruits and vegetables daily.",
    "🧘 Practice meditation or deep breathing to manage stress.",
    "🚭 Avoid smoking — it's the leading cause of preventable disease.",
    "🩺 Get regular health check-ups even when you feel well.",
    "💊 Never skip prescribed medications without consulting your doctor.",
    "🧴 Wash your hands frequently to prevent infections.",
    "☀️ Get 15-20 minutes of sunlight daily for Vitamin D.",
  ],

  appointments: {
    response: "📅 **Booking an Appointment:**\n\n1. Go to **'Find Doctors'** in the sidebar\n2. Filter by specialty or search by name\n3. Click on a doctor's profile\n4. Select **'Book Slot'** tab\n5. Choose your date and time\n6. Select consultation type (Video/In-person)\n7. Confirm and pay\n\n✅ You'll receive a confirmation email and reminder 24 hours before.\n\nNeed help finding a specific specialist? Tell me your symptoms!",
    tags: ["appointment","book","schedule","doctor","consult","visit"]
  },

  emergency: {
    response: "🚨 **EMERGENCY — Call Immediately:**\n\n📞 **911** — Life-threatening emergency\n📞 **988** — Mental health crisis\n📞 **1-800-222-1222** — Poison control\n\n⚠️ **Go to ER immediately for:**\n- Chest pain or difficulty breathing\n- Signs of stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call)\n- Severe allergic reaction\n- Uncontrolled bleeding\n- Loss of consciousness\n- Severe burns\n\n🚑 You can also book an ambulance in the **Emergency** section of this app.",
    tags: ["emergency","911","urgent","serious","critical","ambulance","ER","hospital"]
  },
};

// ── Find best response ────────────────────────────────────────
const findResponse = (input) => {
  const text = input.toLowerCase().trim();

  // Greetings
  if (KB.greetings.some(g => text.includes(g))) {
    return {
      text: "👋 Hello! I'm **HealthBot**, your AI health assistant.\n\nI can help you with:\n• 🩺 Symptom information\n• 💊 Health tips\n• 📅 Booking appointments\n• 🚨 Emergency guidance\n\nHow can I help you today?",
      type: "bot"
    };
  }

  // Farewells
  if (KB.farewells.some(f => text.includes(f))) {
    return {
      text: "Take care and stay healthy! 💙\n\nRemember: Regular check-ups keep you healthy. Don't hesitate to come back if you have more questions!",
      type: "bot"
    };
  }

  // Emergency
  if (KB.emergency.tags.some(t => text.includes(t))) {
    return { text: KB.emergency.response, type: "bot", urgent: true };
  }

  // Appointments
  if (KB.appointments.tags.some(t => text.includes(t))) {
    return { text: KB.appointments.response, type: "bot" };
  }

  // Symptoms
  for (const data of Object.values(KB.symptoms)) {
    if (data.tags.some(tag => text.includes(tag))) {
      return { text: data.response, type: "bot" };
    }
  }

  // Health tips
  if (text.includes("tip") || text.includes("advice") || text.includes("healthy") || text.includes("health tip")) {
    const tip = KB.health_tips[Math.floor(Math.random() * KB.health_tips.length)];
    return {
      text: `Here's a health tip for you:\n\n${tip}\n\nWant more tips? Just ask!`,
      type: "bot"
    };
  }

  // BMI calculation
  if (text.includes("bmi") || (text.includes("weight") && text.includes("height"))) {
    return {
      text: "**BMI Calculator:**\n\nBMI = weight(kg) ÷ height(m)²\n\n📊 **BMI Ranges:**\n• < 18.5 — Underweight\n• 18.5–24.9 — Normal weight ✅\n• 25–29.9 — Overweight\n• ≥ 30 — Obese\n\nTell me your weight (kg) and height (cm) and I'll calculate it for you!",
      type: "bot"
    };
  }

  // BMI calculation with numbers
  const weightMatch = text.match(/(\d+)\s*kg/);
  const heightMatch = text.match(/(\d+)\s*cm/);
  if (weightMatch && heightMatch) {
    const w = parseFloat(weightMatch[1]);
    const h = parseFloat(heightMatch[1]) / 100;
    const bmi = (w / (h * h)).toFixed(1);
    let category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal ✅" : bmi < 30 ? "Overweight" : "Obese";
    return {
      text: `**Your BMI Result:**\n\n⚖️ BMI = **${bmi}**\n📊 Category: **${category}**\n\n${bmi >= 25 ? "💡 Consider consulting a nutritionist and increasing physical activity." : "Great! Maintain your healthy lifestyle! 💪"}`,
      type: "bot"
    };
  }

  // Default
  return {
    text: "I'm not sure about that. Could you be more specific? Try asking about:\n\n• A symptom (e.g. *'I have a headache'*)\n• A condition (e.g. *'Tell me about diabetes'*)\n• Health tips (e.g. *'Give me a health tip'*)\n• Appointments (e.g. *'How do I book a doctor?'*)\n• Emergency info (e.g. *'I need emergency help'*)",
    type: "bot"
  };
};

// ── Quick suggestions ─────────────────────────────────────────
const SUGGESTIONS = [
  "I have a headache", "I have fever", "Chest pain symptoms",
  "How to book appointment", "Give me a health tip", "Emergency help",
  "Tell me about diabetes", "Back pain relief", "Calculate my BMI",
];

// ── Format markdown-like text ─────────────────────────────────
const formatText = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
};

// ── Main Component ────────────────────────────────────────────
export default function AIChatbot() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: 1, type: "bot", urgent: false,
      text: `👋 Hello ${user?.name?.split(" ")[0] || "there"}! I'm **HealthBot**, your AI health assistant.\n\nI can help you with:\n• 🩺 Symptom checker & health information\n• 💊 Medication & treatment guidance\n• 📅 Appointment booking help\n• 🧮 BMI calculator\n• 🚨 Emergency guidance\n• 💡 Daily health tips\n\nHow can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg = {
      id: Date.now(), type: "user", text: msgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    const response = findResponse(msgText);
    const botMsg = {
      id: Date.now() + 1,
      type: "bot",
      text: response.text,
      urgent: response.urgent || false,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), type: "bot", urgent: false,
      text: "Chat cleared! How can I help you today? 😊",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="card p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-gray-900">AI Health Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-medium">Online · Always available</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              <FiHeart size={10} /> Symptom Checker
            </span>
            <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-full">
              <FiActivity size={10} /> Health Tips
            </span>
          </div>
          <button onClick={clearChat} title="Clear chat"
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2">
        <FiInfo size={14} className="text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          HealthBot provides general health information only — not medical advice. Always consult a qualified doctor for diagnosis and treatment.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} gap-2.5`}
            >
              {msg.type === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0 self-end shadow-sm">
                  <span className="text-sm">🤖</span>
                </div>
              )}

              <div className={`max-w-[80%] ${msg.type === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.type === "user"
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : msg.urgent
                    ? "bg-red-50 border border-red-200 text-gray-900 rounded-bl-sm"
                    : "bg-white border border-gray-100 text-gray-900 shadow-sm rounded-bl-sm"
                }`}>
                  {msg.urgent && (
                    <div className="flex items-center gap-1.5 text-red-600 font-semibold text-xs mb-2">
                      <FiAlertCircle size={12} /> URGENT — Medical Emergency
                    </div>
                  )}
                  <div
                    className="whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                  />
                </div>
                <span className="text-xs text-gray-400 px-1">{msg.time}</span>
              </div>

              {msg.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0 self-end text-white font-bold text-xs shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-primary-400 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => sendMessage(s)}
            className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 rounded-full text-xs text-gray-600 hover:text-primary-600 transition-all">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="card p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 focus-within:border-primary-400 focus-within:bg-white rounded-2xl px-4 py-2.5 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask me about symptoms, health tips, appointments..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button className="text-gray-300 hover:text-primary-500 transition-colors flex-shrink-0">
              <FiMic size={16} />
            </button>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all shadow-primary flex-shrink-0"
          >
            <FiSend size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send · Not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
}
