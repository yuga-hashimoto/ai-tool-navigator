"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Bot,
  Lock,
  Globe,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";

export function SecurityConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/security/config");
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleToggle = (category: string, field: string) => {
    setConfig((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/security/config", {
        method: "POST",
        body: JSON.stringify(config),
      });
      // Show success notification in real app
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Security Configuration</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Threat Detection */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Threat Detection (IDS)
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Real-time IDS Scanning</p>
                <p className="text-xs text-gray-500">Scan all incoming requests for attack patterns</p>
              </div>
              <button
                onClick={() => handleToggle('ids', 'enabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.ids.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.ids.enabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Auto-block Critical Threats</p>
                <p className="text-xs text-gray-500">Immediately block IPs matching critical attack signatures</p>
              </div>
              <button
                onClick={() => handleToggle('ids', 'blockOnCritical')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.ids.blockOnCritical ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.ids.blockOnCritical ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bot Detection */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Bot & Automation Defense
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Advanced Bot Detection</p>
                <p className="text-xs text-gray-500">Enable behavioral and signature-based bot analysis</p>
              </div>
              <button
                onClick={() => handleToggle('botDetection', 'enabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.botDetection.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.botDetection.enabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Block Severe Bots</p>
                <p className="text-xs text-gray-500">Automatically block scrapers and malicious crawlers</p>
              </div>
              <button
                onClick={() => handleToggle('botDetection', 'blockSevere')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.botDetection.blockSevere ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.botDetection.blockSevere ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Protection */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Data Protection (DLP)
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">PII Detection</p>
                <p className="text-xs text-gray-500">Detect sensitive info in request/response cycles</p>
              </div>
              <button
                onClick={() => handleToggle('dlp', 'enabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.dlp.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.dlp.enabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Auto-mask Sensitive Data</p>
                <p className="text-xs text-gray-500">Mask PII in logs and database entries</p>
              </div>
              <button
                onClick={() => handleToggle('dlp', 'maskPII')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.dlp.maskPII ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.dlp.maskPII ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Network & Edge */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Network & Rate Limiting
          </h4>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-800 block mb-2">Global Rate Limit</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={config.rateLimiting.globalLimit}
                  onChange={(e) => setConfig({...config, rateLimiting: {...config.rateLimiting, globalLimit: parseInt(e.target.value)}})}
                  className="w-24 px-3 py-2 bg-gray-50 border rounded-lg text-sm font-bold"
                />
                <span className="text-xs text-gray-500 font-medium">requests per minute / IP</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Geo-blocking</p>
                <p className="text-xs text-gray-500">Restrict access from high-risk regions</p>
              </div>
              <button className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-orange-800">Security Warning</p>
          <p className="text-xs text-orange-700 mt-1 leading-relaxed">
            Disabling core security features like IDS or Bot Detection can leave your application vulnerable to automated attacks.
            Ensure you have alternative protection at the infrastructure level (e.g., Cloudflare WAF) before making changes.
          </p>
        </div>
      </div>
    </div>
  );
}
