import { useState } from "react";
import { Brain, Clock, Zap, BookOpen, Target, TrendingUp, CheckCircle } from "lucide-react";

export default function ExplanationPanel({ explanation }) {
  const [open, setOpen] = useState(false);

  if (!explanation) return null;

  const steps = Array.isArray(explanation.steps) ? explanation.steps : [];
  const confidence = explanation.confidence || 0;
  const confidenceColor = confidence >= 0.8 ? 'text-green-600' : confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';
  const confidenceBg = confidence >= 0.8 ? 'bg-green-100' : confidence >= 0.6 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
      >
        <Brain size={16} />
        {open ? "Hide explanation" : "Why this answer?"}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${confidenceBg} ${confidenceColor}`}>
          {Math.round(confidence * 100)}%
        </span>
      </button>

      {open && (
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 mt-3 rounded-lg border border-blue-200 shadow-sm">
          {/* Header with key metrics */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <Brain size={18} className="text-blue-600" />
              AI Reasoning Process
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {explanation.processing_time && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {explanation.processing_time}
                </span>
              )}
              {explanation.model_version && (
                <span className="flex items-center gap-1">
                  <Zap size={12} />
                  {explanation.model_version}
                </span>
              )}
            </div>
          </div>

          {/* Reasoning */}
          {explanation.reasoning && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-blue-500" />
                <h5 className="font-semibold text-sm text-gray-700">Reasoning</h5>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{explanation.reasoning}</p>
            </div>
          )}

          {/* Domain and Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {explanation.domain && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-purple-500" />
                  <h5 className="font-semibold text-sm text-gray-700">Domain</h5>
                </div>
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {explanation.domain.charAt(0).toUpperCase() + explanation.domain.slice(1)}
                </span>
              </div>
            )}
            
            {explanation.keywords && explanation.keywords.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-green-500" />
                  <h5 className="font-semibold text-sm text-gray-700">Key Concepts</h5>
                </div>
                <div className="flex flex-wrap gap-1">
                  {explanation.keywords.map((keyword, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-step process */}
          {steps.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-blue-500" />
                <h5 className="font-semibold text-sm text-gray-700">Step-by-Step Process</h5>
              </div>
              <div className="space-y-2">
                {steps.map((step, i) => {
                  const label = step?.step || `Step ${i + 1}`;
                  const description = step?.description || '';
                  return (
                    <div key={i} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-gray-200">
                      <div className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">{label}</div>
                        {description && (
                          <div className="text-sm text-gray-600 mt-1">{description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confidence Score */}
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-sm text-gray-700">Confidence Score</h5>
              <span className={`font-bold text-lg ${confidenceColor}`}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  confidence >= 0.8 ? 'bg-green-500' : confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {confidence >= 0.8 ? 'High confidence - Very reliable answer' :
               confidence >= 0.6 ? 'Moderate confidence - Generally reliable' :
               'Low confidence - Verify with additional sources'}
            </p>
          </div>

          {/* References */}
          {explanation.references && explanation.references.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-blue-500" />
                <h5 className="font-semibold text-sm text-gray-700">References</h5>
              </div>
              <div className="space-y-2">
                {explanation.references.map((ref, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium text-gray-800">{ref.title}</div>
                    {ref.snippet && (
                      <div className="text-gray-600 text-xs mt-1">{ref.snippet}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          {explanation.timestamp && (
            <div className="text-xs text-gray-500 text-center mt-3">
              Generated on {new Date(explanation.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
