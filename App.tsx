
import React, { useState, useMemo } from 'react';
import { parsePMMGFiles } from './services/pdfParser';
import { ProcessResult, MonthData } from './types';
import { 
  FileText, 
  Upload, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  X,
  Search,
  ArrowRight,
  ChevronLeft,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processScales = async () => {
    if (!name || files.length === 0) return;
    setLoading(true);
    try {
      const data = await parsePMMGFiles(files, name);
      setResults(data);
    } catch (error) {
      alert("Erro ao ler PDFs. Verifique se os arquivos são válidos.");
    } finally {
      setLoading(false);
    }
  };

  const sortedMonths = useMemo(() => {
    if (!results) return [];
    return (Object.values(results) as MonthData[]).sort((a, b) => {
      const [m1, y1] = a.monthYear.split('/').map(Number);
      const [m2, y2] = b.monthYear.split('/').map(Number);
      return (y2 * 12 + m2) - (y1 * 12 + m1);
    });
  }, [results]);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-slate-100 flex flex-col font-sans selection:bg-[#c1a35f] selection:text-black">
      {/* Header Minimalista */}
      <header className="border-b border-white/5 bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#c1a35f] rounded-full"></div>
            <h1 className="text-sm font-black tracking-[0.2em] uppercase text-white/90">
              Controle de Horas
            </h1>
          </div>
          {results && (
            <button 
              onClick={() => {setResults(null); setFiles([]); setName('');}}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-[#c1a35f] transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-12">
        {!results ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Seção de Identificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <Search size={14} />
                <label className="text-[10px] font-black uppercase tracking-widest">Militar Alvo</label>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO OU MATRÍCULA"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:border-[#c1a35f]/50 outline-none transition-all placeholder:text-white/10 uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Seção de Arquivos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/40">
                  <FileText size={14} />
                  <label className="text-[10px] font-black uppercase tracking-widest">Escalas em PDF</label>
                </div>
                {files.length > 0 && (
                  <span className="text-[10px] font-bold text-[#c1a35f]">{files.length} ARQUIVOS</span>
                )}
              </div>
              
              <label className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#c1a35f]/20 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Upload className="text-white/20 group-hover:text-[#c1a35f] mb-4 transition-colors" size={32} />
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Arraste ou selecione</p>
                  <p className="text-[10px] text-white/20 font-medium">As escalas mensais no formato original</p>
                </div>
                <input type="file" className="hidden" multiple accept=".pdf" onChange={handleFileChange} />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-[#c1a35f]" />
                        </div>
                        <span className="text-xs font-bold truncate text-white/60">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(idx)} className="text-white/20 hover:text-red-500 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ação */}
            <div className="pt-4">
              <button 
                disabled={loading || !name || files.length === 0}
                onClick={processScales}
                className="w-full bg-[#c1a35f] disabled:bg-white/5 disabled:text-white/10 text-black font-black py-6 rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-[#c1a35f]/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Calcular Banco de Horas <ArrowRight size={18} /></>
                )}
              </button>
              <div className="flex items-start gap-2 mt-6 px-2 opacity-30">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                  O sistema irá processar as escalas, identificar seus turnos e calcular o saldo baseado na meta mensal de 160h.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            {/* Resumo Superior */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#c1a35f] uppercase tracking-widest">Resultados para</p>
                <h2 className="text-2xl font-black uppercase text-white tracking-tight">{name}</h2>
              </div>
              <button 
                onClick={() => setResults(null)}
                className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
              >
                <ChevronLeft size={16} /> Voltar e editar
              </button>
            </div>

            {/* Listagem de Meses */}
            {sortedMonths.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {sortedMonths.map((month) => (
                  <MonthCard key={month.monthYear} data={month} />
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-white/10" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Nenhum turno encontrado</h3>
                <p className="text-sm text-white/30 max-w-xs">Verifique se o nome digitado corresponde ao que consta no PDF da escala.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-8 px-6 text-center border-t border-white/5 mt-12">
        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
          Sistema Auxiliar de Gestão de Carga Horária
        </p>
      </footer>
    </div>
  );
};

const MonthCard: React.FC<{ data: MonthData }> = ({ data }) => {
  const goal = 160;
  const balance = data.totalHours - goal;
  const isPositive = balance >= 0;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden transition-all hover:border-white/10">
      <div className="p-8 space-y-8">
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#c1a35f]/10 flex items-center justify-center">
              <Calendar size={20} className="text-[#c1a35f]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Período</p>
              <h3 className="text-xl font-black uppercase tracking-tighter">{data.monthYear}</h3>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isPositive ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isPositive ? 'Crédito' : 'Débito'}
            </span>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2">Total Trabalhado</p>
            <p className="text-3xl font-black text-white tabular-nums">
              {data.totalHours.toFixed(1)}<span className="text-sm font-bold ml-1 text-[#c1a35f]">h</span>
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2">Saldo Excedente</p>
            <p className={`text-3xl font-black tabular-nums ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{balance.toFixed(1)}<span className="text-sm font-bold ml-1 opacity-40 text-current">h</span>
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Meta Mensal (160h)</p>
            <p className="text-xs font-black text-white/60 tabular-nums">{Math.round((data.totalHours / goal) * 100)}%</p>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-green-500' : 'bg-[#c1a35f]'}`}
              style={{ width: `${Math.min(100, (data.totalHours / goal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Lista de Turnos */}
        <details className="group">
          <summary className="list-none flex items-center justify-between text-[10px] font-black uppercase text-white/20 cursor-pointer py-4 border-t border-white/5 hover:text-white transition-colors">
            Detalhamento da Escala ({data.shifts.length} Turnos)
            <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
          </summary>
          <div className="pt-2 space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {data.shifts.map((shift, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-[#c1a35f]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white mb-0.5">{shift.date}</p>
                    <p className="text-[10px] text-white/20 font-bold tabular-nums uppercase">{shift.startTime} > {shift.endTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white tabular-nums">+{shift.hours.toFixed(1)}h</p>
                  <p className="text-[8px] text-white/10 font-bold truncate max-w-[80px] uppercase">{shift.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default App;
