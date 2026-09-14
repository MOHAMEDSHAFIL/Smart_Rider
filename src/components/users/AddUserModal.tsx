import React, { useState } from 'react';
import { Camera, Check, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Modal } from '../common/Modal';
import { RiderType, VehicleAuthType } from '../../types';
import { sounds } from '../../utils/audio';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useSmartRider();

  const [name, setName] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [riderType, setRiderType] = useState<RiderType>('NORMAL');
  const [authType, setAuthType] = useState<VehicleAuthType>('PERMANENT');
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleCaptureFace = () => {
    sounds.playClick(900);
    // Simulate camera biometric capture
    setFaceRegistered(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a user name.');
      return;
    }
    if (!licenceNumber.trim()) {
      setError('Please enter a licence credential number.');
      return;
    }
    if (!faceRegistered) {
      setError('Please complete the biometric face registration capture step.');
      return;
    }
    if (!ownerConfirmed) {
      setError('Owner authorization confirmation is mandatory.');
      return;
    }

    addUser({
      name,
      licenceNumber,
      riderType,
      authType,
      licenceStatus: 'VALID',
      status: 'ACTIVE',
      avatarUrl: `https://images.unsplash.com/photo-${riderType === 'LEARNER' ? '1539571696357-5a69c17a67c6' : '1506794778202-cad84cf45f1d'}?w=150&auto=format&fit=crop&q=80`
    });

    // Reset
    setName('');
    setLicenceNumber('');
    setRiderType('NORMAL');
    setAuthType('PERMANENT');
    setFaceRegistered(false);
    setOwnerConfirmed(false);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Authorized Permanent User"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              sounds.playClick(400);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded border border-slate-700/50 text-slate-400 hover:text-white text-xs font-mono"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded bg-crt-green hover:bg-emerald-400 text-crt-dark font-mono font-bold text-xs shadow-[0_0_10px_rgba(57,255,136,0.3)] transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Register</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {error && (
          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* User Name */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
            Full Driver Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rohit Varma"
            className="w-full px-3 py-2 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:border-crt-green"
          />
        </div>

        {/* Licence / Credential ID */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
            Licence / Credential ID Number
          </label>
          <input
            type="text"
            value={licenceNumber}
            onChange={e => setLicenceNumber(e.target.value)}
            placeholder="e.g. DL-04202400999"
            className="w-full px-3 py-2 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:border-crt-green"
          />
        </div>

        {/* Rider Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
              Rider Classification
            </label>
            <select
              value={riderType}
              onChange={e => setRiderType(e.target.value as RiderType)}
              className="w-full px-3 py-2 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:border-crt-green"
            >
              <option value="NORMAL">Normal (Full Licence)</option>
              <option value="LEARNER">Learner (Supervision Required)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
              Authorization Type
            </label>
            <select
              value={authType}
              onChange={e => setAuthType(e.target.value as VehicleAuthType)}
              className="w-full px-3 py-2 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:border-crt-green"
            >
              <option value="PERMANENT">Permanent Authorized</option>
              <option value="TEMPORARY">Temporary Pass (24h)</option>
            </select>
          </div>
        </div>

        {/* Face Registration Step */}
        <div className="p-3 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-crt-green" />
              <span>Biometric Face Template Registration</span>
            </span>
            <span className={faceRegistered ? 'text-crt-green' : 'text-slate-500'}>
              {faceRegistered ? 'Captured' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCaptureFace}
              className={`px-3 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
                faceRegistered
                  ? 'border-crt-green text-crt-green bg-crt-green/10'
                  : 'border-slate-700 text-slate-300 hover:border-crt-green/50'
              }`}
            >
              {faceRegistered ? <Check className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{faceRegistered ? 'Biometric Vector Enrolled (128-d)' : 'Simulate Camera Face Capture'}</span>
            </button>
          </div>
        </div>

        {/* Owner Confirmation Step */}
        <div className="p-3 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ownerConfirmed}
              onChange={e => setOwnerConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-crt-green focus:ring-crt-green"
            />
            <span className="text-slate-400 leading-snug">
              I, as the Registered Vehicle Owner, grant cryptographic authorization for this user to operate unit <strong>V001</strong> within the configured policy rules.
            </span>
          </label>
        </div>

      </form>
    </Modal>
  );
};
