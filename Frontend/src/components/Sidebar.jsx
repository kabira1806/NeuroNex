import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Pill, Activity, ShieldCheck, 
  Leaf, Menu, X, Stethoscope, LogOut,
  PanelLeftClose, PanelLeftOpen // Added these for the toggle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ userRole, onLogout }) => {
  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Desktop collapsed state (DeepSeek style)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Derive activePage from pathname
  const activePagePath = location.pathname.substring(1) || '';
  // Simple check for active based on part of the URL
  const isActive = (id) => activePagePath.toLowerCase().startsWith(id.toLowerCase());

  // Handle window resize to switch modes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Reset collapse on mobile
      }
    };
    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🟢 1. ELDER (Buzurg) Menu
  const elderMenu = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={24}/> },
    { id: 'medications', label: 'Dawaiyan', icon: <Pill size={24}/> },
    { id: 'trends', label: 'Trends', icon: <Activity size={24}/> },
    { id: 'remedies', label: 'Nuskhe', icon: <Leaf size={24}/> },
    { id: 'vault', label: 'Vault', icon: <ShieldCheck size={24}/> },
  ];

  // 🟣 2. CARETAKER Menu
  const caretakerMenu = [
    { id: 'caretaker', label: 'Dashboard', icon: <Stethoscope size={24}/> },
    { id: 'medications', label: 'Med Tracker', icon: <Pill size={24}/> },
    { id: 'trends', label: 'Health Log', icon: <Activity size={24}/> },
    { id: 'vault', label: 'Docs Vault', icon: <ShieldCheck size={24}/> },
  ];

  const menuToDisplay = (userRole === 'caretaker' || userRole === 'caregiver') ? caretakerMenu : elderMenu;

  // Animation Variants
  const sidebarVariants = {
    expanded: { width: "18rem" }, // w-72
    collapsed: { width: "5rem" }  // w-20
  };

  return (
    <>
      {/* --- Mobile Toggle Button (Only visible on mobile) --- */}
      {isMobile && !isMobileOpen && (
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="fixed top-5 left-5 z-50 p-3 bg-white rounded-2xl shadow-lg border border-slate-100"
        >
          <Menu size={32} className="text-[#278c5f]" />
        </button>
      )}

      {/* --- Mobile Overlay --- */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileOpen(false)} 
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" 
          />
        )}
      </AnimatePresence>
            
      {/* --- Main Sidebar (Handles both Desktop & Mobile styles) --- */}
      <motion.aside 
        initial={isMobile ? { x: '-100%' } : false}
        animate={
          isMobile 
            ? { x: isMobileOpen ? 0 : '-100%' } // Mobile Slide in/out
            : isCollapsed ? "collapsed" : "expanded" // Desktop Width Resize
        }
        variants={!isMobile ? sidebarVariants : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed inset-y-0 left-0 z-[110] bg-white border-r shadow-2xl md:shadow-none flex flex-col h-full
          ${isMobile ? 'w-72 p-8' : 'overflow-hidden'} 
          ${!isMobile && isCollapsed ? 'p-4' : 'p-6'}
        `}
      >
        {/* --- Header: Logo & Toggles --- */}
        <div className={`flex items-center mb-10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          
          {/* Logo - Hide text if collapsed */}
          {(!isCollapsed || isMobile) && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-3xl font-black text-[#278c5f] italic tracking-tighter whitespace-nowrap overflow-hidden"
            >
              NeuroNex
            </motion.div>
          )}

          {/* Desktop Toggle (DeepSeek Style) */}
          {!isMobile && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="text-gray-400 hover:text-[#278c5f] transition-colors p-1 rounded-md hover:bg-slate-100"
            >
              {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-slate-100 rounded-full">
              <X size={24}/>
            </button>
          )}
        </div>

        {/* --- Navigation Menu --- */}
        <nav className="space-y-3 flex-1">
          {menuToDisplay.map((item) => (
            <button
              key={item.id}
              onClick={() => { 
                navigate(`/${item.id}`);
                if(isMobile) setIsMobileOpen(false); 
              }}
              title={isCollapsed ? item.label : ""} // Tooltip when collapsed
              className={`
                flex items-center transition-all duration-300 rounded-2xl
                ${isCollapsed ? 'justify-center w-full p-3' : 'w-full gap-4 p-4'}
                ${isActive(item.id) 
                  ? 'bg-[#278c5f] text-white shadow-xl' 
                  : 'text-gray-400 hover:bg-green-50 hover:text-[#278c5f]'
                }
              `}
            >
              <div className="shrink-0">{item.icon}</div>
              
              {/* Text Label - Hidden when collapsed */}
              {(!isCollapsed || isMobile) && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="font-bold text-lg whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        {/* --- Footer / Logout --- */}
        <button 
          onClick={onLogout}
          title={isCollapsed ? "Logout" : ""}
          className={`
            mt-4 flex items-center transition-all duration-300 rounded-2xl text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent
            ${isCollapsed ? 'justify-center w-full p-3' : 'w-full gap-4 p-4'}
          `}
        >
          <LogOut size={24} className="shrink-0" />
          {(!isCollapsed || isMobile) && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-bold whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
        </button>

      </motion.aside>
    </>
  );
};

export default Sidebar;