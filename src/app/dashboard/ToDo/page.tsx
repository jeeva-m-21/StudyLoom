'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const STORAGE_KEY = 'todo_eisenhower_v1';

type Todo = {
  id: string;
  title: string;
  deadline?: string; // ISO date yyyy-mm-dd
  estimatedHours?: number;
  important: boolean;
  urgent: boolean;
  done: boolean;
  createdAt: string;
};

function daysLeft(dateIso?: string) {
  if (!dateIso) return Infinity;
  const today = new Date();
  const d = new Date(dateIso + 'T23:59:59');
  const diff = Math.ceil(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export default function ToDoPage() {
  const [items, setItems] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function add() {
    if (!title.trim()) return;
    const it: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      deadline: deadline || undefined,
      estimatedHours: undefined,
      important: false,
      urgent: false,
      done: false,
      createdAt: new Date().toISOString()
    };
    setItems((s) => [...s, it]);
    setTitle('');
    setDeadline(undefined);
  }

  function toggleDone(id: string) {
    setItems((s) =>
      s.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  }

  function remove(id: string) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  // Partition into 4 Eisenhower quadrants
  const quadrants = useMemo(() => {
    const q: Record<string, Todo[]> = {
      do: [], // important + urgent
      plan: [], // important + not urgent
      delegate: [], // not important + urgent
      eliminate: [] // not important + not urgent
    };
    items.forEach((it) => {
      if (it.important && it.urgent) q.do.push(it);
      else if (it.important && !it.urgent) q.plan.push(it);
      else if (!it.important && it.urgent) q.delegate.push(it);
      else q.eliminate.push(it);
    });
    // sort by deadline ascending (earliest first) and then by createdAt
    const sortFn = (a: Todo, b: Todo) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      if (da !== db) return da - db;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    };
    Object.keys(q).forEach((k) => q[k].sort(sortFn));
    return q;
  }, [items]);

  function parkinsonSuggestion(it: Todo) {
    // return suggested hours per day to finish estimatedHours before deadline
    if (!it.estimatedHours || !it.deadline) return undefined;
    const d = daysLeft(it.deadline);
    if (d <= 0) return it.estimatedHours; // due now or overdue, recommend total
    const perDay = it.estimatedHours / d;
    return Math.max(0.25, Math.round(perDay * 4) / 4); // round to 15min (0.25h)
  }

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Icons.add className='text-primary size-5' />
            </div>
            <div>
              <CardTitle>To Do — Eisenhower Matrix</CardTitle>
              <CardDescription>
                Classify tasks by importance and urgency. Enter a deadline and
                estimated hours — Parkinson suggestion shows hours/day.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Form */}
          <div className='mb-4 grid items-end gap-2 md:grid-cols-3'>
            <Input
              placeholder='Task title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className='input'
              type='date'
              value={deadline || ''}
              onChange={(e) => setDeadline(e.target.value || undefined)}
            />
            <div className='flex items-center justify-end space-x-2'>
              <Button onClick={add}>Add (date-only)</Button>
            </div>
          </div>

          {/* Matrix */}
          <div className='space-y-6'>
            {/* Top row: Do / Plan */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='font-semibold'>Important &amp; Urgent — Do</div>
                <div className='space-y-2'>
                  {quadrants.do.map((it) => (
                    <div
                      key={it.id}
                      className='flex items-start justify-between rounded border p-3'
                    >
                      <div>
                        <div className='font-medium'>{it.title}</div>
                        <div className='text-muted-foreground text-xs'>
                          {it.deadline
                            ? `${daysLeft(it.deadline)} days left`
                            : 'No deadline'}
                        </div>
                        <div className='text-xs'>
                          {it.deadline
                            ? `Parkinson: ${parkinsonSuggestion(it) ?? '-'}h/day`
                            : ''}
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.important}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, important: !x.important }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Important</span>
                          </label>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.urgent}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, urgent: !x.urgent }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Urgent</span>
                          </label>
                        </div>
                        <div>
                          <Button
                            variant='ghost'
                            onClick={() => toggleDone(it.id)}
                          >
                            {it.done ? 'Undone' : 'Done'}
                          </Button>
                        </div>
                        <div>
                          <Button variant='ghost' onClick={() => remove(it.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <div className='font-semibold'>
                  Important &amp; Not Urgent — Plan
                </div>
                <div className='space-y-2'>
                  {quadrants.plan.map((it) => (
                    <div
                      key={it.id}
                      className='flex items-start justify-between rounded border p-3'
                    >
                      <div>
                        <div className='font-medium'>{it.title}</div>
                        <div className='text-muted-foreground text-xs'>
                          {it.deadline
                            ? `${daysLeft(it.deadline)} days left`
                            : 'No deadline'}
                        </div>
                        <div className='text-xs'>
                          {it.deadline
                            ? `Parkinson: ${parkinsonSuggestion(it) ?? '-'}h/day`
                            : ''}
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.important}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, important: !x.important }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Important</span>
                          </label>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.urgent}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, urgent: !x.urgent }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Urgent</span>
                          </label>
                        </div>
                        <div>
                          <Button
                            variant='ghost'
                            onClick={() => toggleDone(it.id)}
                          >
                            {it.done ? 'Undone' : 'Done'}
                          </Button>
                        </div>
                        <div>
                          <Button variant='ghost' onClick={() => remove(it.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider between top and bottom rows */}
            <hr className='my-4' />

            {/* Bottom row: Delegate / Eliminate */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='font-semibold'>
                  Not Important &amp; Urgent — Delegate
                </div>
                <div className='space-y-2'>
                  {quadrants.delegate.map((it) => (
                    <div
                      key={it.id}
                      className='flex items-start justify-between rounded border p-3'
                    >
                      <div>
                        <div className='font-medium'>{it.title}</div>
                        <div className='text-muted-foreground text-xs'>
                          {it.deadline
                            ? `${daysLeft(it.deadline)} days left`
                            : 'No deadline'}
                        </div>
                        <div className='text-xs'>
                          {it.deadline
                            ? `Parkinson: ${parkinsonSuggestion(it) ?? '-'}h/day`
                            : ''}
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.important}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, important: !x.important }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Important</span>
                          </label>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.urgent}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, urgent: !x.urgent }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Urgent</span>
                          </label>
                        </div>
                        <div>
                          <Button
                            variant='ghost'
                            onClick={() => toggleDone(it.id)}
                          >
                            {it.done ? 'Undone' : 'Done'}
                          </Button>
                        </div>
                        <div>
                          <Button variant='ghost' onClick={() => remove(it.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <div className='font-semibold'>
                  Not Important &amp; Not Urgent — Eliminate
                </div>
                <div className='space-y-2'>
                  {quadrants.eliminate.map((it) => (
                    <div
                      key={it.id}
                      className='flex items-start justify-between rounded border p-3'
                    >
                      <div>
                        <div className='font-medium'>{it.title}</div>
                        <div className='text-muted-foreground text-xs'>
                          {it.deadline
                            ? `${daysLeft(it.deadline)} days left`
                            : 'No deadline'}
                        </div>
                        <div className='text-xs'>
                          {it.deadline
                            ? `Parkinson: ${parkinsonSuggestion(it) ?? '-'}h/day`
                            : ''}
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.important}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, important: !x.important }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Important</span>
                          </label>
                          <label className='flex items-center space-x-1 text-xs'>
                            <input
                              type='checkbox'
                              checked={it.urgent}
                              onChange={() =>
                                setItems((s) =>
                                  s.map((x) =>
                                    x.id === it.id
                                      ? { ...x, urgent: !x.urgent }
                                      : x
                                  )
                                )
                              }
                            />
                            <span>Urgent</span>
                          </label>
                        </div>
                        <div>
                          <Button
                            variant='ghost'
                            onClick={() => toggleDone(it.id)}
                          >
                            {it.done ? 'Undone' : 'Done'}
                          </Button>
                        </div>
                        <div>
                          <Button variant='ghost' onClick={() => remove(it.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className='flex w-full items-center justify-between'>
            <div>{items.filter((i) => !i.done).length} tasks left</div>
            <div>
              <Button variant='outline' onClick={() => setItems([])}>
                Clear
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
