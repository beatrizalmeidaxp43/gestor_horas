
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiShift, AnalysisSummary } from "../types";

export const analyzeScalePDF = async (
  base64Pdf: string,
  personName: string
): Promise<AnalysisSummary> => {
  // Use named parameter and direct process.env.API_KEY access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise este documento de escala da Polícia Militar de Minas Gerais (PMMG). 
  Identifique todos os turnos de serviço para o militar chamado "${personName}".
  
  Extraia os dados em um formato estruturado. 
  Considere que o militar pode estar listado por nome completo ou nome de guerra dentro da escala.
  
  Para cada turno encontrado, calcule a duração em horas.
  Regras:
  - Carga mensal padrão: 160 horas.
  - Se o turno termina no dia seguinte, calcule a duração total corretamente.
  - Retorne um objeto JSON conforme o schema definido.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personName: { type: Type.STRING },
          shifts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Data do turno no formato YYYY-MM-DD" },
                startTime: { type: Type.STRING, description: "Hora de início HH:mm" },
                endTime: { type: Type.STRING, description: "Hora de término HH:mm" },
                description: { type: Type.STRING, description: "Tipo de serviço ou posto" },
                hoursWorked: { type: Type.NUMBER, description: "Total de horas calculadas para este turno" }
              },
              required: ["date", "startTime", "endTime", "hoursWorked"]
            }
          }
        },
        required: ["personName", "shifts"]
      }
    }
  });

  const rawResult = JSON.parse(response.text);
  
  // Apply explicit GeminiShift typing to ensure correct property access
  const totalHours = rawResult.shifts.reduce((acc: number, shift: GeminiShift) => acc + shift.hoursWorked, 0);
  const monthlyGoal = 160;
  
  return {
    personName: rawResult.personName,
    shifts: rawResult.shifts,
    totalHours: totalHours,
    monthlyGoal: monthlyGoal,
    balance: totalHours - monthlyGoal
  };
};
