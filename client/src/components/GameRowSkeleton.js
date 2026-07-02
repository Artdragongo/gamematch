import React from 'react';

/**
 * Skeleton placeholder shown ONLY on a true first-ever visit
 * (no cache available yet, server still cold-starting).
 * Prevents the "blank page for 15 seconds" feeling.
 */
export default function GameRowSkeleton() {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div className="section-header">
        <div style={{ width: 140, height: 18, background: 'var(--surface2)', borderRadius: 4 }} />
        <div style={{ width: 70, height: 14, background: 'var(--surface2)', borderRadius: 4 }} />
      </div>
      <div className="card-row">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="game-card" style={{ cursor: 'default' }}>
            <div className="gc-img" style={{ aspectRatio: '16/7', background: 'var(--surface2)' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, var(--surface2) 0%, var(--surface3) 50%, var(--surface2) 100%)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.4s ease-in-out infinite',
              }} />
            </div>
            <div style={{ padding: '0.85rem 1rem' }}>
              <div style={{ width: '75%', height: 14, background: 'var(--surface2)', borderRadius: 4, marginBottom: '0.5rem' }} />
              <div style={{ width: '45%', height: 11, background: 'var(--surface2)', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}
