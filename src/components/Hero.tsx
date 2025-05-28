import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const handleCTA = () => {
    setSearchParams({ login: 'true', mode: 'signup' });
    setTimeout(() => {
      const loginForm = document.getElementById('login-section');
      if (loginForm) {
        loginForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <section className="bg-gradient-to-br from-[#62aedf]/10 to-[#62c07a]/10 py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 leading-tight">
          Corrigez vos copies en un clic<br className="hidden md:block" /> grâce à l'IA
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Gagnez du temps, gardez la qualité pédagogique
        </p>
        
        <button
          onClick={handleCTA}
          className="bg-[#F27b57] hover:bg-[#e06a48] text-white text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
        >
          Testez gratuitement
        </button>
        
        <p className="text-gray-500 mt-3">
          Aucune carte bancaire requise pour l'essai
        </p>
        
        <div className="mt-16 flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <img 
                src="https://images.pexels.com/photos/4260477/pexels-photo-4260477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Teacher using Opencorrection"
                className="w-64 h-40 object-cover rounded-lg shadow-sm"
              />
              <div className="text-left max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Libérez votre temps pour ce qui compte vraiment
                </h3>
                <p className="text-gray-600">
                  Les enseignants économisent en moyenne 5 heures par semaine 
                  en utilisant Opencorrection pour les corrections de copies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;