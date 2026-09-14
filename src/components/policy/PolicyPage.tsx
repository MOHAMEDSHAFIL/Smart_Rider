import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Cpu, 
  Gauge, 
  Route, 
  Clock, 
  ShieldCheck, 
  Lock,
  Eye
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { HonestLabel } from '../common/HonestLabel';
import { sounds } from '../../utils/audio';

export const PolicyPage: React.FC = () => {
  const { policy, updatePolicy, resetPolicy, activeRole } = useSmartRider();

  const [form, setForm] = useState(policy);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    updatePolicy(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    sounds.playClick(500);
    resetPolicy();
    setForm(policy);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (activeRole !== 'OWNER_ADMIN') {
    return (
      <Panel title="Policy Settings Access Restricted" icon={<Lock className="w-4 h-4 text-rose-500" />}>
        <div className="py-8 text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-rose-500" />
          <h3 className="font-semibold text-sm">Access Denied</h3>
          <p className="text-xs font-mono text-slate-400">
            Policy modification requires Vehicle Owner / Administrator privileges. Please switch role in top bar.
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-4 rounded-lg dark:bg-[#0C1511] bg-white panel-border flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold dark:text-white text-slate-900 font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-crt-green" />
            <span>Vehicle Governor & Supervision Policy Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-tune speed governing, electronic distance limits, and biometric re-verification timeouts.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-crt-green text-xs font-mono border border-crt-green/40 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Policy Saved</span>
          </div>
        )}
      </div>

      <HonestLabel type="policy" />

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Section 1: Distance & Geo-Fence Limits */}
        <Panel
          title="1. Distance Quota & Range Constraints"
          icon={<Route className="w-4 h-4" />}
          footer={<HonestLabel type="policy" />}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Learner Mode Distance Limit (km)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={form.learnerDistanceLimitKm}
                    onChange={e => setForm({ ...form, learnerDistanceLimitKm: parseFloat(e.target.value) })}
                    className="flex-1 accent-crt-green"
                  />
                  <div className="w-20 px-2 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 text-center font-bold text-crt-green">
                    {form.learnerDistanceLimitKm.toFixed(1)} km
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Enforces vehicle shutdown when cumulative test distance is reached.
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Session Expiry / Inactivity Timeout (Minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={form.sessionExpiryDurationMinutes}
                    onChange={e => setForm({ ...form, sessionExpiryDurationMinutes: parseInt(e.target.value) })}
                    className="flex-1 accent-crt-green"
                  />
                  <div className="w-20 px-2 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 text-center font-bold text-crt-blue">
                    {form.sessionExpiryDurationMinutes} min
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Auto-terminates active token if vehicle is parked and unattended.
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Section 2: Speed Governing Profile */}
        <Panel
          title="2. Restricted Speed Profile (PWM & Velocity)"
          icon={<Gauge className="w-4 h-4" />}
          footer={<HonestLabel type="policy" />}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Restricted Speed PWM Throttle Cap (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={form.restrictedSpeedPwm}
                    onChange={e => setForm({ ...form, restrictedSpeedPwm: parseInt(e.target.value) })}
                    className="flex-1 accent-amber-400"
                  />
                  <div className="w-20 px-2 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 text-center font-bold text-crt-amber">
                    {form.restrictedSpeedPwm}% PWM
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Microcontroller PWM duty-cycle clamped to this threshold in Learning Mode.
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Max Governed Speed Target (km/h)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="40"
                    step="1"
                    value={form.restrictedSpeedMaxKmH}
                    onChange={e => setForm({ ...form, restrictedSpeedMaxKmH: parseInt(e.target.value) })}
                    className="flex-1 accent-amber-400"
                  />
                  <div className="w-20 px-2 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 text-center font-bold text-crt-amber">
                    {form.restrictedSpeedMaxKmH} km/h
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Software speed limiter limit before progressive regenerative braking / cut.
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Section 3: Escort & Re-verification Triggers */}
        <Panel
          title="3. Supervision & Biometric Re-Verification Rules"
          icon={<Eye className="w-4 h-4" />}
          footer={<HonestLabel type="policy" />}
        >
          <div className="space-y-3 font-mono text-xs">
            
            {/* Escort requirement toggle */}
            <label className="flex items-center justify-between p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Mandatory Escort Requirement for Learners</div>
                <div className="text-[10px] text-slate-400">If enabled, motor cannot be engaged by a learner without verified pillion escort.</div>
              </div>
              <input
                type="checkbox"
                checked={form.escortRequirementEnabled}
                onChange={e => setForm({ ...form, escortRequirementEnabled: e.target.checked })}
                className="w-4 h-4 text-crt-green rounded border-slate-700 focus:ring-crt-green"
              />
            </label>

            {/* Seat lift trigger */}
            <label className="flex items-center justify-between p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Trigger Re-Verification on Seat Pressure Loss</div>
                <div className="text-[10px] text-slate-400">Demands biometric re-auth if rider or escort leaves seat for &gt; 3 seconds.</div>
              </div>
              <input
                type="checkbox"
                checked={form.reverificationTriggerSeatLift}
                onChange={e => setForm({ ...form, reverificationTriggerSeatLift: e.target.checked })}
                className="w-4 h-4 text-crt-green rounded border-slate-700 focus:ring-crt-green"
              />
            </label>

            {/* Face loss trigger */}
            <label className="flex items-center justify-between p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Continuous Camera Biometric Tracking</div>
                <div className="text-[10px] text-slate-400">Flags supervision warnings if rider face vector is obscured or out of camera FOV.</div>
              </div>
              <input
                type="checkbox"
                checked={form.reverificationTriggerFaceLoss}
                onChange={e => setForm({ ...form, reverificationTriggerFaceLoss: e.target.checked })}
                className="w-4 h-4 text-crt-green rounded border-slate-700 focus:ring-crt-green"
              />
            </label>

            {/* Periodic interval */}
            <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <label className="block text-slate-300 font-semibold mb-1">
                Periodic Supervision Ping Interval (Seconds)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={form.reverificationIntervalSeconds}
                  onChange={e => setForm({ ...form, reverificationIntervalSeconds: parseInt(e.target.value) })}
                  className="flex-1 accent-crt-blue"
                />
                <div className="w-20 px-2 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 text-center font-bold text-crt-blue">
                  {form.reverificationIntervalSeconds}s
                </div>
              </div>
            </div>

          </div>
        </Panel>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded border dark:border-slate-700 border-slate-300 text-slate-400 hover:text-white font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to PoC Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2 rounded bg-crt-green hover:bg-emerald-400 text-crt-dark font-mono font-bold text-xs shadow-[0_0_12px_rgba(57,255,136,0.3)] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save & Deploy Policy</span>
          </button>
        </div>

      </form>

    </div>
  );
};
