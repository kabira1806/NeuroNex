import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { testBackendConnection } from '../services/apiTest';

const APIStatusCheck = ({ visible = false }) => {
  const [status, setStatus] = useState('checking'); // checking, connected, disconnected
  const [message, setMessage] = useState('Checking backend connection...');

  useEffect(() => {
    const checkConnection = async () => {
      const result = await testBackendConnection();
      if (result.success) {
        setStatus('connected');
        setMessage('✅ Backend API is reachable');
      } else {
        setStatus('disconnected');
        setMessage(`❌ Backend connection failed: ${result.error}`);
      }
    };

    checkConnection();
    // Recheck every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-6 left-6 p-4 rounded-2xl shadow-lg max-w-xs ${
      status === 'connected' ? 'bg-green-50 border-2 border-green-200' :
      status === 'disconnected' ? 'bg-red-50 border-2 border-red-200' :
      'bg-yellow-50 border-2 border-yellow-200'
    }`}>
      <div className="flex items-center gap-3">
        {status === 'checking' && <Loader className="animate-spin text-yellow-600" size={20} />}
        {status === 'connected' && <CheckCircle className="text-green-600" size={20} />}
        {status === 'disconnected' && <AlertCircle className="text-red-600" size={20} />}
        
        <p className={`font-bold text-sm ${
          status === 'connected' ? 'text-green-700' :
          status === 'disconnected' ? 'text-red-700' :
          'text-yellow-700'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default APIStatusCheck;
