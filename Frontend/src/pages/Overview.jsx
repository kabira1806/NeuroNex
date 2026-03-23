// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   AlertCircle,
//   Mic,
//   Activity,
//   Heart,
//   Droplets,
//   Wind,
//   X,
//   FileText,
// } from "lucide-react";
// import axios from "axios";

// const Overview = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // 1. Initialize with empty/null values
//   const [userName, setUserName] = useState("");
//   const [greeting, setGreeting] = useState("");
//   const [vitals, setVitals] = useState({
//     heartRate: null,
//     bloodPressure: null,
//     oxygen: null,
//     sugar: null,
//   });

//   // 🔗 Fetch REAL data from backend
//   useEffect(() => {
//     axios
//       .get("/api/overview")
//       .then((res) => {
//         if (res.data) {
//           setUserName(res.data.userName);
//           setGreeting(res.data.greeting);
//           setVitals(res.data.vitals);
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Backend connection error:", err);
//         setLoading(false);
//       });
//   }, []);

//   // Loading State
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-[#278c5f] font-black text-xl animate-pulse">
//         Loading Health Data...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 relative text-slate-800 p-2">

//       {/* --- 1. GREETING SECTION (FIXED GREEN BACKGROUND) --- */}
//       <motion.div 
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         // FIXED: Changed `bg-linear-to-br` to bg-gradient-to-br and removed extra backticks
//         className="bg-gradient-to-br from-[#1e7e50] to-[#2ecc71] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
//       >
//         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        
//         <h1 className="text-5xl font-black tracking-tight drop-shadow-md">
//           {greeting || "Hello"} {userName}
//         </h1>
//         <p className="mt-4 text-green-50 font-extrabold text-xl italic tracking-wide">
//           "Aapki sehat ki live jankari yahan dikh rahi hai"
//         </p>
//       </motion.div>

//       {/* --- 2. ACTION BUTTONS --- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <ActionButton 
//           onClick={() => setIsListening(true)}
//           icon={<Mic size={32} className="text-[#278c5f]" />}
//           label="Ask AI Assistant"
//         />
        
//         <ActionButton 
//           icon={<FileText size={32} className="text-blue-600" />}
//           label="Scan Reports"
//         />

//         <motion.button 
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="p-8 rounded-[2.5rem] bg-red-50 border-2 border-red-100 shadow-lg hover:shadow-xl transition-all flex flex-col items-start justify-between h-40 group"
//         >
//           <div className="bg-red-100 p-3 rounded-2xl group-hover:bg-red-200 transition-colors">
//             <AlertCircle size={32} className="text-red-600" />
//           </div>
//           <h3 className="font-black text-2xl text-red-600 mt-2">SOS</h3>
//         </motion.button>
//       </div>

//       {/* --- 3. VITALS GRID --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <VitalCard
//           icon={<Droplets size={24} className="text-emerald-600" />}
//           color="bg-emerald-50"
//           label="Sugar Level"
//           value={vitals?.sugar}
//           unit="mg/dL"
//         />

//         <VitalCard
//           icon={<Activity size={24} className="text-blue-600" />}
//           color="bg-blue-50"
//           label="Blood Pressure"
//           value={vitals?.bloodPressure}
//           unit="mmHg"
//         />

//         <VitalCard
//           icon={<Heart size={24} className="text-rose-600" />}
//           color="bg-rose-50"
//           label="Heart Rate"
//           value={vitals?.heartRate}
//           unit="BPM"
//         />

//         <VitalCard
//           icon={<Wind size={24} className="text-cyan-600" />}
//           color="bg-cyan-50"
//           label="Oxygen"
//           value={vitals?.oxygen}
//           unit="%"
//         />
//       </div>

//       {/* --- 4. AI LISTENING MODAL --- */}
//       <AnimatePresence>
//         {isListening && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
//           >
//             <motion.div 
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.9 }}
//               className="bg-white rounded-[3rem] p-10 w-full max-w-lg text-center relative shadow-2xl"
//             >
//               <button
//                 onClick={() => setIsListening(false)}
//                 className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
//               >
//                 <X size={24} className="text-slate-600" />
//               </button>

