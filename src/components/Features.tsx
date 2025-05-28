import React from 'react';
import { ScanLine, CheckSquare, FileText } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <ScanLine size={48} className="text-[#62aedf]" />,
      title: "Scannez vos copies",
      description: "Importez vos copies en quelques secondes, en format PDF ou image."
    },
    {
      icon: <CheckSquare size={48} className="text-[#62c07a]" />,
      title: "Définissez votre barème",
      description: "Personnalisez votre notation selon vos critères pédagogiques."
    },
    {
      icon: <FileText size={48} className="text-[#F27b57]" />,
      title: "Recevez vos corrections détaillées",
      description: "Obtenez un document Word avec annotations et notations par email."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Correction simplifiée en trois étapes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 p-3 rounded-full bg-gray-50">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-[#62aedf] to-[#62c07a] p-8 rounded-lg shadow-md text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Notre technologie avancée fait la différence</h3>
          <p className="text-lg max-w-3xl mx-auto">
            Opencorrection utilise la reconnaissance optique de caractères de Google Vision 
            pour numériser précisément les copies manuscrites, puis applique l'intelligence 
            artificielle pour une correction pédagogique adaptée à vos critères.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;