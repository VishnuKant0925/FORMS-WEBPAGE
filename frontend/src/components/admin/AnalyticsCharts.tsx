'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Loader2, TrendingUp, Calendar, CheckSquare, Award } from 'lucide-react';

interface AnalyticsData {
  monthlyStats: { _id: number; count: number }[];
  statusStats: { _id: string; count: number }[];
  formTypeStats: { _id: string; count: number }[];
  topUsers: { name: string; email: string; employeeCode: string; count: number }[];
  totalCount: number;
}

const COLORS = ['#0B5ED7', '#2E7D32', '#F59E0B', '#D32F2F', '#7C3AED', '#10B981'];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getAnalytics()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics dashboard.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-[#0B3C6D] animate-spin" />
        <span className="text-sm text-[#6B7280]">Loading analytics charts...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-[#D32F2F] bg-[#FFEBEE] rounded">
        {error || 'No analytics data available.'}
      </div>
    );
  }

  // Format monthly stats: map numeric month to English month names
  const formattedMonthly = MONTHS.map((name, index) => {
    const match = data.monthlyStats.find(item => item._id === index + 1);
    return {
      name,
      Applications: match ? match.count : 0
    };
  });

  // Format status stats
  const formattedStatus = data.statusStats.map(item => ({
    name: item._id.toUpperCase(),
    value: item.count
  }));

  // Format leave type stats
  const getFormFriendlyName = (id: string) => {
    switch (id) {
      case 'casual_leave_nrsc': return 'NRSC Casual';
      case 'earned_leave': return 'Earned/Medical';
      case 'casual_leave_rrsc': return 'RRSC-W Casual';
      case 'trainee_biodata': return 'Trainee Bio';
      default: return id;
    }
  };

  const formattedType = data.formTypeStats.map(item => ({
    name: getFormFriendlyName(item._id),
    Count: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F2937]">{data.totalCount}</div>
            <div className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mt-0.5">Total Submissions</div>
          </div>
        </div>

        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F2937]">
              {data.statusStats.find(s => s._id === 'approved')?.count || 0}
            </div>
            <div className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mt-0.5">Approved Applications</div>
          </div>
        </div>

        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F2937]">
              {data.statusStats.find(s => s._id === 'submitted')?.count || 0}
            </div>
            <div className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mt-0.5">Pending Approvals</div>
          </div>
        </div>

        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F2937]">
              {data.topUsers.length}
            </div>
            <div className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mt-0.5">Active Applicants</div>
          </div>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm">
          <h3 className="text-base font-bold text-[#1F2937] mb-6">Applications Received in {new Date().getFullYear()}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedMonthly} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="name" stroke="#829AB1" fontSize={12} />
                <YAxis stroke="#829AB1" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Applications" stroke="#0B5ED7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Type Distribution */}
        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm">
          <h3 className="text-base font-bold text-[#1F2937] mb-6">Distribution by Form Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedType} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis dataKey="name" stroke="#829AB1" fontSize={12} />
                <YAxis stroke="#829AB1" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Count" fill="#0B3C6D" radius={[4, 4, 0, 0]}>
                  {formattedType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown (Pie Chart) */}
        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-[#1F2937] mb-6">Status Breakdown</h3>
          <div className="h-64 flex flex-col justify-center items-center">
            {formattedStatus.length === 0 ? (
              <span className="text-xs text-[#6B7280]">No status data</span>
            ) : (
              <div className="relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formattedStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {formattedStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Labels legend */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#486581]">
                  {formattedStatus.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Active Applicants */}
        <div className="card bg-white p-6 border border-[#D9E2EC] rounded-lg shadow-sm lg:col-span-2 overflow-hidden">
          <h3 className="text-base font-bold text-[#1F2937] mb-6">Top Active Applicants</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-xs font-bold text-[#486581] uppercase tracking-wider">
                  <th className="pb-3">Applicant Name</th>
                  <th className="pb-3">Employee Code</th>
                  <th className="pb-3 text-right">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {data.topUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-xs text-[#6B7280]">No applicant logs yet</td>
                  </tr>
                ) : (
                  data.topUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 font-medium text-[#1F2937]">{user.name}</td>
                      <td className="py-3 font-mono text-[#486581]">{user.employeeCode || '—'}</td>
                      <td className="py-3 text-right font-bold text-[#0B3C6D]">{user.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