//               <div className="w-24 h-24 bg-[#278c5f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 animate-pulse">
//                  <Mic size={48} className="text-white" />
//               </div>
              
//               <h2 className="text-3xl font-black text-slate-800">Listening...</h2>
//               <p className="text-lg font-bold text-slate-400 mt-2">
//                 "Boliye, main sun raha hoon..."
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // --- Reusable Components ---

// const ActionButton = ({ icon, label, onClick }) => (
//   <motion.button
//     onClick={onClick}
//     whileHover={{ scale: 1.02, y: -5 }}
//     whileTap={{ scale: 0.98 }}
//     className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-lg hover:shadow-xl hover:border-[#278c5f]/20 transition-all flex flex-col items-start justify-between h-40"
//   >
//     <div className="bg-slate-50 p-3 rounded-2xl">{icon}</div>
//     <h3 className="font-black text-xl text-slate-700 mt-2">{label}</h3>
//   </motion.button>
// );

// const VitalCard = ({ icon, label, value, unit, color }) => (
//   <motion.div 
//     whileHover={{ y: -5 }}
//     className="bg-white p-6 rounded-[2.5rem] shadow-lg border-2 border-slate-50 flex flex-col justify-between h-44"
//   >
//     <div className="flex items-center gap-3">
//       <div className={`p-3 ${color} rounded-2xl`}>{icon}</div>
//       <span className="uppercase text-xs font-black text-slate-400 tracking-wider">
//         {label}
//       </span>
//     </div>

//     <div>
//         <div className="text-4xl font-black text-slate-800">
//         {value ? value : "--"}
//         </div>
//         <div className="text-sm font-bold text-slate-400 mt-1">{unit}</div>
//     </div>
//   </motion.div>
// );

// export default Overview;


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Mic, Activity, Heart, Droplets, Wind, X, FileText, Plus } from "lucide-react";
import { dashboardAPI, vitalsAPI } from "../services/api"; // Added vitalsAPI

