import React, { useRef, useState } from 'react';
import { Users, CheckCircle2, XCircle, AlertTriangle, UserCheck, ShieldOff } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { HonestLabel } from '../common/HonestLabel';
import { api } from '../../services/api';

export const EscortCard: React.FC = () => {
  const {
    riderType,
    escort,
    escortLicenceValid,
    escortFaceVerified,
    setEscortFaceVerified,
    escortEligible,
    pillionSeatOccupied,
    supervisionStatus
  } = useSmartRider();
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [escortFaceResult, setEscortFaceResult] =
    useState<'IDLE' | 'VERIFIED' | 'MISMATCH'>(
      escortFaceVerified ? 'VERIFIED' : 'IDLE'
    );
  const [escortFaceSimilarity, setEscortFaceSimilarity] =
    useState<number | null>(null);
  const openEscortCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

    } catch (error) {
      console.error('Escort camera error:', error);
      alert('Unable to access camera');
    }
  };
  const captureEscortFace = async () => {
    const video = videoRef.current;

    if (!video || !escort) {
      alert('Camera or escort data not ready');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert('Unable to capture image');
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    const stream = video.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    video.pause();
    video.srcObject = null;
    setCameraOpen(false);
    try {
      setVerifying(true);
      setEscortFaceResult('IDLE');
      setEscortFaceSimilarity(null);

      const response = await fetch(imageData);
      const imageBlob = await response.blob();

      const result = await api.verifyRiderFace(escort.id, imageBlob);

      console.log('Escort face verification result:', result);

      setEscortFaceSimilarity(result.similarity ?? null);
      if (result.verified) {
        setEscortFaceResult('VERIFIED');
        setEscortFaceVerified(true);
      } else {
        setEscortFaceResult('MISMATCH');
        setEscortFaceVerified(false);
      }

    } catch (error) {
      console.error('Escort face verification error:', error);
      setEscortFaceResult('MISMATCH');
      setEscortFaceVerified(false);
    } finally {
      setVerifying(false);
    }
  };
  const isNormalRider = riderType === 'NORMAL';
  const isPendingVerification = riderType === 'INVALID';

  const getSupervisionVariant = () => {
    if (isNormalRider) return 'muted';
    if (supervisionStatus === 'ACTIVE') return 'green';
    if (supervisionStatus === 'WARNING') return 'amber';
    return 'red';
  };
  if (isPendingVerification) {
    return (
      <Panel
        title="B. Escort Verification"
        icon={<Users className="w-4 h-4" />}
        badge={
          <Badge variant="muted" size="xs">
            WAITING FOR RIDER
          </Badge>
        }
      >
        <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500">
          Complete rider verification to determine whether escort supervision is required.
        </div>
      </Panel>
    );
  }
  return (
    <Panel
      title="B. Escort Verification"
      icon={<Users className="w-4 h-4" />}
      badge={
        isNormalRider ? (
          <Badge variant="muted" size="xs" dot={false}>
            NOT REQUIRED (FULL DL)
          </Badge>
        ) : (
          <Badge variant={getSupervisionVariant()} size="xs" pulse={supervisionStatus === 'LOST' || supervisionStatus === 'WARNING'}>
            SUPERVISION: {supervisionStatus}
          </Badge>
        )
      }
      variant={
        isNormalRider
          ? 'muted'
          : supervisionStatus === 'LOST'
            ? 'red'
            : supervisionStatus === 'WARNING'
              ? 'amber'
              : 'default'
      }
      disabled={isNormalRider}
      footer={
        isNormalRider ? (
          <div className="text-[11px] font-mono text-slate-400">
            Escort supervision bypassed for non-learner driving credentials.
          </div>
        ) : (
          <HonestLabel type="credential" />
        )
      }
    >
      {isNormalRider ? (
        <div className="py-8 text-center space-y-2">
          <ShieldOff className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Normal Rider Authenticated — Pillion Escort Supervision Inactive.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Escort Profile Info */}
          <div className="flex items-center gap-3.5 pb-3 border-b dark:border-slate-800/80 border-slate-100">
            <div className="relative">
              <img
                src={escort?.avatarUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}
                alt={escort?.name || 'Escort'}
                className="w-12 h-12 rounded object-cover border-2 dark:border-crt-amber/40 border-amber-400 dark:shadow-[0_0_8px_rgba(255,176,32,0.3)]"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 dark:border-[#0F1612] border-white ${pillionSeatOccupied ? 'bg-crt-green' : 'bg-crt-red'
                  }`}
                title={pillionSeatOccupied ? 'Pillion Present' : 'Pillion Absent'}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-semibold text-sm dark:text-white text-slate-900 truncate">
                  {escort ? escort.name : 'No Escort Assigned'}
                </h4>
                <span className="font-mono text-xs text-slate-400 dark:text-crt-muted">
                  ID: {escort?.id || '---'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                  Lic: {escort?.licenceNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Status Matrix */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            {/* Licence Status */}
            <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
              <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
                Licence Validity
              </div>
              <Badge variant={escortLicenceValid ? 'green' : 'red'} size="xs">
                {escortLicenceValid ? 'VALID PERMANENT' : 'INVALID'}
              </Badge>
            </div>

            {/* Face Verification */}
            <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
              <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
                Face Verification
              </div>
              <Badge variant={escortFaceVerified ? 'green' : 'amber'} size="xs">
                {escortFaceVerified ? 'MATCH VERIFIED' : 'NOT VERIFIED'}
              </Badge>
              {!escortFaceVerified && (
                <button
                  onClick={() => {
                    setEscortFaceResult('IDLE');
                    setEscortFaceSimilarity(null);
                    setCapturedImage(null);
                    openEscortCamera();
                  }}
                  className="mt-2 px-3 py-1.5 text-xs font-bold border border-amber-500 text-amber-400 rounded hover:bg-amber-500/10"
                >
                  VERIFY ESCORT FACE
                </button>
              )}
              {cameraOpen && (
                <div className="mt-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded border border-green-500"
                  />

                  <button
                    type="button"
                    onClick={captureEscortFace}
                    disabled={verifying}
                    className="mt-2 w-full px-3 py-2 text-xs font-bold border border-green-500 text-green-400 rounded hover:bg-green-500/10 disabled:opacity-50"
                  >
                    {verifying ? 'VERIFYING...' : 'CAPTURE & VERIFY'}
                  </button>
                </div>
              )}
              {escortFaceResult !== 'IDLE' && (
                <div className="mt-2">
                  <div
                    className={`text-center text-[11px] font-mono font-bold ${escortFaceResult === 'VERIFIED'
                      ? 'text-crt-green'
                      : 'text-crt-red'
                      }`}
                  >
                    {escortFaceResult === 'VERIFIED'
                      ? '✓ ESCORT FACE VERIFIED'
                      : '✕ ESCORT FACE MISMATCH'}

                    {escortFaceSimilarity !== null && (
                      <div className="text-[10px] mt-1">
                        MATCH SCORE: {escortFaceSimilarity.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  {escortFaceResult === 'MISMATCH' && (
                    <button
                      type="button"
                      onClick={openEscortCamera}
                      disabled={verifying}
                      className="w-full mt-2 px-2 py-2 text-[10px] font-mono border border-amber-400 text-amber-400 rounded hover:bg-amber-400/10 disabled:opacity-50"
                    >
                      RETRY ESCORT FACE
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Eligibility */}
            <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
              <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
                Supervision Eligibility
              </div>
              <Badge variant={escortEligible ? 'green' : 'red'} size="xs">
                {escortEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
              </Badge>
            </div>

            {/* Pillion Seat Sensor */}
            <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
              <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
                Pillion Presence
              </div>
              <Badge
                variant={pillionSeatOccupied ? 'green' : 'red'}
                size="xs"
                pulse={!pillionSeatOccupied}
              >
                {pillionSeatOccupied ? 'PRESENT' : 'SEAT VACANT'}
              </Badge>
            </div>
          </div>

          {/* Supervision status alert banner if lost */}
          {supervisionStatus === 'LOST' && (
            <div className="p-2 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>Supervision lost! Learner vehicle locked into Safe Crawl Mode.</span>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};
