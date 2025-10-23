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
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const STORAGE_KEY = 'assignments_v1';

const SAMPLE_ASSIGNMENTS = [
  { id: 'a1', title: 'Math homework' },
  { id: 'a2', title: 'Science lab report' },
  { id: 'a3', title: 'Read chapter 5' }
];

export default function CompleteAssignmentPage() {
  const [assignments] = useState(SAMPLE_ASSIGNMENTS);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDone(parsed || {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {}
  }, [done]);

  function toggle(id: string) {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }

  const doneCount = assignments.filter((a) => done[a.id]).length;

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Icons.check className='text-primary size-5' />
            </div>
            <div>
              <CardTitle>Complete Assignment</CardTitle>
              <CardDescription>
                Track and mark assignments as complete.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {assignments.map((a) => (
              <div key={a.id} className='flex items-center justify-between'>
                <div>{a.title}</div>
                <div>
                  <Button
                    variant={done[a.id] ? 'secondary' : 'ghost'}
                    onClick={() => toggle(a.id)}
                  >
                    {done[a.id] ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className='flex w-full items-center justify-between'>
            <div>
              {doneCount} / {assignments.length} completed
            </div>
            <div>
              <Button variant='outline' onClick={() => setDone({})}>
                Reset
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
