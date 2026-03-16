import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Wind, 
  MessageSquare, 
  Activity, 
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  Printer,
  Download,
  Volume2,
  VolumeX
} from 'lucide-react';

interface PageContent {
  id: number;
  title?: string;
  subtitle?: string;
  content: React.ReactNode;
  type: 'cover' | 'intro' | 'signal' | 'cta';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error de reproducción:", err);
          setIsPlaying(false);
        });
    }
  };

  const pages: PageContent[] = [
    {
      id: 0,
      type: 'cover',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-brand-accent/30 p-12 md:p-20 relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-warm px-4">
              <Sparkles className="text-brand-accent w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-widest leading-tight mb-4">
              5 Señales que tu <br /> cuerpo te envía
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-brand-accent/80 mb-12">
              (y cómo escucharlas)
            </p>
            <div className="w-24 h-24 mx-auto mb-12 flex items-center justify-center overflow-hidden rounded-full border border-brand-accent/10">
              <img 
                src="https://i.imgur.com/dxxQ0CC.jpeg" 
                alt="Logo Código Cuerpo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-lg font-serif italic">
              "Tu cuerpo no te falla, te habla"
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 1,
      type: 'intro',
      content: (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-serif mb-8 text-brand-accent italic">Querida,</h2>
              <div className="space-y-6 text-lg leading-relaxed font-light">
                <p>¿Alguna vez has sentido un dolor que aparece y desaparece sin razón? ¿Una tensión que no se va? ¿Un nudo en la garganta que no sabes por qué está ahí?</p>
                <p>Tu cuerpo no es tu enemigo. Es un mensajero. Te envía señales constantemente, pero a veces no sabemos interpretarlas.</p>
                <p>En esta mini-guía te comparto 5 señales muy comunes y lo que tu cuerpo puede estar queriéndote decir con cada una.</p>
                <p>Espero que te sirvan tanto como me han servido a mí y a tantas mujeres que acompañé.</p>
                <div className="pt-8">
                  <p className="font-serif italic text-xl">Con amor,</p>
                  <p className="font-serif text-2xl text-brand-accent">Amiga Fortaleza</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://i.imgur.com/EoG0Tut.png" 
                  alt="Bienvenida" 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      type: 'signal',
      title: 'Señal #1: Tensión en hombros y cuello',
      content: (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> ¿Dónde la sientes?
                </h3>
                <p className="text-lg">En la parte alta de la espalda, hombros y nuca. Como si llevaras una mochila pesada.</p>
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> ¿Qué puede significar?
                </h3>
                <p className="text-lg leading-relaxed">Los hombros representan las cargas que llevamos. Responsabilidades que no son nuestras, expectativas de otros, el peso de "tener que hacerlo todo".</p>
                <div className="mt-6 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 italic text-xl font-serif">
                  ¿Qué estoy cargando que no me corresponde?
                </div>
              </section>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-accent/5">
              <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-6">Un pequeño ejercicio para hoy</h3>
              <p className="mb-6 leading-relaxed">Siéntate, lleva los hombros hacia arriba (como si quisieras tocar tus orejas), mantenlos 5 segundos y luego déjalos caer de golpe. Repite 3 veces.</p>
              <div className="p-4 border-l-2 border-brand-accent italic text-brand-accent/80">
                "Suelto lo que no es mío"
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      type: 'signal',
      title: 'Señal #2: Nudo en la garganta',
      content: (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> ¿Dónde la sientes?
                </h3>
                <p className="text-lg">En la garganta, como si algo estuviera atascado. A veces con ganas de tragar saliva constantemente.</p>
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> ¿Qué puede significar?
                </h3>
                <p className="text-lg leading-relaxed">La garganta es el centro de la expresión. Un nudo ahí suele ser una palabra no dicha, una verdad guardada, un "te quiero" que no salió, un "no" que te tragaste.</p>
                <div className="mt-6 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 italic text-xl font-serif">
                  ¿Qué necesito decir y no me atrevo?
                </div>
              </section>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-accent/5">
              <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-6">Un pequeño ejercicio para hoy</h3>
              <p className="mb-6 leading-relaxed">Escribe en un papel algo que hayas callado. No lo envíes, solo escríbelo. Luego, lee en voz alta (aunque sea susurrando). Nota cómo se afloja la garganta.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      type: 'signal',
      title: 'Señal #3: Opresión en el pecho',
      content: (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> ¿Dónde la sientes?
                </h3>
                <p className="text-lg">En el centro del pecho, como si tuvieras una losa encima. A veces con ganas de suspirar hondo.</p>
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> ¿Qué puede significar?
                </h3>
                <p className="text-lg leading-relaxed">El pecho es el espacio del corazón, de las emociones. Una opresión aquí suele hablar de tristeza contenida, de penas no lloradas, de angustia que no se ha expresado.</p>
                <div className="mt-6 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 italic text-xl font-serif">
                  ¿Qué pena no me he permitido llorar?
                </div>
              </section>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-accent/5">
              <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-6">Un pequeño ejercicio para hoy</h3>
              <p className="mb-6 leading-relaxed">Pon tu mano en el pecho y respira hondo. Mientras exhalas, di: "Suelto lo que pesa". Si vienen lágrimas, déjalas salir. Son tu cuerpo liberando.</p>
              <div className="p-4 border-l-2 border-brand-accent italic text-brand-accent/80">
                "Suelto lo que pesa"
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      type: 'signal',
      title: 'Señal #4: Inflamación o pesadez en el vientre',
      content: (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> ¿Dónde la sientes?
                </h3>
                <p className="text-lg">En el abdomen, como si estuvieras llena, hinchada, con digestiones pesadas.</p>
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> ¿Qué puede significar?
                </h3>
                <p className="text-lg leading-relaxed">El vientre es nuestro segundo cerebro. Procesa no solo comida, también emociones. Cuando algo te "sienta mal" en la vida (una persona, una situación), el vientre puede inflamarse.</p>
                <div className="mt-6 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 italic text-xl font-serif">
                  ¿Qué o quién me está "sentando mal" en estos días?
                </div>
              </section>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-accent/5">
              <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-6">Un pequeño ejercicio para hoy</h3>
              <p className="mb-6 leading-relaxed">Pon tus manos en el vientre y respira profundamente hacia él. Mientras exhalas, imagina que sueltas todo eso que no puedes digerir.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      type: 'signal',
      title: 'Señal #5: Apretar la mandíbula (Bruxismo)',
      content: (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> ¿Dónde la sientes?
                </h3>
                <p className="text-lg">En la mandíbula, sobre todo al despertar. Dientes apretados, a veces con dolor de cabeza al lado de las sienes.</p>
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3 flex items-center gap-2">
                  <Wind className="w-4 h-4" /> ¿Qué puede significar?
                </h3>
                <p className="text-lg leading-relaxed">Apretar los dientes es rabia contenida. Es lo que no podemos morder, lo que no podemos decir, lo que nos enfada y callamos.</p>
                <div className="mt-6 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 italic text-xl font-serif">
                  ¿Con quién o con qué estoy enojada y no me permito sentirlo?
                </div>
              </section>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-accent/5">
              <h3 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-6">Un pequeño ejercicio para hoy</h3>
              <p className="mb-6 leading-relaxed">Durante el día, pon atención a tu mandíbula. Cada vez que notes que la aprietas, di en silencio: "Relajo, suelto, perdono". Mueve la mandíbula suavemente de lado a lado.</p>
              <div className="p-4 border-l-2 border-brand-accent italic text-brand-accent/80">
                "Relajo, suelto, perdono"
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      type: 'cta',
      content: (
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <img 
            src="https://i.imgur.com/dxxQ0CC.jpeg" 
            alt="Logo" 
            className="w-20 h-20 rounded-full mx-auto mb-8 border border-brand-accent/10"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-4xl font-serif mb-8 text-brand-accent italic">Querida,</h2>
          <p className="text-xl mb-12 font-light leading-relaxed">Espero que estas 5 señales te hayan resonado. Si alguna te llegó al corazón, te invito a seguir explorando.</p>
          
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-brand-accent/10 mb-12 text-left">
            <h3 className="text-2xl font-serif mb-6 text-brand-accent">Libro "Biodescodificación Femenina"</h3>
            <p className="mb-8 text-lg opacity-80">Profundizo en más de 60 señales, con un método paso a paso para que aprendas a escuchar tu cuerpo de verdad.</p>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-brand-accent" />
                <span>El método RE-CONECT de 5 pasos</span>
              </li>
              <li className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-brand-accent" />
                <span>App con mapa corporal interactivo</span>
              </li>
              <li className="flex items-center gap-3">
                <Wind className="w-5 h-5 text-brand-accent" />
                <span>Audios de tapping y meditación</span>
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand-accent" />
                <span>5 bonos exclusivos</span>
              </li>
            </ul>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-brand-accent/10">
              <div className="text-3xl font-serif text-brand-accent">$6.97</div>
              <a 
                href="https://tubiodescodificacion.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-brand-accent text-white px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer no-underline"
              >
                Saber más <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 text-sm">
            <p className="mb-2 font-semibold text-brand-accent uppercase tracking-widest">Guía Interactiva</p>
            <p className="opacity-70 mb-4">Puedes acceder a esta guía en su formato interactivo con música y animaciones en:</p>
            <a 
              href="https://regalo-seguidores.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-accent font-medium break-all hover:underline"
            >
              https://regalo-seguidores.vercel.app
            </a>
          </div>

          <div className="pt-8">
            <p className="font-serif italic text-xl">Gracias por estar aquí. Tu cuerpo te lo agradece. 💕</p>
            <p className="font-serif text-2xl text-brand-accent mt-4">Amiga Fortaleza</p>
          </div>
        </div>
      )
    }
  ];

  const next = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const prev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    // Check if we should trigger print automatically (when opened in new tab)
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.print();
        // Clean up URL after printing
        window.history.replaceState({}, '', window.location.pathname);
      }, 1000);
    }
  }, []);

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      // If in iframe, open in new tab with print param
      const url = new URL(window.location.href);
      url.searchParams.set('print', 'true');
      window.open(url.toString(), '_blank');
    } else {
      // If already in main window, just print
      window.focus();
      window.print();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Printable Version (Hidden on screen) */}
      <div className="print-only">
        {pages.map((page, index) => (
          <div key={page.id} className="print-page">
            {page.id === 0 ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 mx-auto mb-12 flex items-center justify-center overflow-hidden rounded-full border border-brand-accent/10">
                  <img 
                    src="https://i.imgur.com/dxxQ0CC.jpeg" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-6xl font-serif uppercase tracking-widest leading-tight mb-4">
                  5 Señales que tu cuerpo te envía
                </h1>
                <p className="text-2xl font-serif italic text-brand-accent mb-12">
                  (y cómo escucharlas)
                </p>
                <p className="text-xl font-serif italic opacity-60">Guía de Biodescodificación Femenina</p>
              </div>
            ) : page.id === 1 ? (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-serif text-brand-accent italic mb-8">Querida,</h2>
                <div className="grid grid-cols-2 gap-12 items-center">
                  <div className="space-y-6 text-lg">
                    <p>¿Alguna vez has sentido un dolor que aparece y desaparece sin razón? ¿Una tensión que no se va? ¿Un nudo en la garganta que no sabes por qué está ahí?</p>
                    <p>Tu cuerpo no es tu enemigo. Es un mensajero. Te envía señales constantemente, pero a veces no sabemos interpretarlas.</p>
                    <p>En esta mini-guía te comparto 5 señales muy comunes y lo que tu cuerpo puede estar queriéndote decir con cada una.</p>
                  </div>
                  <img 
                    src="https://i.imgur.com/EoG0Tut.png" 
                    alt="Bienvenida" 
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {page.title && (
                  <h2 className="text-4xl font-serif text-brand-accent italic mb-8 border-b border-brand-accent/10 pb-4">
                    {page.title}
                  </h2>
                )}
                <div className="text-lg">
                  {page.content}
                </div>
              </div>
            )}
            
            {/* PDF Footer */}
            <div className="mt-auto pt-8 flex flex-col gap-2 text-[10px] text-brand-accent/50 border-t border-brand-accent/10">
              <div className="flex justify-between">
                <a href="https://regalo-seguidores.vercel.app" className="hover:underline">Guía Interactiva: regalo-seguidores.vercel.app</a>
                <a href="https://tubiodescodificacion.vercel.app/" className="hover:underline">Web: tubiodescodificacion.vercel.app</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header / Progress */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 no-print">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMusic}
              className={`p-2 rounded-full bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-all cursor-pointer flex items-center gap-2 px-3 border border-brand-accent/20 ${isPlaying ? 'animate-pulse shadow-lg shadow-brand-accent/20' : ''}`}
              title={isPlaying ? "Detener música" : "Escuchar música Zen"}
            >
              {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {isPlaying ? "Música: On" : "Música: Off"}
              </span>
            </button>
            <audio 
              ref={audioRef}
              src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
              loop
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/dxxQ0CC.jpeg" 
              alt="Logo" 
              className="w-8 h-8 rounded-full object-cover border border-brand-accent/10"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block text-xs uppercase tracking-widest font-semibold text-brand-accent/40">
              Código Cuerpo
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest font-semibold text-brand-accent hover:bg-brand-accent hover:text-white transition-all bg-white/50 px-4 py-2 rounded-full border border-brand-accent/20 cursor-pointer shadow-sm active:scale-95"
              title="Imprimir o Guardar como PDF"
            >
              <Printer className="w-3 h-3 md:w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          {pages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-4 rounded-full transition-all duration-500 ${i === currentPage ? 'bg-brand-accent w-8' : 'bg-brand-accent/20'}`}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center pt-20 pb-24 no-print">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full"
          >
            {pages[currentPage].title && (
              <div className="max-w-3xl mx-auto px-6 mb-8">
                <h2 className="text-3xl md:text-5xl font-serif text-brand-accent italic">
                  {pages[currentPage].title}
                </h2>
              </div>
            )}
            {pages[currentPage].content}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-between items-center z-50 no-print">
        <button 
          onClick={prev}
          disabled={currentPage === 0}
          className={`p-4 rounded-full border border-brand-accent/20 transition-all ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-brand-accent/5 cursor-pointer'}`}
        >
          <ChevronLeft className="w-6 h-6 text-brand-accent" />
        </button>
        
        <div className="text-xs font-serif italic opacity-40 flex flex-col items-center gap-1">
          <div>Página {currentPage + 1} de {pages.length}</div>
          <a href="https://tubiodescodificacion.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:underline not-italic font-sans text-[10px] tracking-widest uppercase opacity-60">tubiodescodificacion.vercel.app</a>
        </div>

        <button 
          onClick={next}
          disabled={currentPage === pages.length - 1}
          className={`p-4 rounded-full bg-brand-accent transition-all ${currentPage === pages.length - 1 ? 'opacity-0 pointer-events-none' : 'hover:scale-110 cursor-pointer'}`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </footer>

      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
