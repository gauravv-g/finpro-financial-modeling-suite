import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from 'recharts';
import { YearProjection } from '../types';

interface Props {
  data: YearProjection[];
}

export const RevenueChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-72 w-full mt-4">
      <h4 className="text-center font-serif text-slate-700 mb-2">Revenue vs Net Profit (5 Year)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            formatter={(value: number) => [`₹${value} Lakhs`, '']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
          <Line type="monotone" dataKey="pat" name="Net Profit (PAT)" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CashFlowChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-72 w-full mt-4">
       <h4 className="text-center font-serif text-slate-700 mb-2">Projected Cash Flows & EBITDA</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip formatter={(value: number) => [`₹${value} Lakhs`, '']} />
          <Legend />
          <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="cashFlow" name="Net Cash Flow" stroke="#22c55e" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};