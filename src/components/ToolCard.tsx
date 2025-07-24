import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200 group cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
          {tool.title}
        </h3>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
      </div>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {tool.description}
      </p>
      
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
          {tool.category}
        </span>
      </div>
    </div>
  );
}