'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const STORAGE_KEY = 'cornell_notes_v1';

type CornellNote = {
  id: string;
  title: string;
  cue: string;
  notes: string;
  summary: string;
  createdAt: string;
};

export default function NotesPage() {
  const [list, setList] = useState<CornellNote[]>([]);
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }, [list]);

  function save() {
    const note: CornellNote = {
      id: selectedId ?? Date.now().toString(),
      title: title || new Date().toLocaleString(),
      cue,
      notes,
      summary,
      createdAt: new Date().toISOString()
    };

    setList((l) => {
      const exists = l.find((n) => n.id === note.id);
      if (exists) return l.map((n) => (n.id === note.id ? note : n));
      return [note, ...l];
    });

    // clear form for new note
    setSelectedId(null);
    setTitle('');
    setCue('');
    setNotes('');
    setSummary('');
  }

  function load(id: string) {
    const n = list.find((it) => it.id === id);
    if (!n) return;
    setSelectedId(n.id);
    setTitle(n.title);
    setCue(n.cue);
    setNotes(n.notes);
    setSummary(n.summary);
  }

  function remove(id: string) {
    setList((l) => l.filter((it) => it.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setTitle('');
      setCue('');
      setNotes('');
      setSummary('');
    }
  }

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Icons.page className='text-primary size-5' />
            </div>
            <div>
              <CardTitle>Notes (Cornell Method)</CardTitle>
              <CardDescription>
                Store and review notes using the Cornell layout.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            {/* List of saved notes */}
            <div className='col-span-1'>
              <div className='mb-2 font-semibold'>Saved notes</div>
              <div className='max-h-[40vh] space-y-2 overflow-auto'>
                {list.length === 0 && (
                  <div className='text-muted-foreground text-sm'>
                    No notes yet.
                  </div>
                )}
                {list.map((n) => (
                  <div
                    key={n.id}
                    className='hover:bg-muted flex items-center justify-between rounded p-2'
                  >
                    <div className='cursor-pointer' onClick={() => load(n.id)}>
                      <div className='font-medium'>{n.title}</div>
                      <div className='text-muted-foreground text-xs'>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Button variant='ghost' onClick={() => remove(n.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cornell editor */}
            <div className='col-span-2'>
              <div className='mb-2 font-semibold'>Create / Edit Note</div>
              <div className='space-y-2'>
                <input
                  className='w-full rounded border px-2 py-1'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Title (optional)'
                />
                <div className='grid grid-cols-3 gap-2'>
                  <div className='col-span-1'>
                    <div className='text-sm font-medium'>Cue</div>
                    <Textarea
                      value={cue}
                      onChange={(e) => setCue(e.target.value)}
                    />
                  </div>
                  <div className='col-span-2'>
                    <div className='text-sm font-medium'>Notes</div>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className='mt-2 text-sm font-medium'>Summary</div>
                    <Textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className='flex w-full items-center justify-between'>
            <div />
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setSelectedId(null);
                  setTitle('');
                  setCue('');
                  setNotes('');
                  setSummary('');
                }}
              >
                New
              </Button>
              <Button onClick={save}>Save Note</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
