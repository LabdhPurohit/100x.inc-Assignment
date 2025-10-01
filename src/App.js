import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Single-file React component using TailwindCSS + Framer Motion
// "Sophia — Your AI Friend" (Chat + Voice)
export default function App() {
  // ---- Page title ----
  useEffect(() => {
    document.title = "Sophia — Your AI Friend";
  }, []);

  // ---- Chat state ----
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // ---- Voice state ----
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [howtoOpen, setHowtoOpen] = useState(false);
  const recognitionRef = useRef(null);
  const chatBoxRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const voiceOpenRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { voiceOpenRef.current = voiceOpen; }, [voiceOpen]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);

  // ---- Init SpeechRecognition ----
  useEffect(() => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return; // gracefully fail on unsupported browsers
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart listening if voice modal is open and not speaking
        if (voiceOpenRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
          setTimeout(() => {
            try { recognition.start(); } catch (e) {}
          }, 200);
        }
      };
      recognition.onresult = (event) => {
        const message = event.results[event.results.length - 1][0].transcript;
        voiceAsk(message);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("SpeechRecognition not available:", e);
    }
  }, []);

  // ---- Smooth scroll to bottom on new messages ----
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  // ---- AUDIO PRIMING ----
  const primeAudio = () => {
    const audioElement = document.getElementById("botAudio");
    if (!audioElement) return;
    audioElement.src =
      "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCA" +
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    audioElement.play().catch(() => {});
  };

  // ---- Helper: sanitize bot text replies (remove trailing artifacts like </s>) ----
  const sanitizeText = (text) => {
    let out = (text ?? "");
    // Remove trailing common tag artifacts and extra whitespace
    out = out.replace(/\s*<\/?s>\s*$/gi, "");
    // Remove any trailing HTML-like tags at the end
    out = out.replace(/\s*<[^>]+>\s*$/g, "");
    // Trim quotes sometimes wrapped around LLM output
    out = out.replace(/^"|"$/g, "");
    return out.trim();
  };

  // ---- CHAT MODE ----
  const sendChatMessage = async () => {
    const text = inputMessage.trim();
    if (!text) return;

    setChatMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputMessage("");

    try {
      const response = await fetch("http://13.211.175.13:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      const botReply = sanitizeText(data?.reply ?? "(No response)");
      setChatMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I couldn't reach the server." },
      ]);
    }
  };

  // ---- VOICE MODE ----
  const voiceAsk = async (message) => {
    const messageTrimmed = (message || "").trim();
    setChatMessages((prev) => [...prev, { role: "user", content: messageTrimmed }]);
    setIsProcessing(true);

    try {
      const response = await fetch("http://13.211.175.13:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageTrimmed }),
      });
      const data = await response.json();
      const botReply = sanitizeText(data?.reply ?? "(No response)");
      // Show only a lightweight status in chat for voice replies
      setChatMessages((prev) => [
        ...prev,
        { role: "system", content: "(Replied by voice)" },
      ]);
      // TTS
      const ttsResponse = await fetch("http://13.211.175.13:8000/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: botReply }),
      });

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = document.getElementById("botAudio");
        if (audioElement) {
          audioElement.src = audioUrl;
          setIsSpeaking(true);
          setIsProcessing(false);
          audioElement.onended = () => {
            setIsSpeaking(false);
            // Automatically resume listening for continuous conversation when modal is open
            if (voiceOpenRef.current && recognitionRef.current && !isProcessingRef.current) {
              setTimeout(() => {
                try { recognitionRef.current.start(); } catch (_) {}
              }, 200);
            }
          };
          audioElement.play().catch(() => {
            alert("🔊 Please tap the play button once to enable audio");
          });
        }
      }
    } catch (err) {
      console.error("Voice error:", err);
    } finally {
      if (!isSpeakingRef.current) setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      primeAudio();
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognationSafe()) recognitionRef.current.stop();
  };
  const openVoice = () => {
    setVoiceOpen(true);
    setIsProcessing(false);
    startListening();
  };

  const closeVoice = () => {
    setVoiceOpen(false);
    stopListening();
  };

  const recognationSafe = () => !!recognitionRef.current && isListening;

  // ---- Variants ----
  const msgVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0b10] text-white will-change-transform motion-reduce:transition-none">
      {/* Background animated blobs + gradient veil */}
      <BackgroundFX />

      {/* Page wrapper */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Sophia — Your AI Friend</h1>
            <p className="mt-1 text-sm/6 text-white/70">the AI that listens, speaks, and feels real.</p>
          </div>
          <div>
            <button onClick={() => setHowtoOpen(true)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/85 backdrop-blur-md hover:bg-white/15">How to use</button>
          </div>
        </header>

        {/* How to use button moved to modal */}

        {/* Chat layout */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
          {/* Chat Section */}
          <section className="relative rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-lg shadow-[0_0_24px_rgba(99,102,241,0.12)] lg:p-6">
            <h2 className="mb-3 text-lg font-medium text-white/90">💬 Chat</h2>

            {/* Chat window */}
            <div
              ref={chatBoxRef}
              className="scroll-smooth custom-scrollbar h-[46vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-md lg:h-[60vh]"
            >
              <AnimatePresence initial={false}>
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    variants={msgVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`mb-3 flex w-full ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border-blue-300/20"
                          : "bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border-emerald-300/20"
                      } max-w-[85%] rounded-2xl border p-3 shadow-md backdrop-blur-sm`}
                      style={{ boxShadow: "0 6px 18px rgba(99,102,241,0.12)" }}
                    >
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-white/60">
                        {msg.role === "user" ? "You" : "Sophia"}
                      </div>
                      <div className="text-[15px] leading-relaxed text-white/90 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="mt-4 flex items-center gap-2">
              <div className="group relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Type your message…"
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white/90 placeholder-white/50 outline-none backdrop-blur-md transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/40"
                />
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 blur-lg transition group-focus-within:opacity-100" style={{
                  background:
                    "radial-gradient(120px 120px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.25), transparent)",
                }} />
              </div>
              <button
                onClick={sendChatMessage}
                className="rounded-2xl border border-indigo-300/30 bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 px-5 py-3 text-sm font-medium text-white/90 backdrop-blur-md shadow-md transition hover:from-indigo-500/45 hover:to-fuchsia-500/45 hover:shadow-[0_0_22px_rgba(168,85,247,0.3)]"
              >
                Send
              </button>
              <button
                onClick={openVoice}
                aria-label="Open voice assistant"
                className={`grid place-items-center rounded-2xl border px-3 py-3 text-white/90 backdrop-blur-md shadow-md transition hover:brightness-110 ${
                  isListening
                    ? "border-fuchsia-300/40 bg-fuchsia-500/20"
                    : "border-indigo-300/30 bg-indigo-500/20"
                }`}
                title="Talk"
              >
                <MicIcon className="h-5 w-5 opacity-90" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Voice Modal */}
      <AnimatePresence>
        {voiceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-black/40 p-6 text-white shadow-[0_0_30px_rgba(99,102,241,0.18)]"
            >
              <div className="absolute right-4 top-4">
                <button onClick={closeVoice} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/15">Close</button>
              </div>
              <div className="flex flex-col items-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-lg font-medium">Sophia Voice</div>
                  <div className="text-white/70 text-sm">Speak to Sophia. Chat is paused while voice is active.</div>
                </div>
                <div className={`relative grid h-44 w-44 place-items-center rounded-full border shadow-lg ${
                  isSpeaking ? 'border-emerald-300/40 bg-emerald-500/20' : isProcessing ? 'border-indigo-300/40 bg-indigo-500/20' : isListening ? 'border-fuchsia-300/40 bg-fuchsia-500/20' : 'border-indigo-300/30 bg-indigo-500/20'
                }`}>
                  {isListening && !isProcessing && <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-fuchsia-400/25" />}
                  <MicIcon className="h-16 w-16 opacity-90" />
                  <span className="mt-2 text-sm/6">{isSpeaking ? 'Replying…' : isProcessing ? 'Processing…' : isListening ? 'Listening…' : 'Ready'}</span>
                </div>
                <div className="h-20 w-full max-w-md">
                  {isListening && !isProcessing && <Equalizer label="Listening…" />}
                  {isSpeaking && !isListening && <Equalizer label="Sophia is replying…" />}
                </div>
                {/* Removed explicit Stop button as requested */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to use Modal */}
      <AnimatePresence>
        {howtoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-black/40 p-6 text-white shadow-[0_0_30px_rgba(99,102,241,0.18)]"
            >
              <div className="absolute right-4 top-4">
                <button onClick={() => setHowtoOpen(false)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/15">Close</button>
              </div>
              <div className="mb-4 text-lg font-medium">How to use Sophia</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <HowtoCard icon={<TypeIcon className="h-5 w-5" />} title="Type or Talk" desc="Type a message or press the mic to speak." glow="from-indigo-400/25 to-fuchsia-400/25" />
                <HowtoCard icon={<MicSmallIcon className="h-5 w-5" />} title="Allow Microphone" desc="Grant mic access when prompted to enable voice." glow="from-fuchsia-400/25 to-pink-400/25" />
                <HowtoCard icon={<ChatIcon className="h-5 w-5" />} title="See Text Replies" desc="Typed chats show Sophia’s text responses." glow="from-emerald-400/25 to-teal-400/25" />
                <HowtoCard icon={<WaveIcon className="h-5 w-5" />} title="Voice-Only Replies" desc="In voice mode, Sophia replies by voice only." glow="from-purple-400/25 to-indigo-400/25" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local styles for equalizer & fancy scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

        @keyframes barGrow {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      {/* Hidden audio element for TTS playback */}
      <audio id="botAudio" autoPlay hidden />
    </div>
  );
}

// --- Equalizer component (animated bars) ---
const Equalizer = React.memo(function Equalizer({ label = "" }) {
  const bars = React.useMemo(() => Array.from({ length: 12 }), []);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 will-change-transform">
      <div className="flex h-10 items-end gap-1.5">
        {bars.map((_, i) => (
          <div
            key={i}
            className="w-1.5 origin-bottom rounded-full bg-white/60"
            style={{
              height: "2.25rem",
              animation: `barGrow ${0.95 + (i % 5) * 0.08}s ease-in-out ${
                (i % 6) * 0.06
              }s infinite`,
              opacity: 0.8,
              filter: "drop-shadow(0 0 5px rgba(236,72,153,0.35))",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
});

// --- Background FX (animated blobs + gradient) ---
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* subtle animated gradient veil */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(99,102,241,0.2),transparent_60%),radial-gradient(50%_50%_at_10%_80%,rgba(236,72,153,0.18),transparent_55%),radial-gradient(40%_60%_at_90%_20%,rgba(34,197,94,0.16),transparent_60%)]" />

      {/* floating blobs */}
      <motion.div
        className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ y: [0, -16, 0], x: [0, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-[-4rem] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        animate={{ y: [0, 22, 0], x: [0, -6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// --- Simple Mic icon ---
function MicIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
      <path d="M5 11a7 7 0 1 0 14 0" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

// --- How-to components & icons ---
function HowtoCard({ icon, title, desc, glow = "from-indigo-400/25 to-fuchsia-400/25" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md transition hover:bg-black/35`}
    >
      <div className={`pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${glow} blur-2xl`} />
      <div className="relative z-10 flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-white/90">{title}</div>
          <div className="text-xs text-white/70">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function TypeIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 6h16" />
      <path d="M8 6v12" />
      <path d="M16 6v12" />
      <path d="M4 18h16" />
    </svg>
  );
}

function MicSmallIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M5 11a7 7 0 1 0 14 0" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function ChatIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 6h16v10H7l-3 3V6Z" />
    </svg>
  );
}

function WaveIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 12c3 0 3-6 6-6s3 12 6 12 3-6 6-6" />
    </svg>
  );
}
