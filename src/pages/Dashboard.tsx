import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import CorrectionForm from '../components/CorrectionForm';
import StatusIndicator from '../components/StatusIndicator';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Correction {
  id: string;
  class_level: string;
  status: string;
  created_at: string;
  result_url?: string;
}

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [correctionId, setCorrectionId] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Fetch user's corrections
      const fetchCorrections = async () => {
        const { data, error } = await supabase
          .from('corrections')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Failed to load corrections');
        } else {
          setCorrections(data || []);
        }
      };

      fetchCorrections();
    }
  }, [user]);

  useEffect(() => {
    if (correctionId) {
      const channel = supabase
        .channel('corrections-channel')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'corrections',
            filter: `id=eq.${correctionId}`
          },
          (payload) => {
            if (payload.new) {
              setStatus(payload.new.status === 'completed' ? 'completed' : 'processing');
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [correctionId]);

  const handleSubmit = async (id: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit corrections');
      navigate('/?login=true');
      return;
    }
    setCorrectionId(id);
    setStatus('processing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header dashboard />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#62aedf] mb-4">Nouvelle correction</h2>
          <CorrectionForm onSubmit={handleSubmit} disabled={status === 'processing'} />
          {status !== 'idle' && <StatusIndicator status={status} />}
        </div>

        {isAuthenticated && corrections.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-[#62aedf] mb-4">Historique des corrections</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Niveau</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {corrections.map((correction) => (
                    <tr key={correction.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {new Date(correction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{correction.class_level}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          correction.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : correction.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {correction.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {correction.result_url && (
                          <a
                            href={correction.result_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#62aedf] hover:underline"
                          >
                            Télécharger
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;