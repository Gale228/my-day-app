"use client";

import { NotebookPen, Pin, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { PageTransition } from "@/components/page-transition";
import { Button, EmptyState } from "@/components/ui";

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const ordered = useMemo(() => [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)), [notes]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = notes.find((note) => note.id === selectedId) ?? null;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!selectedId && ordered[0]) setSelectedId(ordered[0].id);
  }, [ordered, selectedId]);
  useEffect(() => { if (selected) { setTitle(selected.title); setContent(selected.content); } }, [selected]);

  async function create() {
    const id = await addNote({ title: "Новая заметка", content: "", pinned: false });
    if (id) setSelectedId(id);
  }
  async function save() { if (selected) await updateNote(selected.id, { title, content }); }
  async function remove() { if (!selected) return; const id = selected.id; setSelectedId(null); await deleteNote(id); }

  return (
    <PageTransition>
      <header className="page-header"><div><span className="eyebrow">Мысли под рукой</span><h1>Заметки</h1><p>Идеи, планы, списки и всё, что не хочется потерять.</p></div><Button onClick={create}><Plus size={18} /> Новая заметка</Button></header>
      {notes.length ? <div className="notes-layout">
        <aside className="panel notes-sidebar"><div className="notes-list">{ordered.map((note) => <button key={note.id} className={`note-preview ${selectedId === note.id ? "active" : ""}`} onClick={() => setSelectedId(note.id)}><div><strong>{note.title || "Без названия"}</strong>{note.pinned && <Pin size={13} />}</div><p>{note.content || "Пустая заметка"}</p><small>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(note.updatedAt))}</small></button>)}</div></aside>
        {selected && <section className="panel note-editor"><div className="note-toolbar"><button className={`pin-button ${selected.pinned ? "active" : ""}`} onClick={() => updateNote(selected.id, { pinned: !selected.pinned })}><Pin size={17} /> {selected.pinned ? "Закреплена" : "Закрепить"}</button><div><button className="row-action danger-hover" onClick={remove}><Trash2 size={18} /></button><Button onClick={save}><Save size={17} /> Сохранить</Button></div></div><input className="note-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" /><textarea className="note-content-input" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Начни писать…" /></section>}
      </div> : <section className="panel page-panel"><EmptyState icon={<NotebookPen size={24} />} title="Заметок пока нет" text="Создай первую заметку — она будет синхронизироваться между устройствами." /><div className="empty-action"><Button onClick={create}><Plus size={17} /> Создать заметку</Button></div></section>}
    </PageTransition>
  );
}
