import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, Bot, Loader, Sparkles, MessageSquareQuote, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { voicebotAPI } from '../services/api';

// Accept user prop to get elder_id
const VoiceAssistant = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, text: "Namaste! Main Saathi AI hu. Kaisa mehsoos kar rahe hain?", sender: 'bot' }]);
  
  // Audio Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, isOpen]);

  // --- RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      setIsRequestingMic(true);
      console.log("🎤 Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRequestingMic(false);
      streamRef.current = stream;
      
      console.log("✅ Microphone access granted");
      
      // Prioritize WAV (no conversion needed), fallback to webm
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
        console.log("🎵 Using WAV format (native)");
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
        console.log("🎵 Using WebM format");
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log(`📦 Data available: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("❌ Recording error:", event.error);
        alert(`Recording error: ${event.error}`);
      };

      mediaRecorderRef.current.onstop = handleAudioStop;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("🔴 Recording started");
    } catch (err) {
      setIsRequestingMic(false);
      console.error("❌ Mic Error:", err);
      alert(`Microphone access denied: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("⏹️ Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log("🛑 Stopped audio track");
        });
      }
    }
  };

  const handleAudioStop = async () => {
    if (!user?.id) {
      console.error("❌ User not logged in");
      alert("Please login first");
      return;
    }

    if (audioChunksRef.current.length === 0) {
      console.warn("❌ No audio data recorded");
      setMessages(prev => [...prev, { 
        id: Date.now()+1, 
        text: "No audio recorded. Please try again.", 
        sender: 'bot' 
      }]);
      return;
    }

    console.log(`📊 Total audio chunks: ${audioChunksRef.current.length}`);

    // 1. Create Audio Blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    console.log("🎙️ Recording size:", audioBlob.size, "bytes");

    if (audioBlob.size === 0) {
      console.error("❌ Audio blob is empty");
      setMessages(prev => [...prev, { 
        id: Date.now()+1, 
        text: "Recording failed. Please try again.", 
        sender: 'bot' 
      }]);
      return;
    }

    if (audioBlob.size < 1000) {
      console.warn("⚠️ Recording too short (< 1KB)");
      setMessages(prev => [...prev, { 
        id: Date.now()+1, 
        text: "Recording too short. Please speak longer.", 
        sender: 'bot' 
      }]);
      return;
    }

    // 2. Add placeholder message
    setMessages(prev => [...prev, { id: Date.now(), text: "🎤 Processing audio...", sender: 'user' }]);

    // 3. Send to Backend
    try {
      console.log("📤 Sending to backend...");
      const data = await voicebotAPI.sendVoiceMessage(user.id, audioBlob);
      console.log("✅ Voicebot response:", data);
      
      // Check for error
      if (data.status === "error") {
        console.error("❌ Backend error:", data.error);
        setMessages(prev => [...prev, { 
          id: Date.now()+1, 
          text: `Server Error: ${data.error || "Unknown error"}`, 
          sender: 'bot' 
        }]);
        return;
      }
      
      // 4. Show AI Response
      const botReply = data.reply_text || data.reply || "Samajhne mein problem aayi";
      setMessages(prev => [...prev, { 
        id: Date.now()+1, 
        text: botReply, 
        sender: 'bot',
        audio: data.audio  // Store audio data
      }]);

      // 5. Play audio response if available
      if (data.audio) {
        console.log("🔊 Playing audio response...");
        playAudio(data.audio);
      } else {
        console.warn("⚠️ No audio in response");
      }

    } catch (error) {
      console.error("❌ AI Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now()+1, 
        text: `Connection Error: ${error.message || "Failed to connect to server"}`, 
        sender: 'bot' 
      }]);
    }
  };

  const playAudio = (base64Audio) => {
    try {
      const audioData = base64Audio;
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch(err => {
          console.error("❌ Playback error:", err);
        });
        console.log("🎵 Audio playing...");
      }
    } catch (err) {
      console.error("❌ Audio decode error:", err);
    }
  };

  const manualPlayAudio = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message?.audio) {
      console.log("🔄 Replaying audio...");
      playAudio(message.audio);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <audio ref={audioPlayerRef} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-5 w-[360px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#278c5f] to-[#2ecc71] p-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-3"><Bot size={24} /><span className="font-bold">Saathi AI</span></div>
               <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl flex items-center gap-2 ${msg.sender === 'user' ? 'bg-[#278c5f] text-white' : 'bg-white border'}`}>
                    <span>{msg.text}</span>
                    {msg.audio && msg.sender === 'bot' && (
                      <button 
                        onClick={() => manualPlayAudio(msg.id)}
                        className="hover:scale-110 transition-transform"
                        title="Play audio"
                      >
                        <Volume2 size={16} className={msg.sender === 'user' ? 'text-white' : 'text-[#278c5f]'} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t flex flex-col items-center gap-2">
                <button 
                  onClick={() => {
                    if (isRequestingMic) return;
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  className={`p-6 rounded-full transition-all shadow-lg font-bold text-white ${isRequestingMic ? 'bg-yellow-500 scale-105' : isRecording ? 'bg-red-500 scale-110 animate-pulse' : 'bg-[#278c5f] hover:scale-105 active:scale-95'}`}
                  title={isRequestingMic ? "Requesting access..." : isRecording ? "Recording... Click to send" : "Click to speak"}
                >
                   {isRequestingMic ? (
                     <Loader className="animate-spin" size={32} />
                   ) : isRecording ? (
                     <Loader className="animate-spin" size={32} />
                   ) : (
                     <Mic size={32} />
                   )}
                </button>
                <p className="text-xs text-slate-500 text-center">
                  {isRequestingMic ? "⏳ Requesting Mic..." : isRecording ? "🔴 Recording... Click to send" : "🎤 Click & Speak"}
                </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 rounded-full bg-[#278c5f] text-white flex items-center justify-center shadow-lg">
        {isOpen ? <X /> : <MessageSquareQuote />}
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;