export default function GameOver({ score, player1, player2, onRematch, onMenu }) {
  const p1Score = score[1];
  const p2Score = score[2];
  const tied = p1Score === p2Score;
  const winner = tied ? null : p1Score > p2Score ? player1 : player2;
  const loser = tied ? null : p1Score > p2Score ? player2 : player1;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>GAME OVER</div>

        {tied ? (
          <div style={styles.tieText}>🤝 It's a Tie!</div>
        ) : (
          <>
            <div style={styles.winnerEmoji}>{winner.emoji}</div>
            <div style={styles.winnerText}>
              {winner.name}
              <span style={styles.wins}> WINS!</span>
            </div>
            <div style={styles.winnerTeam}>{winner.team}</div>
          </>
        )}

        {/* Scoreboard */}
        <div style={styles.scoreboard}>
          <ScoreRow player={player1} score={p1Score} label="P1" highlight={winner?.id === player1.id} />
          <div style={styles.dash}>—</div>
          <ScoreRow player={player2} score={p2Score} label="P2" highlight={winner?.id === player2.id} right />
        </div>

        <div style={styles.buttons}>
          <button style={styles.rematchBtn} onClick={onRematch}>🔄 Rematch</button>
          <button style={styles.menuBtn} onClick={onMenu}>🏠 Main Menu</button>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ player, score, label, highlight, right }) {
  return (
    <div style={{ ...styles.scoreRow, flexDirection: right ? 'row-reverse' : 'row' }}>
      <div style={styles.scoreLabel}>{label}</div>
      <div style={styles.scoreEmoji}>{player.emoji}</div>
      <div>
        <div style={{ ...styles.scoreName, textAlign: right ? 'right' : 'left' }}>{player.name}</div>
      </div>
      <div style={{ ...styles.scoreNum, color: highlight ? '#FFC72C' : '#fff' }}>{score}</div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
  },
  card: {
    background: '#111130',
    border: '2px solid #FFC72C',
    borderRadius: '20px',
    padding: '40px 60px',
    textAlign: 'center',
    boxShadow: '0 0 60px rgba(255,199,44,0.3)',
    minWidth: '420px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 900,
    letterSpacing: '6px',
    color: '#FFC72C',
    marginBottom: '20px',
  },
  tieText: {
    fontSize: '28px',
    marginBottom: '16px',
  },
  winnerEmoji: {
    fontSize: '56px',
    marginBottom: '8px',
  },
  winnerText: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  wins: {
    color: '#FFC72C',
  },
  winnerTeam: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '24px',
  },
  scoreboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    padding: '16px 24px',
    margin: '20px 0',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  scoreLabel: {
    fontSize: '11px',
    color: '#888',
    letterSpacing: '1px',
  },
  scoreEmoji: { fontSize: '24px' },
  scoreName: { fontSize: '13px', fontWeight: 'bold' },
  scoreNum: {
    fontSize: '40px',
    fontWeight: 900,
    minWidth: '50px',
  },
  dash: {
    fontSize: '28px',
    color: '#555',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '8px',
  },
  rematchBtn: {
    background: 'linear-gradient(135deg, #FFC72C, #FF6B35)',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  menuBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #444',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};
