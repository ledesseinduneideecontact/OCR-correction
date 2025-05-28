import React, { useState } from 'react';
import { Upload, School, File, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CorrectionFormProps {
  onSubmit: (id: string) => void;
  disabled: boolean;
}

interface FormData {
  classLevel: string;
  studentCopies: File[];
  perfectAnswer: File | null;
  gradingCriteria: string;
}

const CorrectionForm: React.FC<CorrectionFormProps> = ({ onSubmit, disabled }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    classLevel: '',
    studentCopies: [],
    perfectAnswer: null,
    gradingCriteria: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudentCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        studentCopies: Array.from(e.target.files!)
      }));
    }
  };

  const handlePerfectAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        perfectAnswer: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour continuer');
      navigate('/?login=true');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create correction record
      const { data: correction, error: dbError } = await supabase
        .from('corrections')
        .insert({
          user_id: user.id,
          class_level: formData.classLevel,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formData.studentCopies.forEach(file => {
        formDataToSend.append('files', file);
      });
      formDataToSend.append('correctionId', correction.id);
      formDataToSend.append('gradingCriteria', formData.gradingCriteria);
      if (formData.perfectAnswer) {
        formDataToSend.append('perfectAnswer', formData.perfectAnswer);
      }

      // Send to local backend endpoint
      const response = await fetch('http://localhost:3000/process', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process files');
      }

      onSubmit(correction.id);
      toast.success('Correction lancée avec succès!');

      // Reset form
      setFormData({
        classLevel: '',
        studentCopies: [],
        perfectAnswer: null,
        gradingCriteria: ''
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Erreur lors de la soumission: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            <div className="flex items-center space-x-2 mb-1">
              <School size={20} className="text-[#62aedf]" />
              <span>Niveau de la classe</span>
            </div>
            <input
              type="text"
              value={formData.classLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, classLevel: e.target.value }))}
              placeholder="Ex: 3ème, Terminale S, L1 Droit..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#62aedf] focus:border-transparent"
              required
              disabled={disabled || isSubmitting}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            <div className="flex items-center space-x-2 mb-1">
              <Upload size={20} className="text-[#62aedf]" />
              <span>Copies des élèves</span>
            </div>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleStudentCopiesChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
                disabled={disabled || isSubmitting}
              />
              <div className="flex flex-col items-center">
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {formData.studentCopies.length > 0 
                    ? `${formData.studentCopies.length} fichier(s) sélectionné(s)` 
                    : 'Glissez-déposez vos fichiers ou cliquez pour parcourir'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG acceptés</p>
              </div>
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            <div className="flex items-center space-x-2 mb-1">
              <File size={20} className="text-[#62aedf]" />
              <span>Sujet parfait (corrigé type)</span>
            </div>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                onChange={handlePerfectAnswerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
                disabled={disabled || isSubmitting}
              />
              <div className="flex flex-col items-center">
                <File size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {formData.perfectAnswer 
                    ? formData.perfectAnswer.name 
                    : 'Corrigé type ou réponse parfaite attendue'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, Word, texte ou image</p>
              </div>
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            <div className="flex items-center space-x-2 mb-1">
              <CheckSquare size={20} className="text-[#62aedf]" />
              <span>Barème</span>
            </div>
            <textarea
              value={formData.gradingCriteria}
              onChange={(e) => setFormData(prev => ({ ...prev, gradingCriteria: e.target.value }))}
              placeholder="Détaillez votre barème point par point..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-[#62aedf] focus:border-transparent resize-none"
              required
              disabled={disabled || isSubmitting}
            ></textarea>
          </label>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className={`
            py-3 px-8 rounded-lg text-white font-semibold
            ${(disabled || isSubmitting)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#62c07a] hover:bg-[#52a868] shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300'
            }
          `}
        >
          {isSubmitting ? 'Traitement en cours...' : 'Valider'}
        </button>
      </div>
    </form>
  );
};

export default CorrectionForm;