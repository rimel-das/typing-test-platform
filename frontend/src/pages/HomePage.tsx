import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import apiService from '../services/api';

/**
 * HomePage
 * Main landing page with test options
 */

const HomePage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('normal');
  
  const startTest = () => {
    navigate('/test', { state: { duration, difficulty } });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">TypingTest</h1>
          <nav className="space-x-4">
            {user ? (
              <>
                <span className="text-slate-300">{user.username}</span>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 hover:text-primary transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/stats')}
                  className="px-4 py-2 hover:text-primary transition-colors"
                >
                  Stats
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-primary text-black rounded hover:bg-yellow-500 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-slate-100">Test Your Typing Speed</h2>
          <p className="text-slate-400 text-lg">
            Improve your typing speed and accuracy with real-time feedback
          </p>
        </div>
        
        {/* Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Duration Selection */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Duration</h3>
            <div className="space-y-2">
              {[15, 30, 60, 120].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  className={`w-full py-2 px-4 rounded transition-colors ${
                    duration === dur
                      ? 'bg-primary text-black font-semibold'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                  }`}
                >
                  {dur} seconds
                </button>
              ))}
            </div>
          </div>
          
          {/* Difficulty Selection */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Difficulty</h3>
            <div className="space-y-2">
              {['easy', 'normal', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`w-full py-2 px-4 rounded transition-colors capitalize ${
                    difficulty === diff
                      ? 'bg-primary text-black font-semibold'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
          
          {/* Test Modes */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Mode</h3>
            <div className="space-y-2">
              {['Time', 'Words', 'Quote'].map((mode) => (
                <button
                  key={mode}
                  className="w-full py-2 px-4 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={startTest}
            className=\"text-xl font-bold py-4 px-12 bg-primary hover:bg-yellow-500 text-black rounded-lg transition-colors\"\n          >\n            Start Test\n          </button>\n        </div>\n      </main>\n    </div>\n  );\n};\n\nexport default HomePage;
