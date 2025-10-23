'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

type Subject = {
  id: number;
  name: string;
  description?: string;
  progress: number;
  color?: string;
};

type EventItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  subjectId?: number;
  backgroundColor?: string;
};

const STORAGE_SUBJECTS = 'studyloom_subjects_v1';
const STORAGE_EVENTS = 'studyloom_events_v1';

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Advanced calculus, linear algebra, and statistics',
    progress: 65,
    color: '#ef4444'
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Mechanics, thermodynamics, and quantum physics',
    progress: 45,
    color: '#06b6d4'
  },
  {
    id: 3,
    name: 'Computer Science',
    description: 'Programming, algorithms, and data structures',
    progress: 80,
    color: '#7c3aed'
  }
];

export default function SubjectsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SUBJECTS);
      return raw ? JSON.parse(raw) : DEFAULT_SUBJECTS;
    } catch (e) {
      return DEFAULT_SUBJECTS;
    }
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);
  useEffect(() => {
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
  }, [events]);

  // map subjects to colors for calendar events
  const subjectColorMap = useMemo(() => {
    const m: Record<number, string> = {};
    subjects.forEach((s) => {
      m[s.id] = s.color || '#0ea5e9';
    });
    return m;
  }, [subjects]);

  // handlers
  function addSubject() {
    const id = Math.max(0, ...subjects.map((s) => s.id)) + 1;
    const newSub: Subject = {
      id,
      name: `New Subject ${id}`,
      progress: 0,
      color: '#10b981'
    };
    setSubjects((s) => [...s, newSub]);
  }

  // Calendar interactions using react-day-picker
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventSubjectId, setNewEventSubjectId] = useState<
    number | undefined
  >(subjects[0]?.id);

  function addEventForSelectedDate() {
    if (!selectedDate) return alert('Select a date first');
    if (!newEventTitle) return alert('Enter an event title');
    const dateStr = selectedDate.toISOString().slice(0, 10);
    const ev: EventItem = {
      id: String(Date.now()),
      title: newEventTitle,
      start: dateStr,
      subjectId: newEventSubjectId,
      backgroundColor: newEventSubjectId
        ? subjectColorMap[newEventSubjectId]
        : undefined
    };
    setEvents((e) => [...e, ev]);
    setNewEventTitle('');
  }

  function editEventTitle(id: string) {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const newTitle = prompt('Edit event title', ev.title);
    if (newTitle === null) return;
    setEvents((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
    );
  }

  function startStudying() {
    router.push('/dashboard/PrepareForExam');
  }

  function doAssignment() {
    router.push('/dashboard/CompleteAssignment');
  }

  // helper: events by date
  const eventsByDate = useMemo(() => {
    const m: Record<string, EventItem[]> = {};
    events.forEach((ev) => {
      const d = ev.start;
      if (!m[d]) m[d] = [];
      m[d].push(ev);
    });
    return m;
  }, [events]);

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
          <div>
            <Heading
              title='Subjects'
              description='Manage your study subjects'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Button onClick={addSubject}>
              <IconPlus className='mr-2 h-4 w-4' />
              Add Subject
            </Button>
          </div>
        </div>
        <Separator />

        {/* Subjects area - first, expanded */}
        <div className='w-full'>
          <Card>
            <CardHeader>
              <CardTitle>Subjects List</CardTitle>
              <CardDescription>
                Assign a color to a subject and see it reflected in the
                calendar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className='hover:bg-muted/50 transition-colors'
                  >
                    <CardHeader>
                      <div className='flex w-full items-start justify-between'>
                        <div>
                          <CardTitle className='text-xl'>
                            {subject.name}
                          </CardTitle>
                          <CardDescription>
                            {subject.description}
                          </CardDescription>
                        </div>
                        <div className='flex flex-col items-end space-y-2'>
                          <input
                            type='color'
                            value={subject.color || '#000000'}
                            onChange={(e) =>
                              setSubjects((prev) =>
                                prev.map((p) =>
                                  p.id === subject.id
                                    ? { ...p, color: e.target.value }
                                    : p
                                )
                              )
                            }
                            title='Choose subject color'
                            className='h-8 w-10 border-0 bg-transparent p-0'
                          />
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='outline'>Actions</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => startStudying()}
                                >
                                  Start Studying
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => doAssignment()}
                                >
                                  Do Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center space-x-4'>
                        <div className='flex-1 space-y-1'>
                          <div className='bg-secondary h-2 rounded-full'>
                            <div
                              className='h-2 rounded-full transition-all'
                              style={{
                                width: `${subject.progress}%`,
                                background: subject.color || undefined
                              }}
                            />
                          </div>
                          <p className='text-muted-foreground text-right text-sm'>
                            {subject.progress}% Complete
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar area - below subjects */}
        <div className='w-full'>
          <Card>
            <CardHeader>
              <CardTitle>Study Calendar</CardTitle>
              <CardDescription>
                Add and edit events. Select a date, fill the form and click Add
                Event. Event colors match subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='md:col-span-2'>
                  <DayPicker
                    mode='single'
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    fromYear={2000}
                    toYear={2100}
                    modifiers={{
                      hasEvent: (date) =>
                        !!eventsByDate[date.toISOString().slice(0, 10)]
                    }}
                    footer={
                      selectedDate ? (
                        <div className='mt-2'>
                          Selected: {selectedDate.toDateString()}
                        </div>
                      ) : undefined
                    }
                    components={{
                      DayContent: ({ date }) => {
                        const key = date.toISOString().slice(0, 10);
                        const evs = eventsByDate[key] || [];
                        return (
                          <div className='space-y-1'>
                            <div>{date.getDate()}</div>
                            <div className='mt-1 flex flex-col'>
                              {evs.slice(0, 3).map((ev) => (
                                <div
                                  key={ev.id}
                                  role='button'
                                  tabIndex={0}
                                  onClick={() => editEventTitle(ev.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      editEventTitle(ev.id);
                                    }
                                  }}
                                  className='cursor-pointer truncate rounded px-1 py-0.5 text-left text-xs'
                                  style={{ background: ev.backgroundColor }}
                                  aria-label={`Edit event ${ev.title}`}
                                >
                                  {ev.title}
                                </div>
                              ))}
                              {evs.length > 3 && (
                                <div className='text-muted-foreground text-xs'>
                                  +{evs.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    }}
                  />
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Event Title
                    </label>
                    <input
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className='input w-full'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Subject
                    </label>
                    <select
                      value={newEventSubjectId}
                      onChange={(e) =>
                        setNewEventSubjectId(Number(e.target.value))
                      }
                      className='input w-full'
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Selected Date
                    </label>
                    <div>
                      {selectedDate ? selectedDate.toDateString() : 'None'}
                    </div>
                  </div>
                  <div className='flex space-x-2'>
                    <Button onClick={addEventForSelectedDate}>Add Event</Button>
                    <Button
                      variant='ghost'
                      onClick={() => {
                        setSelectedDate(undefined);
                        setNewEventTitle('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects area - expanded below calendar */}
      </div>
    </PageContainer>
  );
}
