import React, { useState } from 'react';
import { User, HeartHandshake, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { authAPI } from '../services/api';

const Login = ({ onLogin, onSwitchToRegister }) => {
  // 1. State for inputs and role selection
  const [role, setRole] = useState(null); 
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. The Login Function
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await authAPI.login(phone, password, role);
      onLogin(userData);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <img src={logo} alt="Logo" className="h-20 mx-auto mb-4" />
        <h1 className="text-4xl font-black text-[#278c5f]">NeuroNex Swagat</h1>
        <p className="text-xl text-slate-500 font-bold">
          {!role ? "Kripya apni pehchan batayein" : `${role === 'elder' ? 'Buzurg' : 'Caretaker'} Login`}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!role ? (
          /* STEP 1: ROLE SELECTION */
          <motion.div 
            key="selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
          >
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              onClick={() => setRole('elder')} 
              className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-transparent hover:border-[#278c5f] cursor-pointer"
            >
              <div className="p-8 bg-green-50 rounded-full text-[#278c5f] mb-4 inline-block"><User size={64} /></div>
              <h2 className="text-3xl font-black text-slate-800">Main Buzurg Hoon</h2>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              onClick={() => setRole('caretaker')} 
              className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-transparent hover:border-indigo-500 cursor-pointer"
            >
              <div className="p-8 bg-indigo-50 rounded-full text-indigo-500 mb-4 inline-block"><HeartHandshake size={64} /></div>
              <h2 className="text-3xl font-black text-slate-800">Main Caretaker Hoon</h2>
            </motion.button>
          </motion.div>
        ) : (
          /* STEP 2: FORM INPUTS */
          <motion.form 
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleLoginSubmit}
            className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md border-2 border-slate-100"
          >
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Phone Number" 
                className="w-full p-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-[#278c5f] outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-[#278c5f] outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && (
                <p className="text-red-500 font-bold text-center bg-red-50 p-3 rounded-2xl">
                  {error}
                </p>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#278c5f] text-white p-4 rounded-2xl font-bold text-xl hover:bg-[#1e6b48] transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? "Rukiye..." : "Aage Badhein"}
              </button>
            </div>
            
            <button 
              type="button"
              onClick={() => setRole(null)}
              className="mt-4 text-slate-400 flex items-center justify-center gap-2 mx-auto hover:text-slate-600"
            >
              <ArrowLeft size={16} /> Peeche Jayein
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <button onClick={onSwitchToRegister} className="mt-8 text-slate-500 font-bold text-lg underline cursor-pointer hover:text-[#278c5f]">
        Naya account banayein? (Register Here)
      </button>
    </div>
  );
};

export default Login;