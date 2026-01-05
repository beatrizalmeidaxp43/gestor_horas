
export interface Shift {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  hours: number;
  fileName?: string;
  description?: string;
  isManual?: boolean;
}

export interface MonthData {
  monthYear: string;
  totalHours: number;
  shifts: Shift[];
}

export interface ProcessResult {
  months: { [key: string]: MonthData };
  detectedName?: string;
  targetSearch?: string;
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
