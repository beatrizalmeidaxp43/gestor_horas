
export interface Shift {
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  fileName: string;
}

export interface MonthData {
  monthYear: string; // Ex: "05/2024"
  totalHours: number;
  shifts: Shift[];
}

export interface ProcessResult {
  [key: string]: MonthData;
}

// Added to support Gemini analysis output and Dashboard component
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
