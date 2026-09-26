import React, { useEffect, useRef, useState } from 'react';
import { User, Shield, CheckCircle2, XCircle, AlertTriangle, Fingerprint } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { HonestLabel } from '../common/HonestLabel';
import { api } from '../../services/api';
export const RiderCard: React.FC = () => {
  const {
    rider,
    riderLicenceValid,
    riderFaceVerified,
    setRiderFaceVerified,
    riderAuthType,
    riderType,
    riderSeatOccupied,
    activeRole
  } = useSmartRider();

  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [faceResult, setFaceResult] =
    useState<'IDLE' | 'VERIFIED' | 'MISMATCH'>(
      riderFaceVerified ? 'VERIFIED' : 'IDLE'
    );

  useEffect(() => {
    if (riderFaceVerified) {
      setFaceResult('VERIFIED');
    }
  }, [riderFaceVerified]);
  const [faceSimilarity, setFaceSimilarity] = useState<number | null>(null);
  useEffect(() => {
    // Stop any running camera
    const stream = videoRef.current?.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset previous rider's face verification
    setCameraOpen(false);
    setCapturedImage(null);


    setFaceSimilarity(null);
    setVerifying(false);
  }, [rider.id]);
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });


      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

    } catch (error) {
      console.error('Camera error:', error);
      alert('Camera access failed. Please allow camera permission.');
    }
  };
  const captureFace = async () => {
    const video = videoRef.current;

    if (!video) {
      alert('Camera not ready');
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

    // Capture current camera frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);

    // Stop camera immediately after capture
    const stream = video.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    video.pause();
    video.srcObject = null;
    setCameraOpen(false);

    // Automatically verify captured face
    try {
      setVerifying(true);
      setFaceResult('IDLE');
      setFaceSimilarity(null);

      const response = await fetch(imageData);
      const imageBlob = await response.blob();

      const result = await api.verifyRiderFace(rider.id, imageBlob);

      console.log('Automatic face verification result:', result);

      setFaceSimilarity(result.similarity ?? null);

      if (result.verified) {
        setFaceResult('VERIFIED');
        setRiderFaceVerified(true);
      } else {
        setFaceResult('MISMATCH');
        setRiderFaceVerified(false);
      }
    } catch (error) {
      console.error('Automatic face verification error:', error);

      setFaceSimilarity(null);
      setFaceResult('MISMATCH');
      setRiderFaceVerified(false);
    } finally {
      setVerifying(false);
    }

    console.log('Face captured and verification completed');
  };

  const retryFaceVerification = async () => {
    // Clear previous verification
    setCapturedImage(null);

    setFaceSimilarity(null);

    // Open camera again
    await openCamera();
  };

  const getRiderTypeVariant = () => {
    if (riderType === 'NORMAL') return 'green';
    if (riderType === 'LEARNER') return 'amber';
    return 'red';
  };

  const getAuthVariant = () => {
    if (riderAuthType === 'OWNER' || riderAuthType === 'PERMANENT') return 'green';
    if (riderAuthType === 'TEMPORARY') return 'blue';
    return 'red';
  };

  return (
    <Panel
      title="A. Rider Verification"
      icon={<User className="w-4 h-4" />}
      badge={
        <Badge variant={getRiderTypeVariant()} size="xs">
          {riderType} RIDER
        </Badge>
      }
      variant={
        !riderLicenceValid || faceResult !== 'VERIFIED'
          ? 'red'
          : 'default'
      }
      footer={<HonestLabel type="credential" />}
    >
      <div className="space-y-4">
        {/* Rider Profile Row */}
        <div className="flex items-center gap-3.5 pb-3 border-b dark:border-slate-800/80 border-slate-100">
          <div className="relative">x
            <img
              src={rider.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
              alt={rider.name}
              className="w-12 h-12 rounded object-cover border-2 dark:border-crt-green/40 border-emerald-400 dark:shadow-[0_0_8px_rgba(57,255,136,0.3)]"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 dark:border-[#0F1612] border-white ${riderSeatOccupied ? 'bg-crt-green' : 'bg-crt-red'
                }`}
              title={riderSeatOccupied ? 'Seat Occupied' : 'Seat Empty'}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-semibold text-sm dark:text-white text-slate-900 truncate">
                {rider.name}
              </h4>
              <span className="font-mono text-xs text-slate-400 dark:text-crt-muted">
                ID: {rider.id}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                Lic: {rider.licenceNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Matrix */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">

          {/* Credential RFID Status */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Credential Card
            </div>
            <div className="flex items-center justify-between">
              <Badge variant={riderLicenceValid ? 'green' : 'red'} size="xs" dot={false}>
                {riderLicenceValid ? 'RFID VERIFIED' : 'INVALID / EXPIRED'}
              </Badge>
              {riderLicenceValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-crt-green" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-crt-red" />
              )}
            </div>
          </div>

          {/* Biometric Face Match */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1 flex items-center justify-between">
              <span>Face Match</span>
              <span className="text-[9px] text-crt-green">
                {faceSimilarity !== null
                  ? `${faceSimilarity.toFixed(2)}%`
                  : 'NOT VERIFIED'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant={riderFaceVerified ? 'green' : faceResult === 'MISMATCH' ? 'red' : 'amber'}
                size="xs"
                dot={false}
              >
                {riderFaceVerified
                  ? 'VERIFIED'
                  : faceResult === 'MISMATCH'
                    ? 'MISMATCH'
                    : 'NOT VERIFIED'}

              </Badge>
              <Fingerprint className={`w-3.5 h-3.5 ${riderFaceVerified ? 'text-crt-green' : 'text-crt-red'}`} />
              {!riderFaceVerified && faceResult === 'IDLE' && !cameraOpen && (
                <button
                  type="button"
                  onClick={openCamera}
                  className="w-full mt-2 px-2 py-1 text-[10px] font-mono border border-crt-green text-crt-green rounded"
                >
                  VERIFY FACE
                </button>
              )}

              {cameraOpen && (
                <div className="mt-2">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded border border-crt-green"
                  />

                  <button
                    type="button"
                    onClick={captureFace}
                    className="w-full mt-2 px-2 py-2 text-[10px] font-mono border border-crt-green text-crt-green rounded"
                  >
                    CAPTURE FACE
                  </button>

                  {capturedImage && (
                    <div className="mt-2">
                      <div className="text-[10px] text-crt-green mb-1">
                        FACE CAPTURED
                      </div>

                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full rounded border border-crt-green"
                      />


                    </div>
                  )}
                </div>

              )}
              {faceResult !== 'IDLE' && (
                <div className="mt-2">
                  <div
                    className={`text-center text-[11px] font-mono font-bold ${faceResult === 'VERIFIED'
                      ? 'text-crt-green'
                      : 'text-crt-red'
                      }`}
                  >
                    {faceResult === 'VERIFIED'
                      ? '✓ FACE VERIFIED'
                      : '✕ FACE NOT VERIFIED'}

                    {faceSimilarity !== null && (
                      <div className="text-[10px] mt-1">
                        MATCH SCORE: {faceSimilarity.toFixed(2)}%
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={retryFaceVerification}
                    disabled={verifying}
                    className="w-full mt-2 px-2 py-2 text-[10px] font-mono border border-amber-400 text-amber-400 rounded hover:bg-amber-400/10 disabled:opacity-50"
                  >
                    RETRY FACE
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Vehicle Authorization */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Vehicle Authorization
            </div>
            <Badge
              variant={riderFaceVerified ? getAuthVariant() : 'red'}
              size="xs"
            >
              {riderFaceVerified ? riderAuthType : 'NOT AUTHORIZED'}
            </Badge>
          </div>

          {/* Rider Seat Sensor */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Rider Seat Sensor
            </div>
            <Badge variant={riderSeatOccupied ? 'green' : 'red'} size="xs" pulse={!riderSeatOccupied}>
              {riderSeatOccupied ? 'OCCUPIED' : 'EMPTY / VACANT'}
            </Badge>
          </div>

        </div>

        {/* Status Line */}
        <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-crt-muted border-t dark:border-slate-800/50 border-slate-100">
          <span>Licence Type: <strong className="text-slate-700 dark:text-slate-300">{riderType === 'LEARNER' ? 'Learner (LL)' : 'Permanent (DL)'}</strong></span>
          <span>Access: <strong className="text-slate-700 dark:text-slate-300">{rider.status}</strong></span>
        </div>
      </div>
    </Panel>
  );
};
