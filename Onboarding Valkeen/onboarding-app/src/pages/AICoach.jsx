import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw,
  Lightbulb,
  BookOpen,
  Target,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { getOpenAIApiKey } from '../services/awsService';
import { weeks, phases } from '../data/onboardingData';

const SYSTEM_PROMPT = `Du bist ein erfahrener Lerncoach und Experte für:
- Tempus Resource (Enterprise Resource Management Software)
- Resource Portfolio Management (RPM)
- Project Portfolio Management (PPM)
- Capacity Planning und Workforce Planning
- Valkeen Consulting Methoden

Du hilfst einem neuen Mitarbeiter bei Valkeen beim Onboarding. Deine Aufgaben:
1. Fragen zu Tempus Resource und PPM beantworten
2. Konzepte erklären (Resource Management, Project Management, BPAFG, etc.)
3. Quiz-Fragen stellen um das Wissen zu testen
4. Praktische Tipps für die Arbeit mit Tempus geben
5. Bei der Demo-Vorbereitung helfen

Wichtige Konzepte die du kennen solltest:
- Valkeen: Consulting-Unternehmen mit 15+ Jahren PPM-Erfahrung, Zürich
- ProSymmetry: Hersteller von Tempus Resource, strategischer Partner
- Tempus Resource: Purpose-built Enterprise Resource Management
- BPAFG: Bulk Project Allocation Flatgrid (3 Modi: Default, RM, PM)
- Resource Request (RR): Anfrage vom PM an RM für Ressourcen
- Net Availability: Verbleibende Kapazität nach Zuweisungen
- What-If Scenario Planning: Simulation ohne Produktivdaten zu ändern

Antworte immer auf Deutsch, freundlich und ermutigend. Halte Antworten prägnant aber informativ.`;

const quickPrompts = [
  { icon: BookOpen, text: "Erkläre Resource Management", prompt: "Was ist Resource Management und welche Kernfunktionen gibt es?" },
  { icon: Target, text: "BPAFG erklären", prompt: "Erkläre mir BPAFG (Bulk Project Allocation Flatgrid) und die 3 Modi." },
  { icon: Lightbulb, text: "Quiz-Frage stellen", prompt: "Stelle mir eine Quiz-Frage zu Tempus Resource oder PPM." },
  { icon: MessageSquare, text: "Demo-Tipps", prompt: "Gib mir Tipps für meine PM Demo Präsentation." },
];

export default function AICoach() {
  const { progress } = useProgress();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hallo! 👋 Ich bin dein KI-Lerncoach für das Valkeen Onboarding. Ich kann dir bei Fragen zu Tempus Resource, Resource Management und PPM helfen. Was möchtest du wissen?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState('loading'); // loading, aws, local, none
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [localApiKey, setLocalApiKey] = useState('');
  const messagesEndRef = useRef(null);

  // Beim Start: API-Key aus AWS laden
  useEffect(() => {
    async function loadApiKey() {
      setApiKeyStatus('loading');
      
      // 1. Versuche AWS
      const awsKey = await getOpenAIApiKey();
      if (awsKey) {
        setApiKey(awsKey);
        setApiKeyStatus('aws');
        console.log('✅ API-Key aus Admin-Panel geladen');
        return;
      }
      
      // 2. Fallback: localStorage
      const localKey = localStorage.getItem('openai-api-key');
      if (localKey && localKey.startsWith('sk-')) {
        setApiKey(localKey);
        setApiKeyStatus('local');
        console.log('✅ API-Key aus localStorage geladen');
        return;
      }
      
      // 3. Kein Key gefunden
      setApiKeyStatus('none');
      setShowApiKeyInput(true);
    }
    
    loadApiKey();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveLocalApiKey = () => {
    if (localApiKey.startsWith('sk-')) {
      localStorage.setItem('openai-api-key', localApiKey);
      setApiKey(localApiKey);
      setApiKeyStatus('local');
      setShowApiKeyInput(false);
    }
  };

  const getProgressContext = () => {
    const allTasks = weeks.flatMap(w => w.tasks);
    const completedTasks = allTasks.filter(t => progress.tasks[t.id]);
    const totalProgress = Math.round((completedTasks.length / allTasks.length) * 100);
    
    return `Der Nutzer ist bei ${totalProgress}% Fortschritt im Onboarding (${completedTasks.length}/${allTasks.length} Aufgaben erledigt).`;
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\n\n' + getProgressContext() },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Fehler: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Entschuldigung, es gab einen Fehler bei der Verbindung.';
      
      if (error.message.includes('quota') || error.message.includes('exceeded')) {
        errorMessage = 'Das OpenAI-Kontingent ist erschöpft. Bitte prüfe das Budget im Admin-Panel unter API Keys.';
      } else if (error.message.includes('invalid_api_key')) {
        errorMessage = 'Der API-Key ist ungültig. Bitte prüfe die Einstellungen im Admin-Panel.';
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat zurückgesetzt! Wie kann ich dir helfen?'
    }]);
  };

  // API-Key Status Badge
  const ApiKeyBadge = () => {
    if (apiKeyStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Lade API-Key...</span>
        </div>
      );
    }
    if (apiKeyStatus === 'aws') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>API-Key aus Admin-Panel</span>
        </div>
      );
    }
    if (apiKeyStatus === 'local') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>Lokaler API-Key</span>
        </div>
      );
    }
    return null;
  };

  if (showApiKeyInput && apiKeyStatus !== 'loading') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">KI-Coach einrichten</h2>
          <p className="text-white/60 mb-6">
            {apiKeyStatus === 'none' 
              ? 'Kein API-Key im Admin-Panel gefunden. Du kannst einen lokalen Key eingeben:'
              : 'Gib deinen OpenAI API-Key ein, um den KI-Coach zu nutzen.'
            }
          </p>
          
          {apiKeyStatus === 'none' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-yellow-400">
                <strong>Tipp:</strong> Du kannst den API-Key zentral im{' '}
                <a 
                  href="/admin.html#api-keys" 
                  target="_blank" 
                  className="underline hover:text-yellow-300"
                >
                  Admin-Panel → API Keys
                </a>{' '}
                hinterlegen. Dann wird er automatisch geladen.
              </p>
            </div>
          )}
          
          <input
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            placeholder="sk-..."
            className="glass-input mb-4"
          />
          <button
            onClick={saveLocalApiKey}
            disabled={!localApiKey.startsWith('sk-')}
            className={`glass-button w-full ${!localApiKey.startsWith('sk-') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            API-Key speichern
          </button>
          <p className="text-xs text-white/40 mt-4">
            Der Key wird lokal in deinem Browser gespeichert.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">KI-Lerncoach</h1>
            <p className="text-sm text-white/50">Dein Sparring-Partner für PPM & Tempus</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ApiKeyBadge />
          <button
            onClick={() => {
              setShowApiKeyInput(true);
              setLocalApiKey('');
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition-colors"
          >
            API-Key ändern
          </button>
          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {quickPrompts.map((item, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(item.prompt)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm whitespace-nowrap transition-colors"
          >
            <item.icon className="w-4 h-4 text-indigo-400" />
            {item.text}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 glass-card p-4 overflow-y-auto scrollbar-thin mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-indigo-500/20' 
                  : 'bg-purple-500/20'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-indigo-500/20 rounded-tr-sm'
                  : 'bg-white/5 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stelle eine Frage..."
          className="glass-input flex-1"
          disabled={isLoading || apiKeyStatus === 'loading'}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || apiKeyStatus === 'loading'}
          className={`glass-button px-6 ${(!input.trim() || isLoading || apiKeyStatus === 'loading') ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
