import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Share2, Phone, ExternalLink, 
  Menu, X, Globe, Heart, HeartHandshake, Smartphone,
  Activity, AlertCircle
} from 'lucide-react'; 

const Vault = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const importantSites = [
    { 
      label: "Health Jaankari", 
      url: "https://www.nhp.gov.in/", 
      icon: <ShieldCheck size={32} className="text-emerald-500" />,
      desc: "Sarkari sehat portal"
    },
    { 
      label: "Home Remedies", 
      url: "https://hi.wikipedia.org/wiki/घरेलू_नुस्खे", 
      icon: <Globe size={32} className="text-blue-500" />,
      desc: "Gharelu nuskho ki jaankari"
    },
    { 
      label: "Spiritual Padhai", 
      url: "https://www.holy-bhagavad-gita.org/", 
      icon: <HeartHandshake size={32} className="text-orange-500" />, 
      desc: "Mann ki shanti ke liye"
    },
    { 
      label: "Senior Citizen Help", 
      url: "https://socialjustice.gov.in/", 
      icon: <Heart size={32} className="text-rose-500" />,
      desc: "Buzurgo ke liye sahayata"
    },
  ];

  // 🔗 UPDATED: Added real URLs to policies
  const policies = [
    { 
        id: 1, 
        provider: "Star Health Insurance", 
        policyNo: "SH-99234-A", 
        expiry: "12 Oct 2026", 
        status: "Active",
        url: "https://www.starhealth.in/customer-portal" // 🆕 Add hyperlink
    },
    { 
        id: 2, 
        provider: "Ayushman Bharat (ABHA)", 
        idNo: "91-2234-5567", 
        status: "Linked",
        url: "https://abha.abdm.gov.in/" // 🆕 Add hyperlink
    }
  ];

  return (
    <div className="space-y-8 relative pb-20 text-slate-800">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-blue-50">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Digital Vault</h2>
          <p className="text-slate-500 font-bold">Zaroori kagaz aur links yahan hain.</p>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          <Menu size={28} />
          <span className="font-black text-lg hidden md:block uppercase">Websites</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((p) => (
          <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-md relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-6 py-2 rounded-bl-3xl font-black uppercase">
              {p.status}
            </div>
            <h4 className="font-black text-2xl mb-2">{p.provider}</h4>
            <p className="text-slate-400 font-bold text-lg">No: {p.policyNo || p.idNo}</p>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
              
              {/* ✅ ADDED: Hyperlink wrapper for View button */}
              <a 
                href={p.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex"
              >
                <button className="text-blue-600 font-black text-lg flex items-center gap-2 hover:underline decoration-4 underline-offset-4">
                    View <ExternalLink size={20} />
                </button>
              </a>

            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-[85%] sm:w-[450px] bg-white z-[210] shadow-2xl p-10 flex flex-col">
              <div className="flex justify-between items-center mb-10 border-b pb-8">
                <h3 className="text-3xl font-black tracking-tight">Zaroori Links</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-4 bg-slate-100 rounded-full hover:text-red-500 transition-colors"><X size={32} /></button>
              </div>
              <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                {importantSites.map((site, index) => (
                  <a key={index} href={site.url} target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 rounded-[2.5rem] border-2 border-slate-50 hover:bg-blue-50 transition-all">
                    <div className="p-4 bg-slate-50 rounded-2xl">{site.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl leading-none mb-1">{site.label}</h4>
                      <p className="text-slate-400 font-bold text-sm leading-tight">{site.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vault;