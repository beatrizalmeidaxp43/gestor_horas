
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) resolve(base64String);
      else reject(new Error("Falha ao converter arquivo"));
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatHours = (hours: number): string => {
  const h = Math.floor(Math.abs(hours));
  const m = Math.round((Math.abs(hours) % 1) * 60);
  const sign = hours < 0 ? '-' : '';
  return `${sign}${h}h ${m}min`;
};

export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};
