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
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const STORAGE_KEY = 'prepare_exam_v2';

type Exam = {
  id: string;
  subject: string;
  topic: string;
  date: string; // ISO
};

type StudyBlock = {
  date: string; // ISO date
  topic: string;
  minutes: number;
};

export default function PrepareForExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [plan, setPlan] = useState<StudyBlock[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.exams)) setExams(parsed.exams);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ exams }));
    } catch {}
  }, [exams]);

  function addExam() {
    if (!subject.trim() || !topic.trim() || !date) return;
    setExams((e) => [
      {
        id: Date.now().toString(),
        subject: subject.trim(),
        topic: topic.trim(),
        date
      },
      ...e
    ]);
    setSubject('');
    setTopic('');
    setDate('');
  }

  function removeExam(id: string) {
    setExams((e) => e.filter((x) => x.id !== id));
  }

  const upcoming = useMemo(() => {
    return exams
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  function buildPlan() {
    if (exams.length === 0) return;
    // Naive planner: for each exam, allocate study days between now and exam date,
    // and create one block per day per exam topic (~45 minutes per day).
    const blocks: StudyBlock[] = [];
    const now = new Date();
    for (const ex of upcoming) {
      const examDate = new Date(ex.date);
      // count days from tomorrow to examDate (inclusive)
      const days = Math.max(
        1,
        Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      for (let i = 0; i < days; i++) {
        const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        blocks.push({
          date: d.toISOString(),
          topic: `${ex.subject}: ${ex.topic}`,
          minutes: 45
        });
      }
    }
    setPlan(blocks);
  }

  function startStudy() {
    // Placeholder: in a fuller integration this would open Pomodoro with the first block
    if (!plan) return;
    // currently just keeps showing the plan
  }

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Icons.check className='text-primary size-5' />
            </div>
            <div>
              <CardTitle>Prepare for Exam</CardTitle>
              <CardDescription>
                Enter your upcoming exams and generate a study schedule.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <div className='mb-2 font-medium'>Add exam</div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='Subject (e.g. Math)'
                className='mb-2 w-full rounded border px-2 py-1'
              />
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='Topic (e.g. Calculus)'
                className='mb-2 w-full rounded border px-2 py-1'
              />
              <input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className='mb-2 w-full rounded border px-2 py-1'
              />
              <div className='flex gap-2'>
                <Button onClick={addExam}>Add Exam</Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setExams([]);
                    setPlan(null);
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div>
              <div className='mb-2 font-medium'>Upcoming exams</div>
              <div className='max-h-[40vh] space-y-2 overflow-auto'>
                {upcoming.length === 0 && (
                  <div className='text-muted-foreground text-sm'>
                    No exams added.
                  </div>
                )}
                {upcoming.map((ex) => (
                  <div
                    key={ex.id}
                    className='hover:bg-muted flex items-center justify-between rounded p-2'
                  >
                    <div>
                      <div className='font-medium'>
                        {ex.subject} — {ex.topic}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        {new Date(ex.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <Button variant='ghost' onClick={() => removeExam(ex.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <div className='mb-2 font-medium'>Study Plan</div>
            <div className='mb-2 flex gap-2'>
              <Button onClick={buildPlan}>Build Plan</Button>
              <Button variant='outline' onClick={() => setPlan(null)}>
                Reset Plan
              </Button>
              <Button onClick={startStudy} disabled={!plan}>
                Start Studying
              </Button>
            </div>

            {plan && (
              <div className='max-h-[40vh] space-y-2 overflow-auto'>
                {plan.map((b, i) => (
                  <div key={i} className='rounded border p-2'>
                    <div className='text-sm font-medium'>
                      {new Date(b.date).toLocaleDateString()} — {b.topic}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {b.minutes} minutes
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className='flex w-full items-center justify-between'>
            <div />
            <div>
              <Button
                variant='outline'
                onClick={() => {
                  setPlan(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
