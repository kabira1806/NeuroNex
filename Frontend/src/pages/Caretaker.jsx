import React, { useState, useEffect } from 'react';
import { HeartPulse, Activity, CheckCircle, Clock, Brain, Smile, FileText, AlertCircle, Users, ChevronDown, Link as LinkIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoCard from '../components/InfoCard';
import { dashboardAPI, medicationAPI, caregiverAPI } from '../services/api';

// --- Link Elder Modal ---
const LinkElderModal = ({ isOpen, onClose, user, onSaveSuccess }) => {
  const [elderId, setElderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user?.id || !elderId) return;
    setLoading(true);
    setError("");

    try {
      await caregiverAPI.linkCaregiver(parseInt(elderId, 10), user.id);
      onSaveSuccess();
      setElderId("");
      onClose();
    } catch (err) {
      console.error("Error linking elder:", err);
      setError("Failed to link elder. Please verify the ID is correct.");
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
          <LinkIcon className="text-indigo-600" /> Link an Elder
        </h2>

        {error && <p className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
             <label className="text-sm font-bold text-slate-500 mb-2 block">Enter Elder ID</label>
             <input 
                type="number" 
                placeholder="e.g. 1" 
                value={elderId} 
                onChange={(e) => setElderId(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-center text-xl font-black text-slate-700 tracking-widest"
              />
              <p className="text-xs text-slate-400 mt-2 text-center">Ask the elder to check their ID on their Overview page.</p>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading || !elderId}
          className="w-full mt-6 py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Linking..." : "Link Profile"}
        </button>
      </motion.div>
    </div>
  );
};


const Caretaker = ({ user }) => {
  const [elders, setElders] = useState([]);
  const [selectedElderId, setSelectedElderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Dashboard Data State
  const [stats, setStats] = useState({
    mood: "--",
    adherence: 0,
    alerts: 0,
    lastUpdate: null
  });
  const [meds, setMeds] = useState([]);

  // Fetch Linked Elders
  const fetchElders = async () => {
    if (!user?.id) return;
    try {
      setError('');
      setLoading(true);
      const data = await dashboardAPI.getLinkedElders(user.id);
      setElders(data.elders || []);
      // Auto-select the first elder if available and no selected elder
      if (data.elders.length > 0 && !selectedElderId) {
        setSelectedElderId(data.elders[0].id);
      }
    } catch (err) {
      console.error("Error fetching elders:", err);
      setError(err.message || "Failed to load elders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElders();
  }, [user]);

  // Fetch Selected Elder's Data (Summary & Meds)
  useEffect(() => {
    if (!selectedElderId) return;

    const fetchElderData = async () => {
      setLoading(true);
      try {
        setError('');
        // A. Get Summary
        const summaryData = await dashboardAPI.getElderSummary(selectedElderId);

        setStats({
          mood: summaryData.last_checkin?.mood || "No Data",
          adherence: summaryData.medication_adherence_today_pct || 0,
          alerts: summaryData.unread_alerts_count || 0,
          lastUpdate: summaryData.last_checkin?.created_at
        });

        // B. Get Today's Medications
        const medsData = await medicationAPI.getElderMedications(selectedElderId, 10);
        setMeds(medsData);

      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchElderData();
  }, [selectedElderId]);

  // --- Helpers ---
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading && elders.length === 0) return <div className="p-10 text-center text-slate-500 font-bold">Loading Caretaker Dashboard...</div>;
  if (error && elders.length === 0) return <div className="p-10 text-center text-red-600 font-bold">Error: {error}</div>;

  return (
    <div className="space-y-10 pb-24 max-w-6xl mx-auto p-6 text-slate-800">
      
      {/* 1. HEADER & ELDER SELECTOR */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 p-8 rounded-[3rem] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black mb-1">Caretaker Dashboard</h2>
          <p className="text-lg opacity-90">Monitoring for: <span className="font-bold underline decoration-wavy">{elders.find(e => e.id === selectedElderId)?.name || "Select Elder"}</span></p>
        </div>

        <div className="flex items-center gap-4">
          <button 
             onClick={() => setIsLinkModalOpen(true)}
             className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20"
          >
            <LinkIcon size={18} /> Link Elder
          </button>

          {/* Dropdown if multiple elders exist */}
          {elders.length > 0 && (
            <div className="relative group">
              <button className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/30 transition-all shadow-lg">
                <Users size={20} /> Switch <ChevronDown size={16} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-[1.5rem] shadow-xl overflow-hidden hidden group-hover:block z-10 border border-slate-100">
                {elders.map(elder => (
                  <button 
                    key={elder.id}
                    onClick={() => setSelectedElderId(elder.id)}
                    className={`block w-full text-left px-5 py-3 text-slate-700 hover:bg-indigo-50 font-bold ${selectedElderId === elder.id ? 'bg-indigo-50 text-indigo-600' : ''}`}
                  >
                    {elder.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {elders.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-[3rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
             <LinkIcon size={40} className="text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-700 mb-2">No elders linked yet.</h3>
          <p className="text-slate-500 font-medium mb-8">Ask the elder for their ID and link their account to start monitoring their health.</p>
          <button 
             onClick={() => setIsLinkModalOpen(true)}
             className="px-8 py-4 bg-indigo-600 text-white rounded-full font-black text-lg shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
             <LinkIcon size={20} /> Link an Elder Now
          </button>
        </div>
      ) : (
        <>
          {/* 2. VITALS SNAPSHOT (Real Data) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Mood" color="emerald" icon={<Smile size={28} />}>
               <div className="text-3xl font-black text-emerald-600 capitalize">
                 {stats.mood}
               </div>
               <p className="text-xs text-slate-400 mt-1">Last update: {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'Never'}</p>
            </InfoCard>

            <InfoCard title="Dawai Score" color="indigo" icon={<Activity size={28} />}>
               <div className="text-3xl font-black text-indigo-600">{Math.round(stats.adherence)}%</div>
               <div className="w-full bg-indigo-100 h-2 rounded-full mt-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${stats.adherence}%` }}></div>
               </div>
            </InfoCard>

            <InfoCard title="Alerts" color="orange" icon={<AlertCircle size={28} />}>
               <div className={`text-3xl font-black ${stats.alerts > 0 ? 'text-red-500' : 'text-orange-600'}`}>
                 {stats.alerts} Pending
               </div>
               <p className="text-xs text-slate-400 mt-1">Missed meds or SOS</p>
            </InfoCard>
          </div>

          {/* 3. SYNCED MEDICINE TRACKER */}
          <div>
            <div className="flex justify-between items-center px-4 mb-4">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-500" /> Elder's Medicine Log
              </h3>
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-bold text-sm animate-pulse">
                Live Syncing...
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {meds.length === 0 ? (
                <p className="text-center text-slate-400 py-6 font-bold bg-white rounded-3xl border border-slate-50">No medicines scheduled for today.</p>
              ) : (
                meds.map((med) => (
                  <div key={med.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${med.taken_at ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                         <Clock size={24} />
                      </div>
                      <div>
                        <h4 className={`font-black text-xl ${med.taken_at ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{med.name}</h4>
                        <p className="text-slate-400 font-bold">Scheduled: {formatTime(med.scheduled_date)}</p>
                      </div>
                    </div>
                    
                    {/* LIVE STATUS INDICATOR */}
                    <div className="flex items-center gap-4">
                      {med.taken_at ? (
                        <span className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-black flex items-center gap-2">
                          <CheckCircle size={20} /> Taken
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-6 py-2 rounded-full font-black flex items-center gap-2">
                          <AlertCircle size={20} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 4. NOTE CARD */}
      <div className="mt-8 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
         <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm mb-4">Quick Note</h4>
         <p className="text-slate-600 font-medium italic">
            "Agar 'Dawai Score' kam hai, toh alert sections zaroor check karein."
         </p>
      </div>

      {/* 5. LINK MODAL */}
      <AnimatePresence>
        {isLinkModalOpen && (
           <LinkElderModal 
              isOpen={isLinkModalOpen} 
              onClose={() => setIsLinkModalOpen(false)} 
              user={user} 
              onSaveSuccess={() => {
                fetchElders(); // Will cause reload
              }} 
           />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Caretaker;