import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentCard from '../components/AssessmentCard';
import { calculateProfile } from '../utils/profileCalculator';
import questionsData from '../data/questions.json';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questionsData.length).fill(4));

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete assessment
      const profile = calculateProfile(answers);
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <AssessmentCard
      question={questionsData[currentQuestion]}
      questionNumber={currentQuestion + 1}
      totalQuestions={questionsData.length}
      value={answers[currentQuestion]}
      onChange={handleAnswerChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canGoNext={true}
      canGoPrevious={currentQuestion > 0}
    />
  );
}