import React from 'react';
import { BookOpen, Mail, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen size={24} className="text-[#62aedf]" />
              <span className="text-xl font-bold">Opencorrection</span>
            </div>
            <p className="text-gray-400 max-w-xs">
              La solution innovante qui aide les enseignants à gagner du temps 
              tout en maintenant un haut niveau de qualité pédagogique.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Produit</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Témoignages</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Ressources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Tutoriels</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Opencorrection. Tous droits réservés.
          </p>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">
              <Mail size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#62aedf] transition-colors">
              <Shield size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;