'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { QUESTIONNAIRE_QUESTIONS } from '@/lib/questionnaire-config';

interface QuestionnaireProps {
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export default function Questionnaire({ onComplete, onSkip, isLoading = false }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONNAIRE_QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONNAIRE_QUESTIONS.length - 1;
  const progress = ((currentQuestion + 1) / QUESTIONNAIRE_QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [question.id]: value
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle>Cuestionario de Perfil Profesional</CardTitle>
            <CardDescription>
              Pregunta {currentQuestion + 1} de {QUESTIONNAIRE_QUESTIONS.length}
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            Saltar cuestionario
          </Button>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label className="text-lg font-medium mb-4 block">
            {question.question}
          </Label>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isLoading}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border border-gray-300 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isLoading}
          >
            Anterior
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
              Saltar
            </Button>
          </div>
        </div>

        {/* Respuestas previas */}
        {Object.keys(answers).length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Respuestas guardadas:</p>
            <div className="text-xs text-gray-500 space-y-1">
              {Object.entries(answers).map(([key, value]) => {
                const q = QUESTIONNAIRE_QUESTIONS.find(q => q.id === key);
                return (
                  <div key={key} className="truncate">
                    <strong>{q?.question.slice(0, 30)}...</strong> {value}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}