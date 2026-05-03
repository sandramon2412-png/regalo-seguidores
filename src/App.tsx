import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Upload,
  BookOpen,
  MessageSquare,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Send,
  Loader2,
  FileText,
  Brain,
  Trophy,
  AlertCircle,
  Plus,
} from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ─── Types ─────────────────────────────────────────────────────────────────

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
}

interface StudyData {
  summary: string;
  topics: string[];
  questions: Question[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Tab = 'resumen' | 'quiz' | 'chat';
type AppState = 'idle' | 'extracting' | 'processing' | 'ready' | 'error';

// ─── PDF Text Extraction ────────────────────────────────────────────────────

async function extractPdfText(
  file: File,
  onProgress: (page: number, total: number) => void
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const total = pdf.numPages;
  const parts: string[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => {
        const textItem = item as { str?: string };
        return textItem.str ?? '';
      })
      .join(' ');
    parts.push(pageText);
    onProgress(i, total);
  }

  return parts.join('\n\n');
}

// ─── Components ─────────────────────────────────────────────────────────────

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="w-full">
      <p className="text-sm text-muted mb-2">{label}</p>
      <div className="w-full bg-border rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function UploadScreen({
  onFile,
  isDragging,
  setIsDragging,
}: {
  onFile: (f: File) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') onFile(file);
    },
    [onFile, setIsDragging]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Asistente de Estudio</h1>
          <p className="text-muted text-lg">Examen Telus Digital</p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-primary bg-primary-light scale-[1.02]'
              : 'border-border bg-surface hover:border-primary hover:bg-primary-light'
            }
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted'}`} />
          <p className="text-lg font-semibold text-text mb-2">
            {isDragging ? 'Suelta el PDF aquí' : 'Sube tu material de estudio'}
          </p>
          <p className="text-muted text-sm mb-4">
            Arrastra y suelta un PDF, o haz clic para seleccionar
          </p>
          <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium">
            <FileText className="w-4 h-4" />
            Seleccionar PDF
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: FileText, label: 'Hasta 278 páginas' },
            { icon: Brain, label: '25+ preguntas' },
            { icon: MessageSquare, label: 'Chat de apoyo' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-surface rounded-xl p-4 border border-border">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ state, progress }: { state: AppState; progress: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">
          {state === 'extracting' ? 'Extrayendo texto del PDF…' : 'Generando preguntas con IA…'}
        </h2>
        <p className="text-muted text-sm mb-6">
          {state === 'extracting'
            ? 'Esto puede tomar un momento para documentos grandes'
            : 'Claude Opus está analizando el contenido'}
        </p>
        {state === 'extracting' && (
          <ProgressBar value={progress} label={`${Math.round(progress)}% completado`} />
        )}
        {state === 'processing' && (
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTab({ data }: { data: StudyData }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Resumen del material
        </h3>
        <p className="text-muted leading-relaxed">{data.summary}</p>
      </div>

      {/* Topics */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Temas clave a estudiar
        </h3>
        <div className="space-y-3">
          {data.topics.map((topic, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-text">{topic}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Preguntas', value: data.questions.length, color: 'bg-primary-light text-primary' },
          { label: 'Temas', value: data.topics.length, color: 'bg-accent-light text-accent' },
          {
            label: 'Dificultad',
            value: 'Mixta',
            color: 'bg-success-light text-success',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizTab({
  data,
  filename,
  pdfText,
}: {
  data: StudyData;
  filename: string;
  pdfText: string;
}) {
  const [questions, setQuestions] = useState<Question[]>(data.questions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const q = questions[current];
  const totalAnswered = answered.filter(Boolean).length;

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const newAnswered = [...answered];
    newAnswered[current] = true;
    setAnswered(newAnswered);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
    setFinished(false);
    setErrorMsg('');
  };

  const handleMoreQuestions = async () => {
    setLoadingMore(true);
    setErrorMsg('');
    try {
      const topic = data.topics[current % data.topics.length] || 'general';
      const res = await fetch('/api/more-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context: pdfText }),
      });
      const json = await res.json();
      if (json.questions) {
        setQuestions((prev) => [...prev, ...json.questions]);
      } else {
        setErrorMsg(json.error || 'Error al cargar más preguntas.');
      }
    } catch {
      setErrorMsg('Error de conexión.');
    } finally {
      setLoadingMore(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center text-center py-8 space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${pct >= 70 ? 'bg-success-light' : 'bg-error-light'}`}>
          <Trophy className={`w-10 h-10 ${pct >= 70 ? 'text-success' : 'text-error'}`} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-text">{pct >= 70 ? '¡Buen trabajo!' : 'Sigue practicando'}</h3>
          <p className="text-muted mt-1">Respondiste correctamente</p>
          <p className="text-4xl font-bold text-primary mt-2">{score}/{questions.length}</p>
          <p className="text-muted">({pct}%)</p>
        </div>
        <div className={`rounded-xl px-6 py-3 text-sm font-medium ${pct >= 80 ? 'bg-success-light text-success' : pct >= 60 ? 'bg-accent-light text-accent' : 'bg-error-light text-error'}`}>
          {pct >= 80 ? 'Excelente dominio del material' : pct >= 60 ? 'Buen progreso, repasa los temas fallados' : 'Revisa el material y vuelve a intentarlo'}
        </div>
        <div className="flex gap-3">
          <button onClick={handleRestart} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reiniciar Quiz
          </button>
          <button
            onClick={handleMoreQuestions}
            disabled={loadingMore}
            className="flex items-center gap-2 bg-surface border border-border text-text px-6 py-2.5 rounded-xl font-medium hover:bg-bg transition-colors disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Más preguntas
          </button>
        </div>
        {errorMsg && <p className="text-error text-sm">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Pregunta {current + 1} de {questions.length}</span>
        <span className="font-medium text-primary">{totalAnswered} respondidas · {score} correctas</span>
      </div>
      <div className="w-full bg-border rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Topic badge */}
      <span className="inline-block bg-primary-light text-primary text-xs font-medium px-3 py-1 rounded-full">
        {q.topic}
      </span>

      {/* Question */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <p className="text-text font-medium leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let style = 'border-border bg-surface hover:border-primary hover:bg-primary-light cursor-pointer';
          if (showResult) {
            if (idx === q.correct) style = 'border-success bg-success-light cursor-default';
            else if (idx === selected) style = 'border-error bg-error-light cursor-default';
            else style = 'border-border bg-surface opacity-60 cursor-default';
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left border-2 rounded-xl p-4 transition-all ${style}`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5
                  ${showResult && idx === q.correct ? 'border-success text-success' : ''}
                  ${showResult && idx === selected && idx !== q.correct ? 'border-error text-error' : ''}
                  ${!showResult ? 'border-border text-muted' : ''}
                `}>
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                <span className="text-text">{opt}</span>
                {showResult && idx === q.correct && <CheckCircle className="ml-auto flex-shrink-0 w-5 h-5 text-success" />}
                {showResult && idx === selected && idx !== q.correct && <XCircle className="ml-auto flex-shrink-0 w-5 h-5 text-error" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className={`rounded-xl p-4 border ${selected === q.correct ? 'bg-success-light border-success' : 'bg-accent-light border-accent'}`}>
          <p className="text-sm font-medium mb-1">
            {selected === q.correct ? '¡Correcto!' : `Respuesta correcta: ${['A', 'B', 'C', 'D'][q.correct]}. ${q.options[q.correct]}`}
          </p>
          <p className="text-sm text-muted">{q.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      {showResult && (
        <div className="flex justify-between pt-2">
          <button
            onClick={() => { setCurrent((c) => Math.max(0, c - 1)); setSelected(null); setShowResult(false); }}
            disabled={current === 0}
            className="flex items-center gap-1 text-muted hover:text-text disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            {current + 1 >= questions.length ? 'Ver resultado' : 'Siguiente'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ChatTab({ pdfText }: { pdfText: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente para el examen de Telus Digital. Puedo responder preguntas sobre el material de estudio, explicar conceptos, y ayudarte a prepararte. ¿En qué puedo ayudarte?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: pdfText }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.text,
                };
                return updated;
              });
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Error al conectar con el asistente. Verifica que el servidor esté corriendo.',
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    '¿Qué es la verificación de datos?',
    'Explícame los criterios de evaluación',
    '¿Cómo evaluar la relevancia de resultados?',
    'Dame un ejemplo de pregunta difícil',
  ];

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '500px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4" style={{ maxHeight: '420px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-surface border border-border text-text rounded-bl-md'
            }`}>
              {msg.content || (loading && i === messages.length - 1
                ? <span className="flex gap-1 items-center text-muted"><Loader2 className="w-3 h-3 animate-spin" />Pensando…</span>
                : null
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 py-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 pt-3 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Escribe tu pregunta…"
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [filename, setFilename] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = async (file: File) => {
    setFilename(file.name);
    setErrorMsg('');

    // Step 1: Extract text
    setAppState('extracting');
    setProgress(0);
    let text = '';
    try {
      text = await extractPdfText(file, (page, total) => {
        setProgress((page / total) * 100);
      });
      setPdfText(text);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo leer el PDF. Asegúrate de que el archivo no está protegido.');
      setAppState('error');
      return;
    }

    // Step 2: Process with Claude
    setAppState('processing');
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename: file.name }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStudyData(data);
      setAppState('ready');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al procesar el PDF. Verifica que ANTHROPIC_API_KEY esté configurado.'
      );
      setAppState('error');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'resumen', label: 'Resumen', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: Brain },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  if (appState === 'idle') {
    return (
      <UploadScreen onFile={handleFile} isDragging={isDragging} setIsDragging={setIsDragging} />
    );
  }

  if (appState === 'extracting' || appState === 'processing') {
    return <LoadingScreen state={appState} progress={progress} />;
  }

  if (appState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-error-light">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-xl font-bold text-text">Algo salió mal</h2>
          <p className="text-muted text-sm">{errorMsg}</p>
          <button
            onClick={() => setAppState('idle')}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Ready state
  return (
    <div className="min-h-screen bg-bg">
      {/* Top Bar */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text text-sm truncate">Telus Digital · Estudio</p>
            <p className="text-xs text-muted truncate">{filename}</p>
          </div>
          <button
            onClick={() => { setAppState('idle'); setStudyData(null); setPdfText(''); }}
            className="text-xs text-muted hover:text-text border border-border rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Cambiar PDF
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {studyData && activeTab === 'resumen' && <SummaryTab data={studyData} />}
        {studyData && activeTab === 'quiz' && (
          <QuizTab data={studyData} filename={filename} pdfText={pdfText} />
        )}
        {activeTab === 'chat' && <ChatTab pdfText={pdfText} />}
      </main>
    </div>
  );
}
