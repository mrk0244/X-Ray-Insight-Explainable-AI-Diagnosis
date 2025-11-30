import React, { useState } from 'react';
import { Activity, Github, Stethoscope } from 'lucide-react';
import { Uploader } from './components/Uploader';
import { AnalysisView } from './components/AnalysisView';
import { analyzeXRayImage } from './services/gemini';
import { AppState, AnalysisResult } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageSelected = async (base64Image: string) => {
    setCurrentImage(base64Image);
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const result = await analyzeXRayImage(base64Image);
      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">X-Ray Insight</h1>
              <span className="text-xs font-medium text-slate-500">Explainable Medical AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Stethoscope className="w-4 h-4" />
                <span>Powered by Advanced Vision AI</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="text-center max-w-2xl mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                "Why" matters in Medicine.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Upload a chest X-ray to detect Pneumonia. Unlike standard AI, X-Ray Insight visualizes <span className="font-semibold text-indigo-600">heatmap activations</span> to show you exactly what the model is looking at.
              </p>
            </div>
            <Uploader onImageSelected={handleImageSelected} state={appState} />
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
            <div className="relative w-64 h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mb-8 border-4 border-slate-800">
               {currentImage && (
                   <img src={currentImage} className="w-full h-full object-cover opacity-50 blur-sm" alt="Processing" />
               )}
               <div className="scan-line"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                   <Activity className="w-16 h-16 text-indigo-400 animate-pulse" />
               </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Radiographs</h3>
            <p className="text-slate-500 animate-pulse">Extracting features & generating gradient maps...</p>
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
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis Failed</h3>
            <p className="text-slate-600 max-w-md mb-8">{errorMsg}</p>
            <button 
                onClick={resetApp}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
                Try Again
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-auto bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 X-Ray Insight. This is a demo for Explainable AI (XAI) purposes only.</p>
          <p className="mt-2 text-xs">Not for actual medical diagnosis. Always consult a certified radiologist.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;