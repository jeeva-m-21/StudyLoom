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

const STORAGE_KEY = 'flashcards_v2';

function generateCards(subject: string, topic: string) {
  // Small deterministic sample generator — replace with real data source later.
  return [
    {
      q: `What is the main concept of ${topic}?`,
      a: `${topic} overview in ${subject}`
    },
    { q: `List 3 key points about ${topic}.`, a: `Point A, Point B, Point C` },
    {
      q: `Explain one example related to ${topic}.`,
      a: `An example that illustrates ${topic}`
    }
  ];
}

export default function FlashcardsPage() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<{ q: string; a: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.subject) setSubject(parsed.subject);
        if (parsed?.topic) setTopic(parsed.topic);
        if (parsed?.cards) setCards(parsed.cards);
        if (typeof parsed?.index === 'number') setIndex(parsed.index);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ subject, topic, cards, index })
      );
    } catch {}
  }, [subject, topic, cards, index]);

  function start() {
    if (!subject.trim() || !topic.trim()) return;
    const generated = generateCards(subject.trim(), topic.trim());
    setCards(generated);
    setIndex(0);
    setFlipped(false);
  }

  function next() {
    setIndex((i) => Math.min(cards.length - 1, i + 1));
    setFlipped(false);
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
  }

  const Icon = Icons.post;

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Icon className='text-primary size-5' />
            </div>
            <div>
              <CardTitle>Flashcards</CardTitle>
              <CardDescription>
                Enter subject and topic to generate flashcards.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {cards.length === 0 ? (
            <div className='space-y-3'>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='Subject (e.g. Biology)'
                className='w-full rounded border px-2 py-1'
              />
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='Topic (e.g. Cell structure)'
                className='w-full rounded border px-2 py-1'
              />
              <div className='flex justify-end'>
                <Button onClick={start}>Start</Button>
              </div>
            </div>
          ) : (
            <div className='flex min-h-[120px] items-center justify-center text-center text-lg'>
              <div>
                <div className='font-semibold'>{cards[index].q}</div>
                {flipped && (
                  <div className='text-muted-foreground mt-3'>
                    {cards[index].a}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className='flex w-full items-center justify-between'>
            <div className='flex gap-2'>
              <Button variant='ghost' onClick={prev} disabled={index === 0}>
                Prev
              </Button>
              <Button
                variant='ghost'
                onClick={next}
                disabled={index === cards.length - 1}
              >
                Next
              </Button>
            </div>
            <div className='flex gap-2'>
              <Button onClick={() => setFlipped((f) => !f)}>
                {flipped ? 'Hide' : 'Flip'}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setCards([]);
                  setIndex(0);
                  setFlipped(false);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
