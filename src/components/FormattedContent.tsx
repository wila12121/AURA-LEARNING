import React from 'react';

interface FormattedContentProps {
  content: string;
  onSuggestionClick?: (text: string) => void;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content, onSuggestionClick }) => {
  // Parse special sections like suggested next steps
  const nextStepsIndex = content.indexOf('🔮 Suggested Next Steps:');
  let mainContent = content;
  let suggestions: string[] = [];

  if (nextStepsIndex !== -1) {
    mainContent = content.substring(0, nextStepsIndex).trim();
    const suggestionsRaw = content.substring(nextStepsIndex + '🔮 Suggested Next Steps:'.length).trim();
    suggestions = suggestionsRaw
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.]\s*/, '').trim())
      .filter((s) => s.length > 2);
  }

  // Parse lines into structured elements
  const lines = mainContent.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  lines.forEach((line, index) => {
    // Check for code fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${index}`} className="my-3 rounded-lg overflow-hidden border border-white/10 bg-slate-950/80">
            {codeLang && (
              <div className="px-3 py-1 bg-white/5 border-b border-white/5 text-[11px] font-mono text-teal-300">
                {codeLang}
              </div>
            )}
            <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Key takeaway callout box
    if (line.includes('💡 Key Takeaway') || line.startsWith('> 💡') || line.startsWith('> **Key Takeaway')) {
      elements.push(
        <div
          key={`takeaway-${index}`}
          className="my-3 p-3.5 rounded-xl border border-teal-500/20 bg-teal-950/20 backdrop-blur-md text-teal-100 text-sm leading-relaxed"
        >
          <span className="font-semibold text-teal-300 block mb-1">Key Takeaway</span>
          {renderFormattedInline(line.replace(/.*Key Takeaway[:*]*\s*/i, ''))}
        </div>
      );
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="text-base font-semibold text-teal-200 mt-4 mb-2 tracking-tight">
          {renderFormattedInline(line.replace('### ', ''))}
        </h4>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-lg font-semibold text-slate-100 mt-5 mb-2.5 tracking-tight border-b border-white/5 pb-1">
          {renderFormattedInline(line.replace('## ', ''))}
        </h3>
      );
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-slate-50 mt-6 mb-3 tracking-tight">
          {renderFormattedInline(line.replace('# ', ''))}
        </h2>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${index}`} className="my-2 pl-3.5 border-l-2 border-teal-400/40 text-slate-300 italic text-sm">
          {renderFormattedInline(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Numbered step (e.g., "1. " or "2. ")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={`num-${index}`} className="flex items-start gap-2.5 my-1.5 text-sm text-slate-200 leading-relaxed">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-[11px] font-medium flex items-center justify-center mt-0.5">
            {numberedMatch[1]}
          </span>
          <div className="flex-1">{renderFormattedInline(numberedMatch[2])}</div>
        </div>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
      const cleanLine = line.trim().replace(/^[-*•]\s+/, '');
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2.5 my-1 text-sm text-slate-200 leading-relaxed ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400/70 mt-2 flex-shrink-0" />
          <div className="flex-1">{renderFormattedInline(cleanLine)}</div>
        </div>
      );
      return;
    }

    // Math block (e.g., $$...$$)
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
      const formula = line.trim().slice(2, -2).trim();
      elements.push(
        <div
          key={`math-${index}`}
          className="my-3 p-3 rounded-lg border border-indigo-500/20 bg-indigo-950/20 text-center font-mono text-indigo-200 text-sm overflow-x-auto tracking-wide"
        >
          {formula}
        </div>
      );
      return;
    }

    // Regular paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p key={`p-${index}`} className="my-2 text-sm text-slate-200 leading-relaxed">
          {renderFormattedInline(line)}
        </p>
      );
    }
  });

  return (
    <div className="space-y-1">
      {elements}

      {/* Suggested Follow-Up Prompts */}
      {suggestions.length > 0 && onSuggestionClick && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <span className="text-xs text-slate-400 font-medium block mb-2">Explore Next:</span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(s)}
                className="text-xs text-left px-3 py-1.5 rounded-lg border border-teal-500/25 bg-teal-950/20 hover:bg-teal-900/30 text-teal-200 hover:border-teal-400/40 transition-all cursor-pointer shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to render bold, italic, inline code, and inline math
function renderFormattedInline(text: string): React.ReactNode {
  // Split on bold (**text**), inline code (`code`), or inline math ($formula$)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-teal-300 font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      return (
        <span key={i} className="px-1 py-0.5 rounded bg-indigo-950/40 text-indigo-200 font-mono text-xs border border-indigo-500/20">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}
