
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { AnalysisSummary } from '../types';
import { formatHours, formatDate } from '../utils/helpers';

interface DashboardProps {
  data: AnalysisSummary;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const pieData = [
    { name: 'Horas Trabalhadas', value: data.totalHours },
    { name: 'Restante Meta', value: Math.max(0, data.monthlyGoal - data.totalHours) }
  ];

  const COLORS = ['#1e3a8a', '#e2e8f0'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total de Horas</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">{formatHours(data.totalHours)}</p>
          <p className="text-xs text-slate-400 mt-1">Carga total identificada no PDF</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Saldo (Banco)</h3>
          <p className={`text-3xl font-bold mt-2 ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.balance >= 0 ? '+' : ''}{formatHours(data.balance)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Comparado à meta de {data.monthlyGoal}h</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Status da Meta</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {Math.round((data.totalHours / data.monthlyGoal) * 100)}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (data.totalHours / data.monthlyGoal) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-slate-800 font-semibold mb-4">Distribuição Mensal</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatHours(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-80">
          <h3 className="text-slate-800 font-semibold mb-4">Histórico de Turnos</h3>
          <div className="overflow-y-auto flex-1 pr-2">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-50">
                <tr>
                  <th className="py-2 px-1">Data</th>
                  <th className="py-2 px-1">Horário</th>
                  <th className="py-2 px-1 text-right">Duração</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {data.shifts.map((shift, i) => (
                  <tr key={i}>
                    <td className="py-2 px-1 text-slate-600 font-medium">{formatDate(shift.date)}</td>
                    <td className="py-2 px-1 text-slate-500">{shift.startTime} - {shift.endTime}</td>
                    <td className="py-2 px-1 text-right font-semibold text-slate-700">{formatHours(shift.hoursWorked)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
