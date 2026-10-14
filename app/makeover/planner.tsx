'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

const styles = [
  { id: 'warm-modern', name: 'Warm modern', description: 'Natural wood, soft curves and cosy neutral layers.', colors: ['#e7d7c3','#b88f69','#f5efe5','#6b7467'], search: 'modern' },
  { id: 'minimal', name: 'Calm minimal', description: 'Clean lines, uncluttered surfaces and quiet colours.', colors: ['#f0eee8','#d6d0c5','#a5a99e','#4e554f'], search: 'minimal' },
  { id: 'earthy', name: 'Earthy & natural', description: 'Terracotta, tactile fabrics and grounded materials.', colors: ['#c77c59','#d9c3a4','#7a8068','#f1e7d8'], search: 'earthy' },
  { id: 'contemporary', name: 'Contemporary', description: 'Crisp contrast, statement lighting and considered accents.', colors: ['#e8e4de','#a9a79e','#333b37','#b8a184'], search: 'contemporary' },
];

export default function MakeoverPlanner() {
  const [styleId, setStyleId] = useState('warm-modern');
  const [room, setRoom] = useState('Living room');
  const [budget, setBudget] = useState('₹1.5–3 lakh');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [showPlan, setShowPlan] = useState(false);
  const selected = useMemo(() => styles.find((style) => style.id === styleId) ?? styles[0], [styleId]);
  useEffect(() => () => { if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo); }, [photo]);
  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 8 * 1024 * 1024) { alert('Please choose an image smaller than 8 MB.'); return; }
    if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setPhotoName(file.name);
    setShowPlan(false);
  }
  return <main className="page makeover-page"><div className="container"><div className="makeover-intro"><div><div className="eyebrow">A little help imagining your space</div><h1 className="page-title">Your room, your style.</h1><p className="lead">Upload a room photo, choose the feeling you want, and build a simple design direction to explore on Nestora.</p></div><div className="makeover-badge">✦ Room makeover planner</div></div>
    <div className="makeover-workspace"><section className="panel makeover-controls"><h2>Tell us about your room</h2><p className="muted">Your photo is previewed in this browser and is not uploaded to a server by this planner.</p>
      <label htmlFor="room-photo" className="upload-drop"><span className="upload-icon">↑</span><b>{photoName || 'Choose a room photo'}</b><small>JPG, PNG or WebP · up to 8 MB</small><input id="room-photo" type="file" accept="image/*" onChange={onPhotoChange} /></label>
      <div className="form-grid makeover-fields"><div><label htmlFor="room-type">Room type</label><select id="room-type" value={room} onChange={(e) => { setRoom(e.target.value); setShowPlan(false); }}><option>Living room</option><option>Bedroom</option><option>Kitchen</option><option>Dining area</option><option>Balcony</option><option>Study corner</option></select></div><div><label htmlFor="room-budget">Budget range</label><select id="room-budget" value={budget} onChange={(e) => { setBudget(e.target.value); setShowPlan(false); }}><option>Under ₹1.5 lakh</option><option>₹1.5–3 lakh</option><option>₹3–5 lakh</option><option>₹5 lakh+</option></select></div></div>
      <label>Choose a style</label><div className="style-options">{styles.map((style) => <button type="button" key={style.id} onClick={() => { setStyleId(style.id); setShowPlan(false); }} className={`style-option${styleId === style.id ? ' active' : ''}`} aria-pressed={styleId === style.id}><span className="style-swatches">{style.colors.slice(0,3).map((color) => <i key={color} style={{ background: color }} />)}</span><b>{style.name}</b><small>{style.description}</small></button>)}</div>
      <button type="button" className="btn btn-dark makeover-submit" onClick={() => setShowPlan(true)}>Create my style direction ↗</button>
    </section>
    <aside className="makeover-preview"><div className="preview-top"><span className="eyebrow">Your concept board</span><span className="preview-status">{showPlan ? 'Ready to explore' : 'Preview'}</span></div><div className={`room-preview room-preview-${styleId}`}>{photo ? <img src={photo} alt="Your uploaded room preview" /> : <div className="preview-placeholder"><span>✦</span><b>Your room goes here</b><small>Upload a photo to preview it in your board</small></div>}<div className="preview-overlay"><span>{room}</span><b>{selected.name}</b></div></div><div className="palette-panel"><div><b>{selected.name} palette</b><p className="muted">A starting point for materials and finishes.</p></div><div className="palette-swatches">{selected.colors.map((color) => <span key={color} style={{ background: color }} title={color} />)}</div></div><div className="preview-note"><b>Design direction</b><p>{selected.description} For a {budget.toLowerCase()} project, start with one hero element, reuse finishes where practical, and confirm measurements before buying.</p></div>{showPlan && <div className="plan-result"><div className="eyebrow">Your next step</div><h3>Explore matching {room.toLowerCase()} ideas</h3><p className="muted">Use this palette as inspiration, then compare designs and their starting budgets.</p><Link className="btn btn-accent" href={`/designs?search=${encodeURIComponent(selected.search)}`}>Browse matching designs ↗</Link><p className="tiny-note">This is a style-planning prototype, not AI-generated image editing. Connect an image-generation service to create a true redesigned version of the uploaded photo.</p></div>}</aside></div>
    <div className="notice makeover-privacy">Privacy tip: use a photo without people, personal documents or visible home-address details.</div>
  </div></main>;
}
