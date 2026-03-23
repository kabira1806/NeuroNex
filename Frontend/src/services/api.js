/**
 * Centralized API Service for NeuroNex Frontend
 * All HTTP requests go through this file
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Helper function for error handling
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    // Try to parse error details
    let errorMessage = `API Error: ${response.status}`;
    
    if (contentType && contentType.includes("application/json")) {
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use text
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (e2) {
          // Fallback
        }
      }
    } else {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch (e) {
        // Fallback
      }
    }
    
    throw new Error(errorMessage);
  }
  
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  return response.text();
};

// ===== AUTH ENDPOINTS =====
export const authAPI = {
  login: async (phone, password, role) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, role }),
    });
    return handleResponse(response);
  },

  register: async (name, phone, password, role, language = "hi") => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        password,
        role: role === "caretaker" ? "caregiver" : role,
        language,
      }),
    });
    return handleResponse(response);
  },

  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },
};

// ===== DASHBOARD ENDPOINTS =====
export const dashboardAPI = {
  getLinkedElders: async (caregiverId) => {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/caregiver/${caregiverId}/elders`,
      { method: "GET" }
    );
    return handleResponse(response);
  },

  getElderSummary: async (elderId, days = 7) => {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/elder/${elderId}/summary?days=${days}`,
      { method: "GET" }
    );
    return handleResponse(response);
  },
};

// ===== MEDICATION ENDPOINTS =====
export const medicationAPI = {
  addMedication: async (elderId, name, dosage, frequency, timeSlot) => {
    const response = await fetch(`${API_BASE_URL}/medications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        elder_id: elderId,
        name,
        dosage,
        time_slot: timeSlot || "09:00",
        scheduled_date: new Date().toISOString(),
      }),
    });
    return handleResponse(response);
  },

  getElderMedications: async (elderId, limit = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/medications/elder/${elderId}?limit=${limit}`,
      { method: "GET" }
    );
    return handleResponse(response);
  },

  markMedicationTaken: async (recordId) => {
    const response = await fetch(
      `${API_BASE_URL}/medications/${recordId}/taken`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
    return handleResponse(response);
  },
};

// ===== CHECKINS ENDPOINTS =====
export const checkinAPI = {
  createCheckin: async (elderId, mood, medicationTaken, transcriptHi = "") => {
    const response = await fetch(`${API_BASE_URL}/checkins/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        elder_id: elderId,
        mood,
        mood_confidence: 0.8,
        medication_taken: medicationTaken,
        medication_notes: "",
        voice_log_url: null,
        transcript_hi: transcriptHi,
      }),
    });
    return handleResponse(response);
  },

  getElderCheckins: async (elderId, limit = 30) => {
    const response = await fetch(
      `${API_BASE_URL}/checkins/elder/${elderId}?limit=${limit}`,
      { method: "GET" }
    );
    return handleResponse(response);
  },

  getLatestCheckin: async (elderId) => {
    const response = await fetch(
      `${API_BASE_URL}/checkins/elder/${elderId}/latest`,
      { method: "GET" }
    );
    return handleResponse(response);
  },
};

// ===== VITALS ENDPOINTS =====
export const vitalsAPI = {
  recordVital: async (elderId, vitalType, value, unit = null, source = "manual") => {
    const response = await fetch(`${API_BASE_URL}/vitals/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        elder_id: elderId,
        vital_type: vitalType,
        value,
        unit,
        source,
      }),
    });
    return handleResponse(response);
  },

  recordBloodPressure: async (elderId, systolic, diastolic, source = "manual") => {
    const response = await fetch(
      `${API_BASE_URL}/vitals/bp?elder_id=${elderId}&systolic=${systolic}&diastolic=${diastolic}&source=${source}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return handleResponse(response);
  },

  getElderVitals: async (elderId, limit = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/vitals/elder/${elderId}?limit=${limit}`,
      { method: "GET" }
    );
    return handleResponse(response);
  },
};

// ===== ALERTS ENDPOINTS =====
export const alertsAPI = {
  getElderAlerts: async (elderId, limit = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/alerts/elder/${elderId}?limit=${limit}`,
      { method: "GET" }
    );
    return handleResponse(response);
  },

  markAlertAsRead: async (alertId) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },
};

// ===== VOICEBOT ENDPOINTS =====
export const voicebotAPI = {
  sendVoiceMessage: async (elderId, audioBlob) => {
    const formData = new FormData();
    formData.append("elder_id", elderId);
    
    // Use appropriate file extension based on blob type
    let filename = "audio.webm";
    if (audioBlob.type.includes('wav')) {
      filename = "audio.wav";
    } else if (audioBlob.type.includes('mp4')) {
      filename = "audio.mp4";
    } else if (audioBlob.type.includes('ogg')) {
      filename = "audio.ogg";
    }
    
    formData.append("audio", audioBlob, filename);

    const response = await fetch(`${API_BASE_URL}/voicebot/process`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(response);
  },
};

// ===== CAREGIVER ENDPOINTS =====
export const caregiverAPI = {
  linkCaregiver: async (elderId, caregiverId) => {
    const response = await fetch(`${API_BASE_URL}/users/caregiver-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elder_id: elderId, caregiver_id: caregiverId }),
    });
    return handleResponse(response);
  },

  getCaregiverElders: async (caregiverId) => {
    const response = await fetch(`${API_BASE_URL}/users/caregiver/${caregiverId}/elders`);
    return handleResponse(response);
  },

  unlinkCaregiver: async (elderId, caregiverId) => {
    const response = await fetch(
      `${API_BASE_URL}/users/caregiver-link/${elderId}/${caregiverId}`,
      {
        method: "DELETE",
      }
    );
    return handleResponse(response);
  },
};

export default {
  authAPI,
  dashboardAPI,
  medicationAPI,
  checkinAPI,
  vitalsAPI,
  alertsAPI,
  voicebotAPI,
  caregiverAPI,
};
