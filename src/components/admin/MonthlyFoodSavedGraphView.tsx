'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MOCK_MONTHLY_SAVINGS,
  MOCK_CITY_STATE_METRICS,
  MonthlyFoodSaved,
} from '@/services/adminData';
import {
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  Scale,
  Utensils,
  Leaf,
  Layers,
} from 'lucide-react';

export default function MonthlyFoodSavedGraphView() {
  const [mounted, setMounted] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [metricType, setMetricType] = useState<'foodSavedKg' | 'mealsRescued' | 'co2PreventedKg'>('foodSavedKg');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute available states and cities
  const states = Array.from(new Set(MOCK_CITY_STATE_METRICS.map((m) => m.state)));
  const availableCities = MOCK_CITY_STATE_METRICS.filter(
    (m) => selectedState === 'ALL' || m.state === selectedState
  ).map((m) => m.city);

  // Compute multiplier based on selected state/city for regional estimation
  let regionalScale = 1.0;
  if (selectedCity !== 'ALL') {
    const cityMetric = MOCK_CITY_STATE_METRICS.find((m) => m.city === selectedCity);
    regionalScale = cityMetric ? cityMetric.foodSavedThisMonthKg / 31200 : 0.25;
  } else if (selectedState !== 'ALL') {
    const stateCities = MOCK_CITY_STATE_METRICS.filter((m) => m.state === selectedState);
    const sumKg = stateCities.reduce((acc, c) => acc + c.foodSavedThisMonthKg, 0);
    regionalScale = sumKg > 0 ? sumKg / 31200 : 0.45;
  }

  // Adjust monthly data according to region selection
  const chartData = MOCK_MONTHLY_SAVINGS.map((item) => ({
    ...item,
    foodSavedKg: Math.round(item.foodSavedKg * regionalScale),
    mealsRescued: Math.round(item.mealsRescued * regionalScale),
    co2PreventedKg: Math.round(item.co2PreventedKg * regionalScale),
  }));

  // Summary Metrics
  const totalFoodSaved = chartData.reduce((acc, d) => acc + d.foodSavedKg, 0);
  const totalMealsRescued = chartData.reduce((acc, d) => acc + d.mealsRescued, 0);
  const totalCo2Prevented = chartData.reduce((acc, d) => acc + d.co2PreventedKg, 0);
  const averageMonthly = Math.round(totalFoodSaved / chartData.length);
  const latestMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const momGrowth = previousMonth
    ? (((latestMonth.foodSavedKg - previousMonth.foodSavedKg) / previousMonth.foodSavedKg) * 100).toFixed(1)
    : '8.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            HISTORICAL RESCUE VOLUME & IMPACT TELEMETRY
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Food Saved Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Audit-grade monthly weight, portion count, and landfill diversion records across regional jurisdictions
          </p>
        </div>

        {/* State and City Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">State:</span>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('ALL');
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All States (National)</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <span className="font-semibold text-slate-600">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Food Saved</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(totalFoodSaved / 1000).toFixed(1)}k kg
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{momGrowth}% MoM pace
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Meals Rescued</span>
            <Utensils className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalMealsRescued.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Distributed to verified NGOs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>CO2 Emissions Prevented</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(totalCo2Prevented / 1000).toFixed(1)}k kg
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Landfill methane diversion</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Monthly Run-Rate</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(averageMonthly / 1000).toFixed(1)}k kg / mo
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Across active rescue corridors</div>
        </div>
      </div>

      {/* BAR GRAPH SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Monthly Food Saved Trajectory
            </h2>
            <p className="text-xs text-slate-500">
              {selectedState === 'ALL' && selectedCity === 'ALL'
                ? 'National Combined Volume (All Connected Metro Jurisdictions)'
                : `Filtered Scope: ${selectedCity !== 'ALL' ? selectedCity + ', ' : ''}${selectedState !== 'ALL' ? selectedState : ''}`}
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMetricType('foodSavedKg')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'foodSavedKg'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weight Saved (kg)
            </button>
            <button
              onClick={() => setMetricType('mealsRescued')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'mealsRescued'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Portions / Meals
            </button>
            <button
              onClick={() => setMetricType('co2PreventedKg')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'co2PreventedKg'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CO2 Prevented (kg)
            </button>
          </div>
        </div>

        {/* Recharts Bar Graph */}
        <div className="h-80 w-full pt-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="shortMonth"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MonthlyFoodSaved;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1.5">
                          <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">
                            {data.month}
                          </div>
                          <div>
                            <span className="text-slate-400">Food Saved:</span>{' '}
                            <strong>{data.foodSavedKg.toLocaleString()} kg</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Meals Rescued:</span>{' '}
                            <strong>{data.mealsRescued.toLocaleString()} meals</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">CO2 Prevented:</span>{' '}
                            <strong>{data.co2PreventedKg.toLocaleString()} kg</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Active Partners:</span>{' '}
                            <strong>{data.activePartners} organizations</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 600 }}
                  formatter={(value) => {
                    if (value === 'foodSavedKg') return 'Food Saved (Kilograms)';
                    if (value === 'mealsRescued') return 'Meals / Portions Rescued';
                    if (value === 'co2PreventedKg') return 'CO2 Emissions Prevented (kg)';
                    return value;
                  }}
                />
                {metricType === 'foodSavedKg' && (
                  <Bar
                    dataKey="foodSavedKg"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    name="foodSavedKg"
                  />
                )}
                {metricType === 'mealsRescued' && (
                  <Bar
                    dataKey="mealsRescued"
                    fill="#2563EB"
                    radius={[6, 6, 0, 0]}
                    name="mealsRescued"
                  />
                )}
                {metricType === 'co2PreventedKg' && (
                  <Bar
                    dataKey="co2PreventedKg"
                    fill="#0D9488"
                    radius={[6, 6, 0, 0]}
                    name="co2PreventedKg"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading interactive bar graph...
            </div>
          )}
        </div>
      </div>

      {/* Monthly Detailed Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="font-extrabold text-slate-900 text-sm">Monthly Rescue Ledger</h3>
          </div>
          <span className="text-xs text-slate-400">Last 12 Reporting Cycles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Month</th>
                <th className="p-3.5">Food Saved (kg)</th>
                <th className="p-3.5">Meals Rescued</th>
                <th className="p-3.5">CO2 Avoided (kg)</th>
                <th className="p-3.5">Active Partners</th>
                <th className="p-3.5">Completed Rescues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {[...chartData].reverse().map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold font-sans text-slate-900">{row.month}</td>
                  <td className="p-3.5 font-bold text-emerald-700">{row.foodSavedKg.toLocaleString()} kg</td>
                  <td className="p-3.5 text-blue-700 font-bold">{row.mealsRescued.toLocaleString()}</td>
                  <td className="p-3.5 text-teal-700">{row.co2PreventedKg.toLocaleString()} kg</td>
                  <td className="p-3.5 font-sans">{row.activePartners} orgs</td>
                  <td className="p-3.5 font-sans font-bold">{row.successfulRescues.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
