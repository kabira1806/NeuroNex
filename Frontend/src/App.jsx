import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VoiceAssistant from './components/VoiceAssistant'; 
import Overview from './pages/Overview';
import Medications from './pages/Medications';
import Trends from './pages/Trends';
import Vault from './pages/Vault';
import Remedies from './pages/Remedies';
import Caretaker from './pages/Caretaker';
import Login from './pages/Login';
import Register from './pages/Register';
import { medicationAPI } from './services/api';

function App() {
  // --- 1. State Management ---
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isSidebarOpen] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [medicineError, setMedicineError] = useState('');
  
  const navigate = useNavigate();
  // location unused

  // --- 2. API Functions ---

  // Fetch medicines specific to the logged-in user
  const fetchMedicines = async () => {
    if (!currentUser?.id) return;
    
    try {
      setMedicineError('');
      const data = await medicationAPI.getElderMedications(currentUser.id);
      setMedicines(data);
    } catch (error) {
      console.error("Medicine fetch error:", error);
      setMedicineError(error.message || "Failed to load medicines");
    }
  };

  // Toggle medicine status (Taken/Pending)
  const toggleMedicine = async (id) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    
    try {
      await medicationAPI.markMedicationTaken(id);
      // Refresh the medicines list
      fetchMedicines();
    } catch (error) {
      console.error("Toggle error:", error);
      setMedicineError(error.message || "Failed to update medicine status");
    }
  };

  // Add new medicine tied to the current user
  const addMedicine = async (newMed) => {
    if (!currentUser?.id) return;

    try {
      setMedicineError('');
      await medicationAPI.addMedication(
        currentUser.id,
        newMed.name,
        newMed.dosage,
        newMed.frequency || 'Daily',
        newMed.time || '09:00'
      );
      // Refresh the medicines list
      fetchMedicines();
    } catch (error) {
      console.error("Add medicine error:", error);
      setMedicineError(error.message || "Failed to add medicine");
    }
  };

  // --- 3. Authentication Handlers ---

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setUserRole(userData.role);
    
    // Redirect based on role
    if (userData.role === 'caretaker' || userData.role === 'caregiver') {
        navigate('/caretaker');
    } else {
        navigate('/overview');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setMedicines([]);
    setMedicineError('');
    navigate('/login');
  };

  // --- 4. Effects ---

  // Automatically fetch medicines whenever the user logs in
  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMedicines();
    }
  }, [currentUser]);

  // --- 5. Routing ---

  // If not logged in, only allow access to login or register
  if (!userRole) {
    return (
      <Routes>
        <Route path="/register" element={<Register onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToRegister={() => navigate('/register')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar navigation */}
      <Sidebar 
        userRole={userRole} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <main className={`flex-1 p-4 md:p-12 transition-all ${isSidebarOpen ? 'md:ml-72' : 'md:ml-28'}`}>
        <div className="max-w-6xl mx-auto">
          <Routes>
             {userRole === 'caretaker' || userRole === 'caregiver' ? (
                 <>
                   <Route path="/caretaker" element={<Caretaker user={currentUser} medicines={medicines} />} />
                   <Route path="/medications" element={<Medications user={currentUser} medicines={medicines} onToggle={toggleMedicine} onAdd={addMedicine} error={medicineError} />} />
                   <Route path="/trends" element={<Trends />} />
                   <Route path="/vault" element={<Vault />} />
                   <Route path="*" element={<Navigate to="/caretaker" replace />} />
                 </>
             ) : (
                 <>
                   <Route path="/overview" element={<Overview user={currentUser} />} />
                   <Route path="/medications" element={<Medications user={currentUser} medicines={medicines} onToggle={toggleMedicine} onAdd={addMedicine} error={medicineError} />} />
                   <Route path="/trends" element={<Trends />} />
                   <Route path="/vault" element={<Vault />} />
                   <Route path="/remedies" element={<Remedies />} />
                   <Route path="*" element={<Navigate to="/overview" replace />} />
                 </>
             )}
          </Routes>
        </div>
      </main>

      {/* Global AI Assistant */}
      <VoiceAssistant user={currentUser} />
    </div>
  );
}

export default App;