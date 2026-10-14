'use client';
import { useState } from 'react';
export default function BoardActions({ boardId, isPublic }: { boardId: string; isPublic: boolean }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function update(method: 'PATCH'|'DELETE', body: Record<string, unknown>) { setBusy(true); setMessage(''); const response = await fetch('/api/boards', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data: { error?: string } = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) { setMessage(data.error || 'Could not update board.'); return; } window.location.reload(); }
  return <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}><button className="btn btn-light" disabled={busy} onClick={()=>update('PATCH',{boardId,isPublic:!isPublic})}>{isPublic?'Stop sharing':'Make shareable'}</button><button className="btn btn-light" disabled={busy} onClick={()=>{if(window.confirm('Delete this board and its saved items?'))void update('DELETE',{boardId});}}>Delete board</button>{message&&<p role="alert">{message}</p>}</div>;
}
