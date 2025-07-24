import { Brain, TrendingUp, Target, Users, Zap } from 'lucide-react';

interface PersonalityCardProps {
  title: string;
  score: number;
  type: 'emotions' | 'outlook' | 'focus' | 'influence' | 'riskTolerance';
}

const iconMap = {
  emotions: Brain,
  outlook: TrendingUp,
  focus: Target,
  influence: Users,
  riskTolerance: Zap,
};

const colorMap = {
  emotions: 'text-purple-600',
  outlook: 'text-blue-600',
  focus: 'text-green-600',
  influence: 'text-orange-600',
  riskTolerance: 'text-red-600',
};

const bgColorMap = {
  emotions: 'bg-purple-50',
  outlook: 'bg-blue-50',
  focus: 'bg-green-50',
  influence: 'bg-orange-50',
  riskTolerance: 'bg-red-50',
};

export default function PersonalityCard({ title, score, type }: PersonalityCardProps) {
  const Icon = iconMap[type];
  const iconColor = colorMap[type];
  const bgColor = bgColorMap[type];

  return (
    <div className={`card ${bgColor} border-0`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 ${iconColor}`} />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-2xl font-bold text-gray-900">{score}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            type === 'emotions' ? 'bg-purple-500' :
            type === 'outlook' ? 'bg-blue-500' :
            type === 'focus' ? 'bg-green-500' :
            type === 'influence' ? 'bg-orange-500' :
            'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      <p className="text-sm text-gray-600 mt-3">
        {score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Developing'} in this area
      </p>
    </div>
  );
}