import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Check, Clock, AlertCircle } from 'lucide-react';

const Medications = ({ medicines = [], onToggle, onAdd, error = '' }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', dosage: '', frequency: '', time: '' });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.dosage) {
      onAdd({
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency || 'Once daily',
        time: formData.time || '09:00 AM'
      });
      setFormData({ name: '', dosage: '', frequency: '', time: '' });
      setShowAddForm(false);
    }
  };

  const pendingMeds = medicines.filter(m => m.status === 'Pending');
  const takenMeds = medicines.filter(m => m.status === 'Taken');

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto p-6 font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-8 rounded-[3rem] text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black mb-2">Daily Medicines</h2>
            <p className="text-blue-50 font-bold text-lg">Apna din-charya track karein</p>
          </div>
          <Pill size={64} className="opacity-30" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-[2rem] flex items-center gap-3">
          <AlertCircle size={24} className="text-red-600" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Add Medicine Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={24} /> Add Medicine
        </motion.button>
      </div>

      {/* Add Medicine Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-purple-100 shadow-lg"
          >
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Medicine Name"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Dosage (e.g., 2 tablets)"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Frequency (e.g., Twice daily)"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
              <input
                type="time"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white p-4 rounded-2xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Save Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-200 text-slate-700 p-4 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Medicines */}
      {pendingMeds.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Clock size={28} className="text-orange-500" />
            Pending ({pendingMeds.length})
          </h3>
          <div className="space-y-4">
            {pendingMeds.map((med) => (
              <motion.div
                key={med.id}
                layout
                className="bg-white p-6 rounded-[2rem] border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-2xl font-black text-slate-800">{med.name}</h4>
                    <p className="text-slate-500 font-bold">Dosage: {med.dosage}</p>
                    <p className="text-slate-400 text-sm">Time: {med.time || 'Na bataya'} | {med.frequency || 'Daily'}</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggle(med.id)}
                      className="p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors"
                      title="Mark as taken"
                    >
                      <Check size={24} className="text-green-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={24} className="text-red-600" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Taken Medicines */}
      {takenMeds.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Check size={28} className="text-green-500" />
            Taken ({takenMeds.length})
          </h3>
          <div className="space-y-4">
            {takenMeds.map((med) => (
              <motion.div
                key={med.id}
                layout
                className="bg-white p-6 rounded-[2rem] border-2 border-green-100 shadow-lg opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-2xl font-black text-slate-600 line-through">{med.name}</h4>
                    <p className="text-slate-400 font-bold">Dosage: {med.dosage}</p>
                    <p className="text-slate-300 text-sm">Time: {med.time || 'Na bataya'} | {med.frequency || 'Daily'}</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggle(med.id)}
                      className="p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors"
                      title="Mark as pending"
                    >
                      <Clock size={24} className="text-orange-600" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {medicines.length === 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-12 rounded-[3rem] text-center border-2 border-purple-100">
          <Pill size={80} className="mx-auto text-purple-300 mb-4 opacity-50" />
          <h3 className="text-2xl font-black text-slate-600 mb-2">Koi medicine nahi</h3>
          <p className="text-slate-500 font-bold">Apni medicines add karne ke liye button click karein</p>
        </div>
      )}
    </div>
  );
};

export default Medications;