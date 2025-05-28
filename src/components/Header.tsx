import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  dashboard?: boolean;
}

const Header: React.FC<HeaderProps> = ({ dashboard = false }) => {
  const { isAuthenticated, logout } = useAuth();
  const [, setSearchParams] = useSearchParams();

  const handleLogin = () => {
    setSearchParams({ login: 'true', mode: 'signin' });
    setTimeout(() => {
      const loginForm = document.getElementById('login-section');
      if (loginForm) {
        loginForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen size={32} className="text-[#62aedf]" />
          <span className="text-2xl font-bold text-gray-800">Opencorrection</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {dashboard && (
            <Link to="/dashboard\" className="text-gray-600 hover:text-[#62aedf]">
              Dashboard
            </Link>
          )}
          
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-[#62aedf] hover:bg-[#4d9ace] text-white font-medium py-2 px-4 rounded-lg"
            >
              Se déconnecter
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-[#62aedf] hover:bg-[#4d9ace] text-white font-medium py-2 px-4 rounded-lg"
            >
              Se connecter
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;