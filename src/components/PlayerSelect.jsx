import { useState } from 'react';
import { PLAYERS } from '../data/players.js';

export default function PlayerSelect({ onStart }) {
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [selecting, setSelecting] = useState(1); // which player is picking

  const handleSelect = (player) => {
    if (selecting === 1) {
      setP1(player);
      setSelecting(2);
    } else {
      if (player.id === p1?.id) return; // can't pick same player
      setP2(player);
    }
  };

  const canStart = p1 && p2;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>HOOPS<span style={styles.titleDot}>.IO</span></h1>
        <p style={styles.subtitle}>Madison Square Garden</p>
      </div>

      <div style={styles.selectionStatus}>
        {!p1 && <span style={styles.prompt}>🏀 Player 1 — Choose your player</span>}
        {p1 && !p2 && <span style={styles.prompt}>🏀 Player 2 — Choose your player</span>}
        {p1 && p2 && <span style={styles.ready}>Ready to play!</span>}
      </div>

      {/* Selected players display */}
      <div style={styles.selectedRow}>
        <SelectedCard label="PLAYER 1" player={p1} color="#3B82F6" onClear={() => { setP1(null); setP2(null); setSelecting(1); }} />
        <div style={styles.vs}>VS</div>
        <SelectedCard label="PLAYER 2" player={p2} color="#EF4444" onClear={() => { setP2(null); setSelecting(2); }} />
      </div>

      {/* Player grid */}
      <div style={styles.grid}>
        {PLAYERS.map((player) => {
          const isP1 = p1?.id === player.id;
          const isP2 = p2?.id === player.id;
          const taken = isP1 || isP2;
          return (
            <PlayerCard
              key={player.id}
              player={player}
              isP1={isP1}
              isP2={isP2}
              disabled={taken && !isP1}
              onClick={() => !taken && handleSelect(player)}
            />
          );
        })}
      </div>

      {canStart && (
        <button style={styles.startBtn} onClick={() => onStart(p1, p2)}>
          TIP OFF! 🏀
        </button>
      )}

      <div style={styles.controls}>
        <span>P1: WASD + SPACE to shoot</span>
        <span style={{ margin: '0 20px' }}>|</span>
        <span>P2: Arrow Keys + ENTER to shoot</span>
      </div>
    </div>
  );
}

function SelectedCard({ label, player, color, onClear }) {
  return (
    <div style={{ ...styles.selectedCard, borderColor: color }}>
      <div style={{ ...styles.selectedLabel, color }}>{label}</div>
      {player ? (
        <>
          <img src={player.image} alt={player.name} style={styles.selectedImg} />
          <div style={styles.selectedName}>{player.name}</div>
          <div style={{ ...styles.selectedTeam, color: '#999' }}>{player.team}</div>
          <button style={{ ...styles.clearBtn, borderColor: color, color }} onClick={onClear}>✕ Change</button>
        </>
      ) : (
        <div style={styles.emptySlot}>Select a player →</div>
      )}
    </div>
  );
}

function PlayerCard({ player, isP1, isP2, disabled, onClick }) {
  const [hovered, setHovered] = useState(false);

  const borderColor = isP1 ? '#3B82F6' : isP2 ? '#EF4444' : hovered ? '#FFC72C' : '#333';
  const opacity = disabled ? 0.4 : 1;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        borderColor,
        opacity,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: hovered && !disabled ? 'scale(1.04)' : 'scale(1)',
        background: isP1 ? 'rgba(59,130,246,0.15)' : isP2 ? 'rgba(239,68,68,0.15)' : '#1a1a2e',
      }}
    >
      <img src={player.image} alt={player.name} style={styles.cardImg} />
      <div style={styles.cardNumber}>#{player.number}</div>
      <div style={styles.cardName}>{player.name}</div>
      <div style={styles.cardTeam}>{player.team}</div>
      <div style={styles.statsRow}>
        <Stat label="SPD" value={player.stats.speed} />
        <Stat label="ACC" value={player.stats.accuracy} />
        <Stat label="PWR" value={player.stats.power} />
      </div>
      {isP1 && <div style={{ ...styles.badge, background: '#3B82F6' }}>P1</div>}
      {isP2 && <div style={{ ...styles.badge, background: '#EF4444' }}>P2</div>}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statBar}>
        <div style={{ ...styles.statFill, width: `${value}%` }} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  title: {
    fontSize: '52px',
    fontWeight: 900,
    margin: 0,
    letterSpacing: '4px',
    color: '#FFC72C',
    textShadow: '0 0 20px rgba(255,199,44,0.5)',
  },
  titleDot: {
    color: '#FF6B35',
  },
  subtitle: {
    color: '#888',
    margin: '4px 0 0',
    fontSize: '14px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  selectionStatus: {
    marginBottom: '14px',
    fontSize: '16px',
    minHeight: '28px',
  },
  prompt: {
    color: '#FFC72C',
    fontWeight: 'bold',
  },
  ready: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  selectedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  selectedCard: {
    width: '160px',
    minHeight: '130px',
    border: '2px solid',
    borderRadius: '12px',
    background: '#111130',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    textAlign: 'center',
  },
  selectedLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '6px',
  },
  selectedImg: {
    width: '90px',
    height: '90px',
    objectFit: 'cover',
    objectPosition: 'top',
    borderRadius: '8px',
    marginBottom: '6px',
  },
  selectedName: { fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' },
  selectedTeam: { fontSize: '10px', marginBottom: '8px' },
  emptySlot: { color: '#555', fontSize: '13px', fontStyle: 'italic' },
  clearBtn: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '11px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  vs: {
    fontSize: '28px',
    fontWeight: 900,
    color: '#FFC72C',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    maxWidth: '900px',
    width: '100%',
    marginBottom: '20px',
  },
  card: {
    border: '2px solid',
    borderRadius: '12px',
    padding: '12px 8px',
    textAlign: 'center',
    transition: 'all 0.15s ease',
    position: 'relative',
    userSelect: 'none',
  },
  cardImg: {
    width: '100%',
    height: '90px',
    objectFit: 'cover',
    objectPosition: 'top',
    borderRadius: '8px',
    marginBottom: '4px',
  },
  cardNumber: { fontSize: '11px', color: '#888', marginBottom: '2px' },
  cardName: { fontSize: '12px', fontWeight: 'bold', marginBottom: '2px', lineHeight: 1.2 },
  cardTeam: { fontSize: '9px', color: '#666', marginBottom: '8px' },
  statsRow: { display: 'flex', flexDirection: 'column', gap: '3px' },
  stat: { display: 'flex', alignItems: 'center', gap: '4px' },
  statLabel: { fontSize: '8px', color: '#888', width: '22px', textAlign: 'right' },
  statBar: { flex: 1, height: '4px', background: '#333', borderRadius: '2px' },
  statFill: { height: '100%', background: '#FFC72C', borderRadius: '2px' },
  badge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '4px',
    padding: '1px 5px',
  },
  startBtn: {
    background: 'linear-gradient(135deg, #FFC72C, #FF6B35)',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 48px',
    fontSize: '22px',
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '2px',
    marginBottom: '16px',
    boxShadow: '0 4px 20px rgba(255,199,44,0.4)',
  },
  controls: {
    color: '#555',
    fontSize: '12px',
  },
};
