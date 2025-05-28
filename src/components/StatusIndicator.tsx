import React from 'react';
import { CheckCircle, Loader } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'processing' | 'completed';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <div className="mt-8 p-4 rounded-lg bg-gray-50">
      {status === 'processing' ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin mb-4">
            <Loader size={32} className="text-[#62aedf]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Correction en cours...</h3>
          <div className="w-full max-w-md mt-4 bg-gray-200 rounded-full h-2.5">
            <div className="bg-[#62aedf] h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-gray-600 mt-2">
            Nous analysons vos documents et appliquons l'IA à vos corrections.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <CheckCircle size={48} className="text-[#62c07a] mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">Correction terminée!</h3>
          <p className="text-gray-600 text-center mt-2 max-w-md">
            Votre correction est en cours. Vous recevrez le résultat par email sous quelques minutes.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;