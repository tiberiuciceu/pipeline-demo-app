'use client'

import { useEffect, useRef, useState } from 'react'

type PipelineStep =
  | 'ticket_received' | 'workspace' | 'clone' | 'branch' | 'agents_md'
  | 'implementer' | 'verifier' | 'reviewer' | 'commit' | 'push' | 'pr' | 'jira' | 'done'

type StepStatus = 'active' | 'done' | 'failed'

interface ReviewData {
  summary: string
  blocking: Array<{ file: string; line: number | null; message: string }>
  suggestions: Array<{ file: string; line: number | null; message: string }>
}

interface StepState {
  step: PipelineStep
  status: StepStatus
  label: string
  detail: string | null
  costUsd: number | null
  filesChanged: string[] | null
  reviewData: ReviewData | null
  activatedAt: number
  completedAt: number | null
  timestamp: number
}

interface RunState {
  ticketKey: string
  ticketSummary: string | null
  steps: StepState[]
  startedAt: number
}

const STEP_DEFS: Array<{ id: PipelineStep; label: string; isAgent: boolean; icon: React.ReactElement }> = [
  { id: 'ticket_received', label: 'Ticket received', isAgent: false, icon: <TicketIcon /> },
  { id: 'clone', label: 'Setting up environment', isAgent: false, icon: <CloneIcon /> },
  { id: 'branch', label: 'Creating branch', isAgent: false, icon: <BranchIcon /> },
  { id: 'agents_md', label: 'Reading conventions', isAgent: false, icon: <BookIcon /> },
  { id: 'implementer', label: 'Implementer agent', isAgent: true, icon: <BotIcon /> },
  { id: 'verifier', label: 'Writing & running tests', isAgent: true, icon: <TestIcon /> },
  { id: 'reviewer', label: 'Code review', isAgent: true, icon: <ReviewIcon /> },
  { id: 'commit', label: 'Committing changes', isAgent: false, icon: <CommitIcon /> },
  { id: 'push', label: 'Pushing to GitHub', isAgent: false, icon: <PushIcon /> },
  { id: 'pr', label: 'Opening draft PR', isAgent: false, icon: <PrIcon /> },
  { id: 'jira', label: 'Updating Jira ticket', isAgent: false, icon: <JiraIcon /> },
  { id: 'done', label: 'Pipeline complete', isAgent: false, icon: <DoneIcon /> },
]

const PIPELINE_URL = process.env.NEXT_PUBLIC_PIPELINE_URL ?? 'http://localhost:3000'

const fmtDuration = (ms: number): string => {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}


