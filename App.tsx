import React, { useState, useEffect } from 'react';
import { Activity, Stethoscope, History as HistoryIcon, Sun, Moon } from 'lucide-react';
import { Uploader } from './components/Uploader';
import { AnalysisView } from './components/AnalysisView';
import { HistoryView } from './components/HistoryView';
import { analyzeXRayImage } from './services/gemini';
import { AppState, AnalysisResult, HistoryItem } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      if (typeof window !== 'undefined') {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) return savedTheme as 'light' | 'dark';
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('xray_insight_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  const saveToHistory = (base64Image: string, result: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl: base64Image,
      result: result
    };

    // Keep only the last 10 items to avoid localStorage quota limits with base64 images
    const updatedHistory = [newItem, ...history].slice(0, 10);
    
    setHistory(updatedHistory);
    try {
      localStorage.setItem('xray_insight_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save history (likely quota exceeded):", error);
      // Optionally handle quota exceeded visually
    }
  };

  const handleImageSelected = async (base64Image: string) => {
    setCurrentImage(base64Image);
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    setShowHistory(false); // Ensure we are on the main view

    try {
      const result = await analyzeXRayImage(base64Image);
      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);
      saveToHistory(base64Image, result);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to analyze image. Please ensure you have a valid API Key and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setCurrentImage(null);
    setAnalysisResult(null);
    setShowHistory(false);
  };

  const clearHistory = () => {
    if(confirm("Are you sure you want to clear your analysis history?")) {
        setHistory([]);
        localStorage.removeItem('xray_insight_history');
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item.imageUrl);
    setAnalysisResult(item.result);
    setAppState(AppState.SUCCESS);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">X-Ray Insight</h1>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Explainable Medical AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
             >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>

             <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showHistory 
                    ? 'bg-slate-900 dark:bg-slate-700 text-white' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
             >
                <HistoryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
             </button>

             <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 transition-colors">
                <Stethoscope className="w-4 h-4" />
                <span>Powered by Advanced Vision AI</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {showHistory ? (
            <HistoryView 
                history={history} 
                onSelect={loadHistoryItem} 
                onClear={clearHistory}
                onClose={() => setShowHistory(false)}
            />
        ) : (
            <>
                {appState === AppState.IDLE && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="text-center max-w-2xl mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">
                        "Why" matters in Medicine.
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                        Upload a chest X-ray to detect Pneumonia. Unlike standard AI, X-Ray Insight visualizes <span className="font-semibold text-indigo-600 dark:text-indigo-400">heatmap activations</span> to show you exactly what the model is looking at.
                      </p>
                    </div>
                    <Uploader onImageSelected={handleImageSelected} state={appState} />
                  </div>
                )}

                {appState === AppState.ANALYZING && (
                  <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
                    <div className="relative w-64 h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mb-8 border-4 border-slate-800 dark:border-slate-700">
                       {currentImage && (
                           <img src={currentImage} className="w-full h-full object-cover opacity-50 blur-sm" alt="Processing" />
                       )}
                       <div className="scan-line"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                           <Activity className="w-16 h-16 text-indigo-400 animate-pulse" />
                       </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">Analyzing Radiographs</h3>
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse transition-colors">Extracting features & generating gradient maps...</p>
                  </div>
                )}

                {appState === AppState.SUCCESS && analysisResult && currentImage && (
                  <AnalysisView 
                    imageSrc={currentImage}
                    result={analysisResult}
                    onReset={resetApp}
                  />
                )}

                {appState === AppState.ERROR && (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Analysis Failed</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 transition-colors">{errorMsg}</p>
                    <button 
                        onClick={resetApp}
                        className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                    >
                        Try Again
                    </button>
                  </div>
                )}
            </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>© 2024 X-Ray Insight. This is a demo for Explainable AI (XAI) purposes only.</p>
          <p className="mt-2 text-xs">Not for actual medical diagnosis. Always consult a certified radiologist.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;