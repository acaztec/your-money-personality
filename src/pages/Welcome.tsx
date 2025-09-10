import { Link } from 'react-router-dom';
import { Brain, TrendingUp, MessageCircle, ArrowRight, Sparkles, Target, Clock } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating particles background */}
      <div className="particles-bg">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Header with glassmorphism */}
      <div className="glass-card border-0 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <img 
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
              alt="iGrad Enrich" 
              className="h-10 w-auto floating-element"
            />
            <Link
              to="/advisor"
              className="nav-link text-sm font-medium"
            >
              For Advisors
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section with asymmetric layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Discover Your
                <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Money Personality
                </span>
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
                Unlock the emotional side of your financial decisions with our scientifically-designed assessment. 
                Get personalized insights and actionable guidance in just 10 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/assessment" className="btn-primary group">
                <Sparkles className="w-5 h-5 mr-3" />
                <span>Start Assessment</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary">
                <MessageCircle className="w-5 h-5 mr-3" />
                <span>Learn More</span>
              </button>
            </div>

            {/* Mini stats */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="stat-number text-3xl font-bold">500K+</div>
                <div className="text-gray-600 text-sm">Assessments</div>
              </div>
              <div className="text-center">
                <div className="stat-number text-3xl font-bold">95%</div>
                <div className="text-gray-600 text-sm">Complete</div>
              </div>
              <div className="text-center">
                <div className="stat-number text-3xl font-bold">10min</div>
                <div className="text-gray-600 text-sm">Duration</div>
              </div>
            </div>
          </div>

          {/* Right column - Floating visual elements */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main floating card */}
              <div className="modern-card floating-element">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    42 Questions
                  </h3>
                  <p className="text-gray-600">
                    Scientifically designed to analyze your financial behaviors across five key dimensions
                  </p>
                </div>
              </div>

              {/* Smaller floating elements */}
              <div className="absolute -top-4 -right-4 modern-card p-4 floating-element" style={{ animationDelay: '2s' }}>
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 modern-card p-4 floating-element" style={{ animationDelay: '4s' }}>
                <Clock className="w-8 h-8 text-accent-600" />
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute inset-0 -z-10">
              <div className="w-72 h-72 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with unique grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Take This Assessment?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get deep insights into your financial psychology with our research-backed approach
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Behavioral Science",
              description: "Based on behavioral economics research and validated psychological frameworks",
              color: "from-blue-500 to-indigo-600"
            },
            {
              icon: TrendingUp,
              title: "Personalized Insights", 
              description: "Detailed analysis of your strengths, challenges, and personalized action plans",
              color: "from-green-500 to-emerald-600"
            },
            {
              icon: MessageCircle,
              title: "Instant Results",
              description: "Comprehensive report available immediately after completion",
              color: "from-purple-500 to-pink-600"
            }
          ].map((feature, index) => (
            <div key={index} className="feature-card modern-card group hover:scale-105 transition-all duration-300">
              <div className="text-center space-y-6">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="modern-card space-y-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Ready to Discover Your Money Personality?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join over 500,000 people who have gained valuable insights into their financial behaviors
          </p>
          <Link to="/assessment" className="btn-primary inline-flex">
            <Sparkles className="w-5 h-5 mr-3" />
            <span>Take Assessment Now</span>
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}