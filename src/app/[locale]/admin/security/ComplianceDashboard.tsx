"use client";

import { useState, useEffect } from "react";
import {
  FileCheck,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History
} from "lucide-react";

export function ComplianceDashboard() {
  const [compliance, setCompliance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        const response = await fetch("/api/security/compliance");
        const data = await response.json();
        setCompliance(Array.isArray(data.status) ? data.status : []);
      } catch (error) {
        console.error("Failed to fetch compliance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompliance();
  }, []);

  return (
    <div className="space-y-8">
      {/* Framework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
           <div className="col-span-full py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : compliance.map((framework, i) => (
          <div key={i} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{framework.framework}</h3>
                <p className="text-sm text-gray-500 mt-1">Status:
                  <span className={`ml-1 font-bold ${
                    framework.status === 'compliant' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {framework.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{framework.score}%</p>
                <p className="text-xs text-gray-400 font-medium">Readiness Score</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Controls</h4>
              <div className="space-y-3">
                {framework.checks.map((check: any) => (
                  <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                      {check.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : check.status === 'manual' ? (
                        <Calendar className="w-4 h-4 text-blue-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">{check.name}</p>
                        <p className="text-[10px] text-gray-500">{check.description}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      check.status === 'passed' ? 'bg-green-100 text-green-700' :
                      check.status === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
                <button className="p-2.5 border rounded-lg hover:bg-gray-50 text-gray-500" title="View Details">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Logs / History */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Compliance Audit History
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View Full History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Framework</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm font-medium">
              {[
                { event: "Internal SOC 2 Audit", framework: "SOC 2", user: "Security Lead", date: "2024-03-15", result: "Passed" },
                { event: "GDPR Data Processing Review", framework: "GDPR", user: "Privacy Officer", date: "2024-03-10", result: "Passed" },
                { event: "PCI DSS Scan", framework: "PCI DSS", user: "System", date: "2024-03-01", result: "Passed" },
              ].map((audit, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{audit.event}</td>
                  <td className="px-6 py-4">{audit.framework}</td>
                  <td className="px-6 py-4 text-gray-500">{audit.user}</td>
                  <td className="px-6 py-4 text-gray-500">{audit.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {audit.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
