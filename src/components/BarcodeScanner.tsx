import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, AlertCircle } from 'lucide-react';
import { playScanBeep } from '../services/audioEffects';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  isScanningActive?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      const cleanCode = decodedText.trim();

      if (lastScannedRef.current.code === cleanCode && now - lastScannedRef.current.time < 2500) {
        return;
      }

      lastScannedRef.current = { code: cleanCode, time: now };
      playScanBeep();
      onScan(cleanCode);
    },
    [onScan]
  );

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameraError('No camera found on this device');
        }
      })
      .catch((err) => {
        setCameraError('Camera access permission denied or unavailable');
        console.warn('Camera error:', err);
      });
  }, []);

  const startScanner = async () => {
    if (!selectedCameraId) return;

    try {
      setCameraError(null);
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('barcode-reader-view', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      }

      await html5QrCodeRef.current.start(
        selectedCameraId,
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.3333,
        },
        handleScanSuccess,
        () => {}
      );

      setScannerStarted(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setCameraError(err?.message || 'Could not access the camera');
      setScannerStarted(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scannerStarted) {
      try {
        await html5QrCodeRef.current.stop();
        setScannerStarted(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, []);

  // Global Hardware Barcode Reader listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const currentTime = Date.now();
      const charDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const scannedCode = buffer.trim();
          buffer = '';
          playScanBeep();
          onScan(scannedCode);
        }
        buffer = '';
        return;
      }

      if (charDiff > 80) {
        buffer = '';
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);

  return (
    <div className="glass-card" style={{ padding: '20px', overflow: 'hidden', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
            }}
          >
            <Camera size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Camera Barcode Scanner</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '1px 0 0' }}>Supports 1D Barcodes & QR Codes on confirmation emails</p>
          </div>
        </div>

        {cameras.length > 1 && (
          <select
            value={selectedCameraId}
            onChange={(e) => {
              setSelectedCameraId(e.target.value);
              if (scannerStarted) {
                stopScanner().then(() => {
                  setTimeout(startScanner, 200);
                });
              }
            }}
            className="input-control"
            style={{ width: 'auto', padding: '6px 28px 6px 12px', fontSize: '12px' }}
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || `Camera ${c.id.slice(0, 4)}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Camera Viewport Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '260px',
          background: '#0f172a',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div id="barcode-reader-view" style={{ width: '100%' }} />

        {scannerStarted && <div className="laser-line" />}

        {!scannerStarted && !cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                marginBottom: '14px',
              }}
            >
              <Camera size={28} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              Camera Scanner is Ready
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px', marginBottom: '18px' }}>
              Click Start to activate webcam or plug in a USB handheld barcode reader
            </p>
            <button onClick={startScanner} className="btn btn-primary">
              <Camera size={16} />
              <span>Start Camera Scanner</span>
            </button>
          </div>
        )}

        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={32} color="#e11d48" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', color: '#e11d48', fontWeight: '600', marginBottom: '12px' }}>
              {cameraError}
            </p>
            <button onClick={startScanner} className="btn btn-secondary" style={{ fontSize: '12px' }}>
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#059669',
            }}
          />
          <span style={{ fontSize: '12px', color: '#475569' }}>
            Hardware USB scanner detection <strong style={{ color: '#047857' }}>Active</strong>
          </span>
        </div>

        {scannerStarted && (
          <button
            onClick={stopScanner}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <CameraOff size={14} />
            <span>Stop Camera</span>
          </button>
        )}
      </div>
    </div>
  );
};
