import React, { useState } from 'react';
import { Leaf, Search, Wind, Droplets, Flame, ExternalLink, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Remedies = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // 🌿 1. DATA UPGRADE: Added Wikipedia Links & Safety Info
  const allRemedies = [
    { 
      id: 1, 
      title: "Adrak-Shahad (Cough & Cold)", 
      desc: "Purani khansi aur sardi ke liye adrak ka ras aur shahad ka mishran kaafi asarkaar hai.", 
      wikiUrl: "https://hi.wikipedia.org/wiki/अदरक",
      category: "Cold",
      icon: <Wind size={32} />,
      color: "bg-orange-50 text-orange-600",
      whenToUse: "Sookhi khansi ya gale ki kharash mein.",
      whenNotToUse: "Agar gale mein bahut zyada jalan ya acidity ho.",
      warning: "Agar khansi 1 hafte se zyada rahe toh doctor se milein."
    },
    { 
      id: 2, 
      title: "Jeera Paani (Digestion)", 
      desc: "Pet ki gas aur pachan theek karne ke liye bhuna jeera garam paani mein piyein.", 
      wikiUrl: "https://hi.wikipedia.org/wiki/जीरा",
      category: "Stomach",
      icon: <Droplets size={32} />,
      color: "bg-blue-50 text-blue-600",
      whenToUse: "Khane ke baad bhari-pan mehsoos hone par.",
      whenNotToUse: "Bahut zyada pet dard ya ulcer ki shikayat ho.",
      warning: "Agar ulti ya dast na rukein toh turant doctor ko dikhayein."
    },
    { 
      id: 3, 
      title: "Haldi Doodh (Immunity)", 
      desc: "Raat ko sone se pehle garam haldi doodh peene se chot aur bimari jaldi theek hoti hai.", 
      wikiUrl: "https://hi.wikipedia.org/wiki/हल्दी",
      category: "General",
      icon: <Flame size={32} />,
      color: "bg-yellow-50 text-yellow-700",
      whenToUse: "Thakan ya halka bukhar mehsoos hone par.",
      whenNotToUse: "Agar aapko 'Gallstones' (pitt ki pathri) ki shikayat hai.",
      warning: "Asli haldi ka hi prayog karein, milawat se bachein."
    },
    { 
      id: 4, 
      title: "Tulsi Chai (Immunity/Cold)", 
      desc: "Tulsi ke patte sardi-zukham aur tanav ko kam karne mein madad karte hain.", 
      wikiUrl: "https://hi.wikipedia.org/wiki/तुलसी",
      category: "Cold",
      icon: <Leaf size={32} />,
      color: "bg-green-50 text-green-600",
      whenToUse: "Sardi ke shuruati lakshan dikhne par.",
      whenNotToUse: "Khoon patla karne wali dawaiyon ke saath kam lein.",
      warning: "Din mein 2-3 baar se zyada na piyein."
    }
  ];

  const filteredRemedies = allRemedies.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-24 max-w-6xl mx-auto p-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-5xl font-black mb-4">Gharelu Nuskhe 🌿</h2>
        <p className="text-2xl font-bold opacity-95">Dadi-Nani ke anmol aur surakshit upchaar.</p>
        <Leaf className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12" />
      </div>

      {/* SEARCH BAR (Bada aur saaf) */}
      <div className="relative">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={32} />
        <input 
          type="text" 
          placeholder="Bimari search karein (e.g. Cold)..."
          className="w-full p-10 pl-20 bg-white rounded-[3rem] border-4 border-slate-50 shadow-xl focus:border-green-500 outline-none text-2xl font-black transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* REMEDY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredRemedies.map((item) => (
          <motion.div 
            layout key={item.id}
            className="bg-white p-10 rounded-[4rem] border-2 border-slate-50 shadow-2xl flex flex-col gap-6"
          >
            {/* Title & Icon */}
            <div className="flex items-center justify-between">
              <div className={`p-6 rounded-3xl ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-6 py-2 rounded-full">
                {item.category}
              </span>
            </div>

            <h3 className="text-3xl font-black text-slate-800">{item.title}</h3>
            <p className="text-xl font-bold text-slate-500 leading-relaxed">{item.desc}</p>

            {/* SAFETY BOX (SAVDHANI) */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 border-2 border-dashed border-slate-200">
              <p className="text-lg font-bold text-green-700 flex items-center gap-2">
                <CheckCircle size={20}/> <span className="uppercase tracking-tight">Kab Lein:</span> {item.whenToUse}
              </p>
              <p className="text-lg font-bold text-orange-600 flex items-center gap-2">
                <Info size={20}/> <span className="uppercase tracking-tight">Kab Na Lein:</span> {item.whenNotToUse}
              </p>
              <p className="text-lg font-bold text-red-500 flex items-center gap-2 italic">
                <AlertTriangle size={20}/> <span className="uppercase tracking-tight underline">Doctor se milein:</span> {item.warning}
              </p>
            </div>

            {/* WIKIPEDIA LINK BUTTON (Bada aur Elder-friendly) */}
            <a 
              href={item.wikiUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 bg-[#278c5f] text-white p-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all hover:bg-green-700"
            >
              📖 Read More on Wikipedia <ExternalLink size={24} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Remedies;