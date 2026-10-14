'use client';
import { FormEvent, useState } from 'react';
export default function BoardsClient() {
  const [name, setName] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(''); const response = await fetch('/api/boards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }); const data: { error?: string } = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) { setMessage(data.error || 'Could not create board.'); return; } window.location.reload(); }
  return <form onSubmit={submit} className="panel" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}><div><label htmlFor="board-name">Create a new board</label><input id="board-name" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={80} placeholder="e.g. Our Pune living room" required /></div><button className="btn btn-dark" disabled={busy}>{busy ? 'Creating…' : 'Create board'}</button>{message && <p role="alert" style={{ gridColumn: '1 / -1' }}>{message}</p>}</form>;
}
