'use client';
import { useState } from 'react';
export default function BoardItemActions({ boardId, designId }: { boardId: string; designId: string }) {
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 async function remove(){setBusy(true);setMessage('');const response=await fetch('/api/boards',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({boardId,designId})});const data:{error?:string}=await response.json().catch(()=>({}));setBusy(false);if(!response.ok){setMessage(data.error||'Could not remove item.');return;}window.location.reload();}
 return <div><button className="text-button" disabled={busy} onClick={remove}>{busy?'Removing…':'Remove from board'}</button>{message&&<p role="alert">{message}</p>}</div>;
}