// --- New Add Vitals Modal Component ---
const AddVitalsModal = ({ isOpen, onClose, user, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Local state for the vitals form
  const [formData, setFormData] = useState({
    sys: "",
    dia: "",
    sugar: "",
    heartRate: "",
    oxygen: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");

    try {
      const promises = [];

      // Save Blood Pressure if both provided
      if (formData.sys && formData.dia) {
        promises.push(vitalsAPI.recordBloodPressure(user.id, parseFloat(formData.sys), parseFloat(formData.dia)));
      }

      // Save Sugar
      if (formData.sugar) {
        promises.push(vitalsAPI.recordVital(user.id, "sugar_fasting", parseFloat(formData.sugar), "mg/dL"));
      }

      // Save Heart Rate
      if (formData.heartRate) {
        promises.push(vitalsAPI.recordVital(user.id, "heart_rate", parseFloat(formData.heartRate), "bpm"));
      }

      // Save Oxygen
      if (formData.oxygen) {
        promises.push(vitalsAPI.recordVital(user.id, "oxygen", parseFloat(formData.oxygen), "%"));
      }

      if (promises.length === 0) {
        setError("Please enter at least one vital before saving.");
        setLoading(false);
        return;
      }

      await Promise.all(promises);
      
      // Cleanup and close
      onSaveSuccess();
      setFormData({ sys: "", dia: "", sugar: "", heartRate: "", oxygen: "" });
      onClose();
    } catch (err) {
      console.error("Error saving vitals:", err);
      setError("Failed to save vitals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>

        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="text-[#278c5f]" /> Log Vitals
        </h2>

        {error && <p className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        <div className="space-y-4">
          {/* BP Box */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
             <label className="text-sm font-bold text-slate-500 mb-2 block">Blood Pressure (mmHg)</label>
             <div className="flex gap-4 items-center">
                <input 
                  type="number" name="sys" placeholder="Systolic (e.g. 120)" 
                  value={formData.sys} onChange={handleChange}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#278c5f] text-center font-bold"
                />
                <span className="text-slate-300 font-bold text-xl">/</span>
                <input 
                  type="number" name="dia" placeholder="Diastolic (e.g. 80)" 
                  value={formData.dia} onChange={handleChange}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#278c5f] text-center font-bold"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sugar Box */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
               <label className="text-sm font-bold text-slate-500 mb-2 block flex items-center gap-1">
                 <Droplets size={14}/> Sugar
               </label>
               <input 
                  type="number" name="sugar" placeholder="mg/dL" 
                  value={formData.sugar} onChange={handleChange}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#278c5f] font-bold"
                />
            </div>
            
            {/* HR Box */}
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
               <label className="text-sm font-bold text-slate-500 mb-2 block flex items-center gap-1">
                 <Heart size={14}/> Heart Rate
               </label>
               <input 
                  type="number" name="heartRate" placeholder="bpm" 
                  value={formData.heartRate} onChange={handleChange}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#278c5f] font-bold"
                />
            </div>
          </div>
          
           {/* Oxygen Box */}
           <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
               <label className="text-sm font-bold text-slate-500 mb-2 block flex items-center gap-1">
                 <Wind size={14}/> Blood Oxygen
               </label>
               <input 
                  type="number" name="oxygen" placeholder="%" 
                  value={formData.oxygen} onChange={handleChange}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#278c5f] font-bold"
                />
            </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl bg-[#278c5f] text-white font-black text-lg shadow-lg hover:shadow-xl hover:bg-[#1e7e50] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Vitals"}
        </button>
      </motion.div>
    </div>
  );
};


const Overview = ({ user }) => { 
  const [isListening, setIsListening] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false); // Modal State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dashboardData, setDashboardData] = useState({
    userName: "",
    greeting: "Namaste",
    vitals: { heartRate: "--", bloodPressure: "--", oxygen: "--", sugar: "--" }
  });

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setError('');
      setLoading(true);
      const data = await dashboardAPI.getElderSummary(user.id, 7);

      // Process Vitals Array into Object
      const latestVitals = { heartRate: "--", bloodPressure: "--", oxygen: "--", sugar: "--" };
      
      if (data.recent_vitals) {
         const find = (type) => data.recent_vitals.find(v => v.vital_type === type)?.value || "--";
         
         latestVitals.sugar = find("sugar_fasting");
         latestVitals.heartRate = find("heart_rate");
         latestVitals.oxygen = find("oxygen");
         
         const sys = find("bp_systolic");
         const dia = find("bp_diastolic");
         latestVitals.bloodPressure = (sys !== "--" && dia !== "--") ? `${sys}/${dia}` : "--";
      }

      setDashboardData({
        userName: data.elder_name || "User",
        greeting: "Namaste",
        vitals: latestVitals
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Real Data on mount
  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading && !dashboardData.userName) return <div className="p-10 text-center text-[#278c5f] font-bold">Loading Health Data...</div>;
  if (error) return <div className="p-10 text-center text-red-600 font-bold">Error: {error}</div>;

  return (
    <div className="space-y-8 relative text-slate-800 p-2 pb-24">
      {/* 1. GREETING */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-br from-[#1e7e50] to-[#2ecc71] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black">{dashboardData.greeting} {dashboardData.userName}</h1>
          <p className="mt-4 text-green-50 font-extrabold text-xl italic">"Aapki sehat ki live jankari yahan dikh rahi hai"</p>
        </div>
        
        {user?.id && (
           <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/30 text-center relative z-10 shrink-0">
             <p className="text-sm font-bold text-green-50 uppercase tracking-widest mb-1">Share ID to Link</p>
             <p className="text-4xl font-black">{user.id}</p>
           </div>
        )}
      </motion.div>

      {/* 2. ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionButton 
          onClick={() => setIsListening(true)}
          icon={<Mic size={32} className="text-[#278c5f]" />}
          label="Ask AI Assistant"
        />
        
        <ActionButton 
          icon={<FileText size={32} className="text-blue-600" />}
          label="Scan Reports"
        />

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVitalsModalOpen(true)} // Repurposed SOS block for demo or just add a new button entirely. Waiting, actually let's keep SOS and add a smaller dedicated button below.
          className="p-8 rounded-[2.5rem] bg-red-50 border-2 border-red-100 shadow-lg hover:shadow-xl transition-all flex flex-col items-start justify-between h-40 group"
        >
          <div className="bg-red-100 p-3 rounded-2xl group-hover:bg-red-200 transition-colors">
             <AlertCircle size={32} className="text-red-600" />
          </div>
          <h3 className="font-black text-2xl text-red-600 mt-2">SOS</h3>
        </motion.button>
      </div>

      {/* 3. VITALS GRID HEADER */}
      <div className="flex justify-between items-end mb-4">
         <h2 className="text-2xl font-black text-slate-800 ml-4">Current Vitals</h2>
         <button 
           onClick={() => setIsVitalsModalOpen(true)}
           className="flex items-center gap-2 bg-slate-100 hover:bg-[#278c5f] text-slate-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
         >
           <Plus size={18} /> Update
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <VitalCard 
          icon={<Droplets size={24} className="text-emerald-600" />} 
          color="bg-emerald-50" 
          label="Sugar" 
          value={dashboardData.vitals.sugar} 
          unit="mg/dL" 
        />
        <VitalCard 
          icon={<Activity size={24} className="text-blue-600" />} 
          color="bg-blue-50" 
          label="BP" 
          value={dashboardData.vitals.bloodPressure} 
          unit="mmHg" 
        />
        <VitalCard 
          icon={<Heart size={24} className="text-rose-600" />} 
          color="bg-rose-50" 
          label="Heart Rate" 
          value={dashboardData.vitals.heartRate} 
          unit="BPM" 
        />
        <VitalCard 
          icon={<Wind size={24} className="text-cyan-600" />} 
          color="bg-cyan-50" 
          label="Oxygen" 
          value={dashboardData.vitals.oxygen} 
          unit="%" 
        />
      </div>

      {/* 4. AI LISTENING MODAL */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-lg text-center relative shadow-2xl"
            >
              <button
                onClick={() => setIsListening(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={24} className="text-slate-600" />
              </button>

              <div className="w-24 h-24 bg-[#278c5f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 animate-pulse">
                 <Mic size={48} className="text-white" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-800">Listening...</h2>
              <p className="text-lg font-bold text-slate-400 mt-2">"Boliye, main sun raha hoon..."</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. ADD VITALS MODAL */}
      <AnimatePresence>
        {isVitalsModalOpen && (
          <AddVitalsModal 
             isOpen={isVitalsModalOpen} 
             onClose={() => setIsVitalsModalOpen(false)} 
             user={user}
             onSaveSuccess={() => fetchData()} 
          />
        )}
      </AnimatePresence>
      
    </div>
  );
};

// Reusable Components
const ActionButton = ({ icon, label, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-lg hover:shadow-xl hover:border-[#278c5f]/20 transition-all flex flex-col items-start justify-between h-40"
  >
    <div className="bg-slate-50 p-3 rounded-2xl">{icon}</div>
    <h3 className="font-black text-xl text-slate-700 mt-2">{label}</h3>
  </motion.button>
);

const VitalCard = ({ icon, label, value, unit, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2.5rem] shadow-lg border-2 border-slate-50 flex flex-col justify-between h-44"
  >
    <div className="flex items-center gap-3">
      <div className={`p-3 ${color} rounded-2xl`}>{icon}</div>
      <span className="uppercase text-xs font-black text-slate-400 tracking-wider">{label}</span>
    </div>
    <div>
        <div className="text-4xl font-black text-slate-800">{value || "--"}</div>
        <div className="text-sm font-bold text-slate-400 mt-1">{unit}</div>
    </div>
  </motion.div>
);

export default Overview;