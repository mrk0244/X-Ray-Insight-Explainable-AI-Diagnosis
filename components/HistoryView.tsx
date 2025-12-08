import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, ChevronRight, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onClear, onClose }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-colors">
          <Clock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">No History Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 transition-colors">
          Analyses you perform will be saved here automatically for quick reference.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Analysis History
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">
            Local storage stores your last {history.length} results.
          </p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </button>
      </div>

      <div className="grid gap-4">
        {history.map((item) => {
          const isPneumonia = item.result.diagnosis === 'Pneumonia';
          const date = new Date(item.timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const time = new Date(item.timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 relative transition-colors">
                <img
                  src={item.imageUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center gap-1.5 text-sm font-bold ${isPneumonia ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                     {isPneumonia ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                     {item.result.diagnosis}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 transition-colors">
                    {item.result.confidence}% Conf.
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-4 transition-colors">
                  {item.result.summary}
                </p>
              </div>

              {/* Metadata */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 transition-colors">
                    <Calendar className="w-3 h-3" />
                    {date}
                </div>
                <div className="text-xs text-slate-300 dark:text-slate-600 transition-colors">
                    {time}
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <button onClick={onClose} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
            ← Back to Analyzer
        </button>
      </div>
    </div>
  );
};