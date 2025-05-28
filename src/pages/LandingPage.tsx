import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import LoginForm from '../components/LoginForm';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const showLogin = searchParams.get('login') === 'true';

  useEffect(() => {
    if (showLogin) {
      setTimeout(() => {
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
          loginSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [showLogin]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div id="login-section" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {!isAuthenticated && <LoginForm />}
          </div>
        </div>
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;