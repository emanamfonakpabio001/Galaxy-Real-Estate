import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Clock, User, ShieldCheck } from 'lucide-react';
import { ActivityLogItem } from '../../types';
import { api } from '../../services/api';

export const ActivityLogManager: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.activity.get(searchTerm || undefined);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Audit Timeline & Activity Logs ({logs.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped historical log of every administrative operation in MongoDB
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D4A84F]" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, user, or details..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D4A84F]"
          />
        </div>
      </div>

      {/* Log Stream Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
            <span className="text-xs font-medium">Loading audit history...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1F3A] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-3">Action</th>
                  <th className="py-3.5 px-3">Performed By</th>
                  <th className="py-3.5 px-3">Details</th>
                  <th className="py-3.5 px-4 text-right">Affected Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{log.date}</div>
                      <div className="text-[10px] text-slate-400">{log.time}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#0B1F3A]">{log.action}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {log.user}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-sm">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {log.affectedItem || 'System'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
