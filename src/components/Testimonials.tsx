import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      text: "Opencorrection a révolutionné ma façon de travailler. Je gagne un temps précieux tout en maintenant un retour pédagogique de qualité pour mes élèves.",
      author: "Marie L.",
      role: "Professeure de français, Lycée"
    },
    {
      text: "Après avoir essayé plusieurs solutions, Opencorrection est la seule qui comprend vraiment les spécificités des copies d'élèves et propose des annotations pertinentes.",
      author: "Thomas R.",
      role: "Professeur d'histoire, Collège"
    },
    {
      text: "L'outil est intuitif et les corrections sont étonnamment précises. Un gain de temps incroyable sans compromis sur la qualité.",
      author: "Sophie M.",
      role: "Professeure d'anglais, Université"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} fill="#F27b57" color="#F27b57" />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Plébiscité par les professeurs : gagnez du temps sans perdre en qualité
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <p className="text-gray-600 italic mb-4">"
                {testimonial.text}
              "</p>
              <div className="mt-4">
                <p className="font-semibold text-gray-800">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Rejoignez plus de 500 enseignants qui font confiance à Opencorrection 
            pour leurs corrections quotidiennes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;