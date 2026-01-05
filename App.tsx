
import React, { useState, useMemo, useEffect } from 'react';
import { parsePMMGFiles } from './services/pdfParser';
import { ProcessResult, MonthData, Shift } from './types';
import { 
  FileText, 
  Upload, 
  ChevronRight, 
  Clock, 
  Calendar,
  X,
  Search,
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState<{show: boolean, monthYear?: string}>({ show: false });

  const [manualEntries, setManualEntries] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('pmmg_manual_entries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pmmg_manual_entries', JSON.stringify(manualEntries));
  }, [manualEntries]);

  const processScales = async () => {
    if (!name || files.length === 0) return;
    setLoading(true);
    try {
      const data = await parsePMMGFiles(files, name);
      setResults(data);
    } catch (error) {
      alert("Erro ao ler PDFs.");
    } finally {
      setLoading(false);
    }
  };

  const mergedResults = useMemo(() => {
    if (!results) return null;
    const combined: ProcessResult = JSON.parse(JSON.stringify(results));
    
    manualEntries.forEach(entry => {
      const [day, month, year] = entry.date.split('/');
      const monthYear = `${month}/${year}`;
      
      if (!combined.months[monthYear]) {
        combined.months[monthYear] = { monthYear, totalHours: 0, shifts: [] };
      }
      
      combined.months[monthYear].shifts.push(entry);
      combined.months[monthYear].totalHours += entry.hours;
    });

    return combined;
  }, [results, manualEntries]);

  const sortedMonths = useMemo(() => {
    if (!mergedResults) return [];
    return Object.values(mergedResults.months).sort((a: MonthData, b: MonthData) => {
      const [m1, y1] = a.monthYear.split('/').map(Number);
      const [m2, y2] = b.monthYear.split('/').map(Number);
      return (y2 * 12 + m2) - (y1 * 12 + m1);
    });
  }, [mergedResults]);

  const addExtraHour = (entry: Shift) => {
    setManualEntries(prev => [...prev, entry]);
    setShowPopup({ show: false });
  };

  const deleteShift = (id: string, isManual: boolean) => {
    if (isManual) {
      setManualEntries(prev => prev.filter(e => e.id !== id));
    } else if (results) {
      const newResults = { ...results };
      Object.keys(newResults.months).forEach(month => {
        newResults.months[month].shifts = newResults.months[month].shifts.filter(s => s.id !== id);
        newResults.months[month].totalHours = newResults.months[month].shifts.reduce((acc, s) => acc + s.hours, 0);
      });
      setResults(newResults);
    }
  };

  const hasNoScaleFound = results && sortedMonths.length === 0;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-slate-100 flex flex-col font-sans selection:bg-[#c1a35f] selection:text-black">
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
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors"
            >
              Nova Pesquisa
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-12">
        {!results ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <Search size={14} />
                <label className="text-[10px] font-black uppercase tracking-widest">Identificação</label>
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="DIGITE A MATRÍCULA OU NOME"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:border-[#c1a35f]/50 outline-none transition-all placeholder:text-white/10 uppercase tracking-wider"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <FileText size={14} />
                <label className="text-[10px] font-black uppercase tracking-widest">Escalas em PDF</label>
              </div>
              <label className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#c1a35f]/20 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Upload className="text-white/20 group-hover:text-[#c1a35f] mb-4 transition-colors" size={32} />
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Clique ou arraste as escalas</p>
                </div>
                <input type="file" className="hidden" multiple accept=".pdf" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <span className="text-[11px] font-bold truncate text-white/60">{file.name}</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-white/20 hover:text-red-500"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              disabled={loading || !name || files.length === 0}
              onClick={processScales}
              className="w-full bg-[#c1a35f] disabled:bg-white/5 disabled:text-white/10 text-black font-black py-6 rounded-2xl uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              {loading ? <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>Analisar Banco de Horas <ArrowRight size={18} /></>}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            {/* Cabeçalho de Identificação com Nome Limpo */}
            <div className="border-b border-white/5 pb-8">
              <p className="text-[10px] font-black text-[#c1a35f] uppercase tracking-[0.2em]">Militar Identificado</p>
              <h2 className="text-3xl font-black text-white mt-1 uppercase tracking-tight leading-none">{results.targetSearch}</h2>
              {results.detectedName && (
                <p className="text-xl font-bold text-white/40 uppercase mt-2 tracking-wide">{results.detectedName}</p>
              )}
            </div>

            {hasNoScaleFound ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white/[0.02] rounded-[40px] border border-white/5">
                <div className="w-20 h-20 bg-[#c1a35f]/10 rounded-full flex items-center justify-center text-[#c1a35f]">
                  <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#c1a35f]">De Folga!</h3>
                  <p className="text-sm text-white/30 max-w-sm mx-auto leading-relaxed">Não encontramos turnos para sua matrícula/nome nas escalas enviadas. Você está de folga do sistema!</p>
                </div>
                <button 
                  onClick={() => {setResults(null); setFiles([]); setName('');}}
                  className="text-[10px] font-black uppercase text-[#c1a35f] border border-[#c1a35f]/20 px-10 py-4 rounded-full hover:bg-[#c1a35f]/5 transition-all"
                >
                  Nova busca
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 pb-12">
                {sortedMonths.map((month) => (
                  <MonthCard 
                    key={month.monthYear} 
                    data={month} 
                    onDelete={deleteShift}
                    onAddExtra={() => setShowPopup({ show: true, monthYear: month.monthYear })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showPopup.show && (
        <ExtraHourPopup 
          onClose={() => setShowPopup({ show: false })} 
          onSubmit={addExtraHour}
          initialMonthYear={showPopup.monthYear}
        />
      )}
    </div>
  );
};

const MonthCard: React.FC<{ 
  data: MonthData, 
  onDelete: (id: string, isManual: boolean) => void,
  onAddExtra: () => void 
}> = ({ data, onDelete, onAddExtra }) => {
  const goal = 160;
  const balance = data.totalHours - goal;
  const isPositive = balance >= 0;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[40px] overflow-hidden transition-all hover:border-white/10">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#c1a35f]/10 flex items-center justify-center">
              <Calendar size={20} className="text-[#c1a35f]" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">{data.monthYear}</h3>
          </div>
          <button 
            onClick={onAddExtra}
            className="text-[10px] font-black uppercase text-[#c1a35f] border border-[#c1a35f]/20 px-5 py-2.5 rounded-full hover:bg-[#c1a35f]/10 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Adicionar Extra
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Total Horas</p>
            <p className="text-3xl font-black">{data.totalHours.toFixed(1)}<span className="text-sm font-bold ml-1 text-[#c1a35f]">h</span></p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Saldo Banco</p>
            <p className={`text-3xl font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{balance.toFixed(1)}<span className="text-sm font-bold ml-1 opacity-40">h</span>
            </p>
          </div>
        </div>

        <details className="group">
          <summary className="list-none flex items-center justify-between text-[10px] font-black uppercase text-white/20 cursor-pointer py-4 border-t border-white/5 group-hover:text-white/40 transition-colors">
            Visualizar Detalhamento
            <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
          </summary>
          <div className="pt-2 space-y-3">
            {data.shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${shift.isManual ? 'bg-[#c1a35f]/20' : 'bg-white/5'}`}>
                    <Clock size={16} className={shift.isManual ? "text-[#c1a35f]" : "text-white/40"} />
                  </div>
                  <div>
                    <p className="text-xs font-black">{shift.date}</p>
                    <p className="text-[10px] text-white/20 font-bold uppercase truncate max-w-[180px]">
                      {shift.description || (shift.startTime ? `${shift.startTime} > ${shift.endTime}` : 'Serviço')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-white">+{shift.hours.toFixed(1)}h</p>
                    {shift.isManual && <span className="text-[8px] font-black text-[#c1a35f] uppercase tracking-tighter">Manual</span>}
                  </div>
                  <button onClick={() => onDelete(shift.id, !!shift.isManual)} className="text-white/5 hover:text-red-500 p-2 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

const ExtraHourPopup: React.FC<{ onClose: () => void, onSubmit: (entry: Shift) => void, initialMonthYear?: string }> = ({ onClose, onSubmit, initialMonthYear }) => {
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('8');
  const [date, setDate] = useState(() => {
    if (initialMonthYear) {
      const [m, y] = initialMonthYear.split('/');
      return `${y}-${m}-01`;
    }
    return new Date().toISOString().split('T')[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !hours) return;
    const [y, m, d] = date.split('-');
    onSubmit({
      id: Math.random().toString(36).substr(2, 9),
      date: `${d}/${m}/${y}`,
      hours: parseFloat(hours),
      description: description.toUpperCase(),
      isManual: true
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c1a35f]">Lançar Hora Extra</h3>
            <button type="button" onClick={onClose} className="text-white/20 hover:text-white"><X size={20}/></button>
          </div>
          <div className="space-y-4">
            <textarea 
              autoFocus placeholder="DESCRIÇÃO DO SERVIÇO (EX: AUDIÊNCIA FÓRUM)"
              className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#c1a35f]/50 resize-none h-24 uppercase"
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-white/20 ml-2">Data</label>
                <input type="date" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#c1a35f]/50" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-white/20 ml-2">Carga (h)</label>
                <input type="number" step="0.5" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#c1a35f]/50" value={hours} onChange={(e) => setHours(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#c1a35f] text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-[#c1a35f]/10 active:scale-95 transition-all">Confirmar Lançamento</button>
        </form>
      </div>
    </div>
  );
};

export default App;
