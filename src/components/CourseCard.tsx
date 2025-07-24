import React from 'react';
import { Clock, Star } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200 group cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
          {course.title}
        </h3>
        {course.recommended && (
          <Star className="w-4 h-4 text-accent-500 fill-current" />
        )}
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{course.duration}</span>
        </div>
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
          {course.category}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200">
          Start Course
        </button>
      </div>
    </div>
  );
}