"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  Key,
  Lock,
  Smartphone,
  UserPlus,
  MoreVertical,
  Mail,
  CheckCircle2
} from "lucide-react";

export function AccessManager() {
  const [users] = useState([
    { id: 1, name: "Admin User", email: "admin@example.com", role: "ADMIN", mfa: true, status: "Active" },
    { id: 2, name: "Security Officer", email: "security@example.com", role: "SECURITY_OFFICER", mfa: true, status: "Active" },
    { id: 3, name: "Support Lead", email: "support@example.com", role: "MODERATOR", mfa: false, status: "Active" },
  ]);

  return (
    <div className="space-y-8">
      {/* Access Control Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Admin Users</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">MFA Adoption</p>
            <p className="text-2xl font-bold text-gray-900">92%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Key className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">SSO Integrations</p>
            <p className="text-2xl font-bold text-gray-900">3 Active</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">User Permissions</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Security</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider border">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className={`w-4 h-4 ${user.mfa ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={`text-xs font-medium ${user.mfa ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.mfa ? 'MFA Enabled' : 'MFA Required'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Password Policy
          </h3>
          <div className="space-y-4">
            {[
              { label: "Minimum length", value: "12 characters", enabled: true },
              { label: "Require special characters", value: "Enabled", enabled: true },
              { label: "Password expiration", value: "90 days", enabled: true },
              { label: "Prevent reuse", value: "Last 5 passwords", enabled: true },
            ].map((policy, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm font-medium text-gray-700">{policy.label}</span>
                <span className="text-sm font-bold text-gray-900">{policy.value}</span>
              </div>
            ))}
            <button className="w-full py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-2">
              Edit Policy
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Session Management
          </h3>
          <div className="space-y-4">
            {[
              { label: "Idle timeout", value: "30 minutes", enabled: true },
              { label: "Absolute timeout", value: "24 hours", enabled: true },
              { label: "Concurrent sessions", value: "Limited to 3", enabled: true },
              { label: "Device fingerprinting", value: "Enabled", enabled: true },
            ].map((policy, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm font-medium text-gray-700">{policy.label}</span>
                <span className="text-sm font-bold text-gray-900">{policy.value}</span>
              </div>
            ))}
            <button className="w-full py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-2">
              Edit Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