export const PipelineDiagram = (): React.ReactElement => {
  const [run, setRun] = useState<RunState | null>(null)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<'files' | 'review'>('files')
  const [elapsed, setElapsed] = useState(0)
  const stepMap = useRef<Map<PipelineStep, StepState>>(new Map())
  const activatedAt = useRef<Map<PipelineStep, number>>(new Map())

  useEffect(() => {
    if (!run) { setElapsed(0); return }
    const done = run.steps.some(s => s.step === 'done' && (s.status === 'done' || s.status === 'failed'))
    if (done) {
      const endStep = run.steps.find(s => s.step === 'done')
      setElapsed(Math.floor(((endStep?.completedAt ?? Date.now()) - run.startedAt) / 1000))
      return
    }
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - run.startedAt) / 1000)), 500)
    return () => clearInterval(t)
  }, [run?.startedAt, run?.steps])

  useEffect(() => {
    const es = new EventSource(`${PIPELINE_URL}/pipeline/events`)
    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.onmessage = (e: MessageEvent<string>) => {
      try {
        const data = JSON.parse(e.data) as
          | { type: 'init'; ticketKey: string | null; ticketSummary: string | null; steps: StepState[]; startedAt: number | null }
          | ({ type: 'step' } & Omit<StepState, 'activatedAt' | 'completedAt'> & { ticketKey: string; ticketSummary: string | null })

        if (data.type === 'init') {
          stepMap.current.clear()
          activatedAt.current.clear()
          if (!data.ticketKey || !data.startedAt) { setRun(null); return }
          for (const s of data.steps) {
            const at = s.activatedAt ?? s.timestamp
            if (s.status === 'active') activatedAt.current.set(s.step, at)
            stepMap.current.set(s.step, { ...s, activatedAt: at, completedAt: s.completedAt ?? null })
          }
          setRun({ ticketKey: data.ticketKey, ticketSummary: data.ticketSummary, steps: [...stepMap.current.values()], startedAt: data.startedAt })
          return
        }

        if (data.type === 'step') {
          const now = Date.now()
          let at = activatedAt.current.get(data.step) ?? now
          let completedAt: number | null = null
          if (data.status === 'active') { at = now; activatedAt.current.set(data.step, now) }
          if (data.status === 'done' || data.status === 'failed') { completedAt = now }
          const entry: StepState = { ...data, activatedAt: at, completedAt }
          stepMap.current.set(data.step, entry)
          setRun(prev => prev
            ? { ...prev, steps: [...stepMap.current.values()] }
            : { ticketKey: data.ticketKey, ticketSummary: data.ticketSummary, steps: [...stepMap.current.values()], startedAt: now }
          )
        }
      } catch { /* ignore */ }
    }
    return () => { es.close(); setConnected(false) }
  }, [])

  const stateFor = (id: PipelineStep) => run?.steps.find(s => s.step === id)
  const allFiles = [...new Set(run?.steps.filter(s => s.filesChanged).flatMap(s => s.filesChanged ?? []) ?? [])]
  const latestReview = [...(run?.steps.filter(s => s.step === 'reviewer' && s.reviewData) ?? [])].pop()?.reviewData ?? null
  const isDone = stateFor('done')?.status === 'done'
  const isFailed = stateFor('done')?.status === 'failed'
  const prUrl = stateFor('pr')?.detail ?? null
  const hasDetails = allFiles.length > 0 || latestReview !== null

  const SECRET = 'f84d04b917de51b26bb6c0ba66c2baa24011cf7a71c67db18f5e5274b6d20e5e'

  const handleReset = async () => {
    const key = run?.ticketKey
    stepMap.current.clear()
    activatedAt.current.clear()
    setRun(null)
    if (key) {
      await fetch(`${PIPELINE_URL}/reset/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { 'x-webhook-secret': SECRET },
      }).catch(() => {})
    }
  }

  const handleStop = async () => {
    await fetch(`${PIPELINE_URL}/stop`, {
      method: 'POST',
      headers: { 'x-webhook-secret': SECRET },
    }).catch(() => {})
    // Also clear local state after a brief delay so the "Stopped by user" event arrives first
    setTimeout(() => handleReset(), 800)
  }

  const isRunning = run !== null && !isDone && !isFailed

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {run ? run.ticketKey : 'Waiting for pipeline…'}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {run?.ticketSummary ?? 'Move a Jira ticket to In Progress to start the pipeline.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {run && (
            <span className="font-mono text-sm text-gray-500">{fmtDuration(elapsed * 1000)}</span>
          )}
          {isRunning && (
            <button
              onClick={handleStop}
              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
              title="Stop pipeline"
            >
              ■ Stop
            </button>
          )}
          {run && !isRunning && (
            <button onClick={handleReset} className="text-xs text-gray-300 hover:text-gray-500 transition-colors" title="Clear diagram">
              ↺ Clear
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {isDone && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-700">Pipeline complete — draft PR opened on GitHub</p>
          {prUrl && (
            <a href={prUrl} target="_blank" rel="noopener noreferrer"
              className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors">
              View PR →
            </a>
          )}
        </div>
      )}
      {isFailed && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <AlertIcon className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700 flex-1">
            Pipeline failed — {stateFor('done')?.detail ?? 'check logs'}
          </p>
          <button
            onClick={handleReset}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col gap-4">
        {/* Steps */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col">
            {STEP_DEFS.map((def, i) => {
              const state = stateFor(def.id)
              const active = state?.status === 'active'
              const done = state?.status === 'done'
              const failed = state?.status === 'failed'
              const isLast = i === STEP_DEFS.length - 1
              const durationMs = done || failed
                ? (state?.completedAt ?? Date.now()) - (state?.activatedAt ?? Date.now())
                : null
              const prevState = i > 0 ? stateFor(STEP_DEFS[i - 1]!.id) : null
              const isFixPass = def.id === 'implementer' && active && state?.label?.toLowerCase().includes('fix')

              return (
                <div key={def.id} className="flex gap-4">
                  {/* Connector column */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2
                      transition-all duration-700 ease-in-out
                      ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]'
                        : done ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : failed ? 'border-red-400 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-white text-gray-300'}
                    `}>
                      {active ? <Spinner /> : done ? <CheckIcon /> : failed ? <XIcon /> : def.icon}
                    </div>
                    {!isLast && (
                      <div className={`mt-1 w-0.5 flex-1 min-h-[24px] rounded transition-all duration-700 ${
                        done ? 'bg-emerald-300' : active ? 'bg-indigo-200' : 'bg-gray-100'
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pt-1.5 pb-6 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
                    {/* Fix-pass return indicator */}
                    {isFixPass && prevState?.step === 'reviewer' && (
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-violet-500">
                        <span className="text-[10px]">↺</span>
                        <span>Reviewer sent back for fixes</span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className={`text-sm font-medium transition-colors duration-700 ${
                        active ? 'text-indigo-600' : done ? 'text-gray-900' : failed ? 'text-red-600' : 'text-gray-300'
                      }`}>
                        {state?.label ?? def.label}
                      </p>
                    </div>

                    {/* Detail text */}
                    {(active || done || failed) && state?.detail && (
                      <p className={`mt-0.5 truncate text-xs transition-colors duration-700 ${
                        active ? 'text-indigo-400' : failed ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {state.detail}
                      </p>
                    )}

                    {/* Elapsed timer for active step */}
                    {active && <ElapsedTimer since={state?.activatedAt ?? Date.now()} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Details panel — full width below steps */}
        {hasDetails && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('files')}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${
                  activeTab === 'files' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Files changed {allFiles.length > 0 && `(${allFiles.length})`}
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${
                  activeTab === 'review' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Review {latestReview && latestReview.blocking.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">{latestReview.blocking.length} blocking</span>
                )}
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'files' && (
                allFiles.length === 0
                  ? <p className="text-sm text-gray-400">No files changed yet.</p>
                  : (
                    <ul className="grid grid-cols-2 gap-2">
                      {allFiles.map(f => (
                        <li key={f} className="group relative flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100 cursor-default overflow-visible">
                          <FileIcon />
                          <span className="text-sm font-mono text-gray-700 truncate">{f}</span>
                          <div className="pointer-events-none absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                            <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-mono text-white shadow-lg whitespace-nowrap">
                              {f}
                            </div>
                            <div className="ml-3 h-1.5 w-1.5 rotate-45 bg-gray-900 -mt-1" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
              )}

              {activeTab === 'review' && (
                latestReview === null
                  ? <p className="text-sm text-gray-400">No review yet.</p>
                  : (
                    <div className="flex flex-col gap-6">
                      <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <p className="mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Summary</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{latestReview.summary}</p>
                      </div>
                      {latestReview.blocking.length > 0 && (
                        <div>
                          <p className="mb-3 text-xs font-semibold text-red-500 uppercase tracking-wider">
                            Blocking ({latestReview.blocking.length})
                          </p>
                          <ul className="grid grid-cols-2 gap-3">
                            {latestReview.blocking.map((f, i) => (
                              <li key={i} className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-xs font-mono font-semibold text-red-600">{f.file}{f.line ? `:${f.line}` : ''}</p>
                                <p className="mt-1 text-sm text-red-700 leading-snug">{f.message}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {latestReview.suggestions.length > 0 && (
                        <div>
                          <p className="mb-3 text-xs font-semibold text-amber-500 uppercase tracking-wider">
                            Suggestions ({latestReview.suggestions.length})
                          </p>
                          <ul className="grid grid-cols-2 gap-3">
                            {latestReview.suggestions.map((f, i) => (
                              <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="text-xs font-mono font-semibold text-amber-600">{f.file}{f.line ? `:${f.line}` : ''}</p>
                                <p className="mt-1 text-sm text-amber-700 leading-snug">{f.message}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Elapsed timer ─────────────────────────────────────────────────────────────

const ElapsedTimer = ({ since }: { since: number }): React.ReactElement => {
  const [ms, setMs] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setMs(Date.now() - since), 500)
    return () => clearInterval(t)
  }, [since])
  return <p className="mt-1 font-mono text-xs text-indigo-400 animate-pulse">{fmtDuration(ms)}</p>
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function Spinner(): React.ReactElement {
  return <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}
function CheckIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function XIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}
function CheckCircleIcon({ className }: { className?: string }): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function AlertIcon({ className }: { className?: string }): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
}
function FileIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5 shrink-0 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
}
function TicketIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75a3.375 3.375 0 001.5 2.836v1.828a3.375 3.375 0 00-1.5 2.836V15m0-9H18a3 3 0 013 3v.75M16.5 15H18a3 3 0 003-3v-.75M7.5 6H6a3 3 0 00-3 3v.75M7.5 6v.75a3.375 3.375 0 01-1.5 2.836v1.828A3.375 3.375 0 017.5 14.25V15m0-9h9" /></svg>
}
function CloneIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
}
function BranchIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" /></svg>
}
function BookIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
}
function BotIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M12 6.75a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5z" /></svg>
}
function TestIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15m-14.8-.5h14.8m-14.8 0l-1.5 4.5m16.3-4.5l1.5 4.5m-17.8 0h19.1" /></svg>
}
function ReviewIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function CommitIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
}
function PushIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
}
function PrIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-6 4.5v.008a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0015.75 6h-7.5A2.25 2.25 0 006 8.25v8.25" /></svg>
}
function JiraIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75a3.375 3.375 0 001.5 2.836v1.828a3.375 3.375 0 00-1.5 2.836V15m0-9H18a3 3 0 013 3v.75M16.5 15H18a3 3 0 003-3v-.75M7.5 6v.75A3.375 3.375 0 016 9.586v1.828A3.375 3.375 0 017.5 14.25V15m0-9H6a3 3 0 00-3 3v.75M7.5 15H6a3 3 0 01-3-3v-.75" /></svg>
}
function DoneIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
