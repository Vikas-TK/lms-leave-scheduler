import { useState } from 'react';
import PaperShatter from './PaperShatter';
import './PaperShatter.css';

export default function PaperShatterDemo() {
  const [pieces, setPieces] = useState(300);
  const [gravity, setGravity] = useState(0.5);
  const [wind, setWind] = useState(0.2);
  const [paperColor, setPaperColor] = useState('#F6F2E8');
  const [rebuild, setRebuild] = useState(true);
  const [transparent, setTransparent] = useState(true);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#09090b', overflow: 'hidden' }}>
      {/* Background Interactive WebGL PaperShatter Canvas */}
      <PaperShatter
        pieces={pieces}
        gravity={gravity}
        wind={wind}
        paperColor={paperColor}
        rebuild={rebuild}
        transparent={transparent}
        rebuildDelay={4000}
        mouseInteraction={true}
      />

      {/* Control Panel Overlay */}
      <div style={{
        position: 'absolute',
        top: 24,
        right: 24,
        width: 320,
        background: 'rgba(18, 18, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 18,
        padding: 20,
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        zIndex: 10
      }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>📄 PaperShatter</h2>
        <p style={{ margin: '0 0 16px', color: '#a1a1aa', fontSize: 12 }}>
          Click anywhere or hover to tear and shatter paper fragments.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#d4d4d8', marginBottom: 4 }}>
            <span>Pieces (Voronoi Cells)</span>
            <strong>{pieces}</strong>
          </label>
          <input
            type="range"
            min={100}
            max={500}
            step={50}
            value={pieces}
            onChange={(e) => setPieces(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#d4d4d8', marginBottom: 4 }}>
            <span>Gravity</span>
            <strong>{gravity}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.1}
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#d4d4d8', marginBottom: 4 }}>
            <span>Wind Turbulence</span>
            <strong>{wind}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={wind}
            onChange={(e) => setWind(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#d4d4d8', marginBottom: 4 }}>
            <span>Paper Color</span>
            <strong>{paperColor}</strong>
          </label>
          <input
            type="color"
            value={paperColor}
            onChange={(e) => setPaperColor(e.target.value)}
            style={{ width: '100%', height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#d4d4d8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rebuild}
              onChange={(e) => setRebuild(e.target.checked)}
            />
            Auto Rebuild
          </label>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#d4d4d8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
            />
            Transparent
          </label>
        </div>
      </div>
    </div>
  );
}
