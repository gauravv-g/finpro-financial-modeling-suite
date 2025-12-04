
import React, { useState, useEffect } from 'react';
import { FinancialInputs, ScenarioResult } from '../types';
import { calculateScenario } from '../utils/financials';
import { TrendingUp, TrendingDown, Minus, Sliders, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  baseInputs: FinancialInputs;
  onBack: () => void;
}

export const SensitivityAnalysis: React.FC<Props> = ({ baseInputs, onBack }) => {
  // Scenario Configurations (Modifiers)
  const [optimistic, setOptimistic] = useState({
    growth: baseInputs.revenueGrowthRate + 5,
    margin: Math.min(baseInputs.netMargin + 2, 99),
    interest: Math.max(baseInputs.interestRate - 1, 1)
  });

  const [pessimistic, setPessimistic] = useState({
    growth: Math.max(baseInputs.revenueGrowthRate - 5, 0),
    margin: Math.max(baseInputs.netMargin - 3, 1),
    interest: baseInputs.interestRate + 2
  });
  
  // Results State
  const [results, setResults] = useState<ScenarioResult[]>([]);

  // Recalculate whenever sliders change
  useEffect(() => {
    const baseRes = calculateScenario(baseInputs, 'Base', {
        growth: baseInputs.revenueGrowthRate,
        margin: baseInputs.netMargin,
        interest: baseInputs.interestRate
    });

    const optRes = calculateScenario(baseInputs, 'Optimistic', optimistic);
    const pesRes = calculateScenario(baseInputs, 'Pessimistic', pessimistic);

    setResults([pesRes, baseRes, optRes]);
  }, [baseInputs, optimistic, pessimistic]);

  // Chart Data Preparation
  const dscrData = results.map(r => ({
    name: r.type,
    DSCR: r.metrics.avgDscr,
    fill: r.type === 'Pessimistic' ? '#ef4444' : r.type === 'Optimistic' ? '#10b981' : '#3b82f6'
  }));

  const profitData = results.map(r => ({
    name: r.type,
    Revenue5: r.projections[4].revenue,
    PAT5: r.projections[4].pat,
  }));

  const renderSlider = (label: string, value: number, onChange: (val: number) => void, min: number, max: number, step = 0.5, suffix = '%') => (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
        <span>{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );

  return (
    <div className="animate-fade-in pb-12">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition">
                <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
                <h2 className="text-2xl font-serif font-bold text-slate-800">Sensitivity Analysis & Simulation</h2>
                <p className="text-slate-500 text-sm">Test business resilience against market volatility.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Pessimistic Controls */}
            <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-6 text-red-700">
                    <TrendingDown size={20} />
                    <h3 className="font-bold">Pessimistic Scenario</h3>
                </div>
                {renderSlider("Revenue Growth", pessimistic.growth, (v) => setPessimistic(p => ({...p, growth: v})), 0, 50)}
                {renderSlider("Net Profit Margin", pessimistic.margin, (v) => setPessimistic(p => ({...p, margin: v})), 0, 50)}
                {renderSlider("Interest Rate", pessimistic.interest, (v) => setPessimistic(p => ({...p, interest: v})), 1, 24)}
                <div className="mt-4 p-3 bg-red-50 rounded text-xs text-red-800">
                    Use this to test "Worst Case" (e.g., market crash, high inflation).
                </div>
            </div>

            {/* Base Case Display */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner flex flex-col justify-center opacity-80">
                 <div className="flex items-center gap-2 mb-6 text-slate-700 justify-center">
                    <Minus size={20} />
                    <h3 className="font-bold">Base Scenario</h3>
                </div>
                <div className="space-y-4 text-center">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Growth</p>
                        <p className="text-xl font-bold font-serif">{baseInputs.revenueGrowthRate}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Net Margin</p>
                        <p className="text-xl font-bold font-serif">{baseInputs.netMargin}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Interest</p>
                        <p className="text-xl font-bold font-serif">{baseInputs.interestRate}%</p>
                    </div>
                </div>
                <div className="mt-8 text-center text-xs text-slate-400">
                    (Defined in Inputs)
                </div>
            </div>

            {/* Optimistic Controls */}
            <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-6 text-emerald-700">
                    <TrendingUp size={20} />
                    <h3 className="font-bold">Optimistic Scenario</h3>
                </div>
                {renderSlider("Revenue Growth", optimistic.growth, (v) => setOptimistic(p => ({...p, growth: v})), 0, 100)}
                {renderSlider("Net Profit Margin", optimistic.margin, (v) => setOptimistic(p => ({...p, margin: v})), 0, 80)}
                {renderSlider("Interest Rate", optimistic.interest, (v) => setOptimistic(p => ({...p, interest: v})), 1, 24)}
                <div className="mt-4 p-3 bg-emerald-50 rounded text-xs text-emerald-800">
                    Use this to test "Best Case" (e.g., export orders, subsidy grant).
                </div>
            </div>
        </div>

        {/* COMPARISON RESULTS */}
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sliders size={20} /> Comparative Outcomes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* DSCR Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Avg. DSCR Sensitivity</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dscrData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis domain={[0, 'auto']} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <ReferenceLine y={1.25} stroke="red" strokeDasharray="3 3" label={{ value: "Min 1.25", position: 'right', fill: 'red', fontSize: 10 }} />
                        <Bar dataKey="DSCR" barSize={50} radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#64748b', fontSize: 12 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Profit Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Year 5 Profitability (₹ Lakhs)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Revenue5" name="Revenue (Yr 5)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="PAT5" name="Net Profit (Yr 5)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Metric</th>
                        <th className="px-6 py-4 text-red-300">Pessimistic</th>
                        <th className="px-6 py-4 text-slate-300">Base Case</th>
                        <th className="px-6 py-4 text-emerald-300">Optimistic</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-700">Internal Rate of Return (IRR)</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{results[0]?.metrics.irr}%</td>
                        <td className="px-6 py-4 font-bold">{results[1]?.metrics.irr}%</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">{results[2]?.metrics.irr}%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-700">Avg. DSCR</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{results[0]?.metrics.avgDscr}</td>
                        <td className="px-6 py-4 font-bold">{results[1]?.metrics.avgDscr}</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">{results[2]?.metrics.avgDscr}</td>
                    </tr>
                     <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-700">Net Present Value (NPV)</td>
                        <td className="px-6 py-4 text-red-600 font-bold">₹{results[0]?.metrics.npv}L</td>
                        <td className="px-6 py-4 font-bold">₹{results[1]?.metrics.npv}L</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">₹{results[2]?.metrics.npv}L</td>
                    </tr>
                     <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-700">Cumulative Cash Flow (5 Yrs)</td>
                        <td className="px-6 py-4 font-mono">₹{results[0]?.projections.reduce((a,b) => a+b.cashFlow, 0).toFixed(2)}L</td>
                        <td className="px-6 py-4 font-mono">₹{results[1]?.projections.reduce((a,b) => a+b.cashFlow, 0).toFixed(2)}L</td>
                        <td className="px-6 py-4 font-mono">₹{results[2]?.projections.reduce((a,b) => a+b.cashFlow, 0).toFixed(2)}L</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Verdict */}
        <div className="mt-8 bg-slate-800 text-slate-300 p-6 rounded-xl text-center text-sm">
             {results[0]?.metrics.avgDscr < 1.25 ? (
                 <p className="flex items-center justify-center gap-2 text-red-400 font-bold">
                    <AlertTriangle size={18} /> 
                    Risk Alert: Pessimistic scenario drops DSCR below 1.25. Consider increasing promoter contribution.
                 </p>
             ) : (
                 <p className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                     <CheckCircle size={18} />
                     Resilient: Project maintains bankable DSCR ({results[0]?.metrics.avgDscr}) even in worst-case scenario.
                 </p>
             )}
        </div>
    </div>
  );
};
