import React, { useState } from 'react';
import { User, HeartHandshake, Phone, Lock, CheckCircle, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { authAPI } from '../services/api';

const Register = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('elder');
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords match nahi kar rahe.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const userData = await authAPI.register(
        formData.name,
        formData.phone,
        formData.password,
        role,
        'hi'
      );
      setSuccess(true);
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl w-full max-w-2xl">
        <img src={logo} alt="Logo" className="h-16 mx-auto mb-6" />
        <h2 className="text-4xl font-black text-[#278c5f] text-center mb-10">Naya Khata</h2>

        {success ? (
          <div className="text-center p-10 bg-green-50 rounded-[3rem] border-2 border-green-100">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={80} />
            <h3 className="text-3xl font-black text-green-700">Safal Registration!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setRole('elder')} className={`p-4 rounded-3xl border-2 cursor-pointer ${role === 'elder' ? 'border-[#278c5f] bg-green-50' : ''}`}>Elder</button>
              <button type="button" onClick={() => setRole('caretaker')} className={`p-4 rounded-3xl border-2 cursor-pointer ${role === 'caretaker' ? 'border-indigo-500 bg-indigo-50' : ''}`}>Caretaker</button>
            </div>
            
            <input type="text" placeholder="Naam" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="tel" placeholder="Phone" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="password" placeholder="Password" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
            <input type="password" placeholder="Confirm" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />

            {error && <p className="text-red-500 font-bold">{error}</p>}
            <button type="submit" className="w-full bg-[#278c5f] text-white p-6 rounded-3xl font-black text-xl cursor-pointer">
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Register Karein"}
            </button>
          </form>
        )}
        <button onClick={onSwitchToLogin} className="w-full mt-6 text-slate-400 font-bold underline cursor-pointer">Login Karein</button>
      </motion.div>
    </div>
  );
};

export default Register;