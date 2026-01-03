
export interface Shift {
  id: string; // Adicionado ID para controle de exclusão/edição
  date: string;
  startTime?: string;
  endTime?: string;
  hours: number;
  fileName?: string;
  description?: string; // Campo de texto solicitado pelo usuário
  isManual?: boolean;   // Identificador de lançamento manual
}

export interface MonthData {
  monthYear: string; // Ex: "05/2024"
  totalHours: number;
  shifts: Shift[];
}

export interface ProcessResult {
  [key: string]: MonthData;
}

export interface GeminiShift {
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  hoursWorked: number;
}

export interface AnalysisSummary {
  personName: string;
  shifts: GeminiShift[];
  totalHours: number;
  monthlyGoal: number;
  balance: number;
}
