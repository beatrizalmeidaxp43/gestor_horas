
import { Shift, ProcessResult, MonthData } from '../types';

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Limpa a linha de texto da escala para extrair apenas o nome do militar.
 * Remove (matrícula), patentes/graduações (SD, CB, SGT, etc) e funções (- Condutor, etc).
 */
const cleanMilitarName = (lineText: string, searchTarget: string): string => {
  let cleaned = lineText;
  
  // 1. Remove parênteses e o conteúdo dentro deles (geralmente a matrícula)
  cleaned = cleaned.replace(/\([\d.-]+\)/g, '');
  
  // 2. Remove sufixos após o traço (geralmente a função como - Condutor, - Comandante)
  cleaned = cleaned.replace(/\s*-\s*.*$/, '');
  
  // 3. Lista de patentes e termos comuns em escalas PMMG para remover
  const termsToRemove = [
    'SD', 'CB', 'SGT', 'TEN', 'CAP', 'MAJ', 'CEL', 'SUB', 'TEN', 
    '1 CL', '2 CL', '3 CL', 'CL', '1º', '2º', '3º', 'AL', 'CHO', 'CFS'
  ];
  
  // Cria uma regex para remover esses termos de forma isolada (case insensitive)
  termsToRemove.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });

  // 4. Remove números soltos (como o "1" em SD 1 CL)
  cleaned = cleaned.replace(/\b\d+\b/g, '');

  // 5. Remove espaços extras e converte para maiúsculo
  return cleaned.trim().replace(/\s+/g, ' ').toUpperCase();
};

export const parsePMMGFiles = async (
  files: File[],
  targetName: string
): Promise<ProcessResult> => {
  const months: { [key: string]: MonthData } = {};
  const normalizedTarget = targetName.toUpperCase().trim();
  let detectedName = '';

  const timeRegex = /(?:\([\d:]{5,8}\))?(\d{2}[:h]\d{2}(?::\d{2})?)\s*(?:AS|ÀS|-|A)\s*(\d{2}[:h]\d{2}(?::\d{2})?)/i;
  const dateRegex = /(\d{2}\/\d{2}\/\d{4})/;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const linesMap: Map<number, any[]> = new Map();
      textContent.items.forEach((item: any) => {
        const y = Math.round(item.transform[5]);
        if (!linesMap.has(y)) linesMap.set(y, []);
        linesMap.get(y)!.push(item);
      });

      const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
      
      let pageDate = '';
      const fullPageText = textContent.items.map((it: any) => it.str).join(' ');
      const globalDateMatch = fullPageText.match(dateRegex);
      if (globalDateMatch) {
        pageDate = globalDateMatch[0];
      }

      let currentShiftTimes: { start: string, end: string, hours: number } | null = null;

      for (const y of sortedY) {
        const lineItems = linesMap.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);
        const lineText = lineItems.map(it => it.str).join(' ');
        const upperLine = lineText.toUpperCase();

        const specificDateMatch = lineText.match(dateRegex);
        if (upperLine.includes('DATA:') && specificDateMatch) {
          pageDate = specificDateMatch[0];
        } else if (specificDateMatch && !pageDate) {
           pageDate = specificDateMatch[0];
        }

        if (upperLine.includes('TURNO:')) {
          const match = lineText.match(timeRegex);
          if (match) {
            const start = match[1].substring(0, 5).replace('h', ':');
            const end = match[2].substring(0, 5).replace('h', ':');
            
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            let diff = (h2 + m2/60) - (h1 + m1/60);
            if (diff <= 0) diff += 24;
            currentShiftTimes = { start, end, hours: diff };
          }
        }

        if (upperLine.includes(normalizedTarget)) {
          // Extrai e limpa o nome caso o alvo seja encontrado
          if (!detectedName) {
            detectedName = cleanMilitarName(lineText, normalizedTarget);
          }

          if (currentShiftTimes && pageDate) {
            let monthYear = 'Geral';
            const dateParts = pageDate.split('/');
            if (dateParts.length === 3) {
              monthYear = `${dateParts[1]}/${dateParts[2]}`;
            }

            if (!months[monthYear]) {
              months[monthYear] = { monthYear, totalHours: 0, shifts: [] };
            }

            const isDuplicate = months[monthYear].shifts.some(s => 
              s.date === pageDate && s.startTime === currentShiftTimes?.start && s.endTime === currentShiftTimes?.end
            );

            if (!isDuplicate) {
              months[monthYear].shifts.push({
                id: Math.random().toString(36).substr(2, 9),
                date: pageDate,
                startTime: currentShiftTimes.start,
                endTime: currentShiftTimes.end,
                hours: currentShiftTimes.hours,
                fileName: file.name,
                isManual: false
              });
              months[monthYear].totalHours += currentShiftTimes.hours;
            }
          }
        }
      }
    }
  }

  return { 
    months, 
    detectedName: detectedName || '',
    targetSearch: normalizedTarget
  };
};
