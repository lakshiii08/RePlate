'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  HeartHandshake,
  MapPin,
  RefreshCw,
  ShoppingBasket,
  Store,
  Utensils,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Region = {
  state: string;
  city: string;
  restaurants: number;
  groceries: number;
  ngos: number;
  mealsSaved: number;
};

type OverviewData = {
  metrics: {
    restaurants: number;
    groceries: number;
    ngos: number;
    mealsSaved: number;
  };
  monthlyFoodSaved: { key: string; label: string; meals: number }[];
  regions: Region[];
  locations: { state: string; city: string }[];
  updatedAt: string;
};

const numberFormat = new Intl.NumberFormat('en-IN');

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ElementType;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
      </div>
      <p className="mt-5 text-3xl font-semibold text-slate-950">
        {numberFormat.format(value)}
      </p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </article>
  );
}

export default function NetworkOverviewView() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (stateFilter) params.set('state', stateFilter);
      if (cityFilter) params.set('city', cityFilter);
      const response = await fetch('/api/admin/overview?' + params.toString(), {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Could not load network data');
      setOverview(await response.json());
    } catch {
      setError('Network data is unavailable. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  }, [cityFilter, stateFilter]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const states = useMemo(
    () =>
      Array.from(new Set((overview?.locations || []).map((item) => item.state))).sort(),
    [overview]
  );
  const cities = useMemo(
    () =>
      (overview?.locations || [])
        .filter((item) => !stateFilter || item.state === stateFilter)
        .map((item) => item.city)
        .filter((city, index, list) => list.indexOf(city) === index)
        .sort(),
    [overview, stateFilter]
  );
  const updatedAt = overview
    ? new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(overview.updatedAt))
    : '';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Network overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Connected partners and recovered food by location.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {updatedAt ? 'Updated ' + updatedAt : 'Loading data'}
          </span>
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Refresh overview"
            title="Refresh overview"
          >
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </button>
        </div>
      </header>

      <section
        aria-label="Location filters"
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:pb-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          Coverage
        </div>
        <label className="grid gap-1 text-xs font-medium text-slate-600">
          State
          <select
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value);
              setCityFilter('');
            }}
            className="h-9 min-w-44 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none ring-emerald-600 focus:ring-2"
          >
            <option value="">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-slate-600">
          City
          <select
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            className="h-9 min-w-44 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none ring-emerald-600 focus:ring-2 disabled:bg-slate-50"
            disabled={!cities.length}
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <section className={loading ? 'grid gap-4 opacity-60 sm:grid-cols-2 xl:grid-cols-4' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
        <MetricCard
          label="Connected restaurants"
          value={overview?.metrics.restaurants || 0}
          note="Active restaurant partners"
          icon={Store}
        />
        <MetricCard
          label="Connected groceries"
          value={overview?.metrics.groceries || 0}
          note="Active grocery partners"
          icon={ShoppingBasket}
        />
        <MetricCard
          label="Connected NGOs"
          value={overview?.metrics.ngos || 0}
          note="Receiving organisations"
          icon={HeartHandshake}
        />
        <MetricCard
          label="Food recovered"
          value={overview?.metrics.mealsSaved || 0}
          note="Portions in the last six months"
          icon={Utensils}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.7fr)]">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Food recovered by month
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Completed portions across the selected area.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview?.monthlyFoodSaved || []}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={42}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    boxShadow: 'none',
                  }}
                  formatter={(value) => [numberFormat.format(Number(value)), 'Portions']}
                />
                <Bar dataKey="meals" fill="#18734e" radius={[3, 3, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-950">Coverage summary</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Highest recovered volume by city.
          </p>
          <div className="mt-5 divide-y divide-slate-100">
            {(overview?.regions || []).slice(0, 5).map((region) => (
              <div key={region.state + region.city} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{region.city}</p>
                  <p className="text-xs text-slate-500">{region.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {numberFormat.format(region.mealsSaved)}
                  </p>
                  <p className="text-xs text-slate-500">portions</p>
                </div>
              </div>
            ))}
            {!overview?.regions.length && !loading ? (
              <p className="py-8 text-sm text-slate-500">No coverage data for this area.</p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">City coverage</h2>
            <p className="mt-1 text-sm text-slate-500">
              Connected partners and recovered portions by city.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {(overview?.regions || []).length} locations
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">State</th>
                <th className="px-5 py-3 text-right">Restaurants</th>
                <th className="px-5 py-3 text-right">Groceries</th>
                <th className="px-5 py-3 text-right">NGOs</th>
                <th className="px-5 py-3 text-right">Food recovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(overview?.regions || []).map((region) => (
                <tr key={region.state + region.city} className="text-slate-700">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{region.city}</td>
                  <td className="px-5 py-3.5">{region.state}</td>
                  <td className="px-5 py-3.5 text-right">{region.restaurants}</td>
                  <td className="px-5 py-3.5 text-right">{region.groceries}</td>
                  <td className="px-5 py-3.5 text-right">{region.ngos}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                    {numberFormat.format(region.mealsSaved)}
                  </td>
                </tr>
              ))}
              {!overview?.regions.length && !loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No cities match the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
