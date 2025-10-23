import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, RefreshCw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

function ScanPage() {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let html5Qrcode;
    let isMounted = true;

    const startScanner = async () => {
      try {
        setError('');
        const id = 'qr-reader';
        if (!scannerRef.current) return;
        if (!document.getElementById(id)) {
          const div = document.createElement('div');
          div.id = id;
          scannerRef.current.appendChild(div);
        }

        html5Qrcode = new Html5Qrcode(id);
        setIsReady(true);

        await html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            try {
              // Expect URL like http://.../menu/:restaurantId
              const url = new URL(decodedText);
              const match = url.pathname.match(/\/menu\/([^/]+)/);
              if (match && match[1]) {
                window.location.href = `/menu/${match[1]}`;
              } else {
                setError('Geçersiz QR kodu. Menü bağlantısı bulunamadı.');
              }
            } catch (_) {
              setError('Geçersiz QR kodu.');
            }
          },
          (scanError) => {
            // Ignore continuous scan errors
          }
        );
      } catch (e) {
        if (!isMounted) return;
        setError('Kamera başlatılamadı. Kamera izinlerini kontrol edin.');
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      try {
        if (html5Qrcode) {
          html5Qrcode.stop().catch(() => {});
          html5Qrcode.clear().catch(() => {});
        }
      } catch (_) {}
    };
  }, []);

  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <QrCode size={28} /> QR ile Menü Aç
      </h1>
      <p>Masadaki QR kodu kameraya gösterin. Doğrudan menü sayfasına yönlendirilirsiniz.</p>

      <div ref={scannerRef} style={{ maxWidth: 420 }} />

      {!isReady && (
        <div style={{ marginTop: 20 }}>Hazırlanıyor...</div>
      )}
      {error && (
        <div style={{ marginTop: 12, color: '#d63031' }}>{error}</div>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => window.location.reload()}
        style={{ marginTop: 20 }}
      >
        <RefreshCw size={16} /> Yenile
      </button>
    </div>
  );
}

export default ScanPage;




