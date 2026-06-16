'use client'

import { useEffect, useRef, useState } from 'react'

type PipelineStep =
  | 'ticket_received' | 'workspace' | 'clone' | 'branch' | 'agents_md'
  | 'implementer' | 'verifier' | 'reviewer' | 'commit' | 'push' | 'pr' | 'jira' | 'done'

// workspace and clone are merged visually into one "Setting up environment" step

type StepStatus = 'active' | 'done' | 'failed'

interface StepState {
  step: PipelineStep
  status: StepStatus
  label: string
  detail: string | null
  timestamp: number
}

interface RunState {
  ticketKey: string
  ticketSummary: string | null
  steps: StepState[]
  startedAt: number
}

const STEP_DEFS: Array<{ id: PipelineStep; label: string; icon: React.ReactElement }> = [
  { id: 'ticket_received', label: 'Ticket received', icon: <TicketIcon /> },
  { id: 'clone', label: 'Setting up environment', icon: <CloneIcon /> },
  { id: 'branch', label: 'Creating branch', icon: <BranchIcon /> },
  { id: 'agents_md', label: 'Reading conventions', icon: <BookIcon /> },
  { id: 'implementer', label: 'Implementer agent', icon: <BotIcon /> },
  { id: 'verifier', label: 'Writing & running tests', icon: <TestIcon /> },
  { id: 'reviewer', label: 'Code review', icon: <ReviewIcon /> },
  { id: 'commit', label: 'Committing changes', icon: <CommitIcon /> },
  { id: 'push', label: 'Pushing to GitHub', icon: <PushIcon /> },
  { id: 'pr', label: 'Opening draft PR', icon: <PrIcon /> },
  { id: 'jira', label: 'Updating Jira ticket', icon: <JiraIcon /> },
  { id: 'done', label: 'Pipeline complete', icon: <DoneIcon /> },
]

const PIPELINE_URL = process.env.NEXT_PUBLIC_PIPELINE_URL ?? 'http://localhost:3000'

export const PipelineDiagram = (): React.ReactElement => {
  const [run, setRun] = useState<RunState | null>(null)
  const [connected, setConnected] = useState(false)
  const stepMap = useRef<Map<PipelineStep, StepState>>(new Map())

  useEffect(() => {
    const es = new EventSource(`${PIPELINE_URL}/pipeline/events`)

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.onmessage = (e: MessageEvent<string>) => {
      try {
        const data = JSON.parse(e.data) as
          | { type: 'init'; ticketKey: string | null; ticketSummary: string | null; steps: StepState[]; startedAt: number | null }
          | { type: 'step' } & StepState & { ticketKey: string; ticketSummary: string | null }

        if (data.type === 'init') {
          if (!data.ticketKey || !data.startedAt) { setRun(null); return }
          stepMap.current = new Map(data.steps.map(s => [s.step, s]))
          setRun({
            ticketKey: data.ticketKey,
            ticketSummary: data.ticketSummary,
            steps: [...stepMap.current.values()],
            startedAt: data.startedAt,
          })
          return
        }

        if (data.type === 'step') {
          const entry: StepState = { step: data.step, status: data.status, label: data.label, detail: data.detail, timestamp: data.timestamp }
          stepMap.current.set(data.step, entry)
          setRun(prev => prev
            ? { ...prev, ticketKey: data.ticketKey, ticketSummary: data.ticketSummary, steps: [...stepMap.current.values()] }
            : { ticketKey: data.ticketKey, ticketSummary: data.ticketSummary, steps: [...stepMap.current.values()], startedAt: Date.now() }
          )
        }
      } catch { /* ignore parse errors */ }
    }

    return () => { es.close(); setConnected(false) }
  }, [])

  const stateFor = (id: PipelineStep): StepState | undefined =>
    run?.steps.find(s => s.step === id)

  const isActive = (id: PipelineStep) => stateFor(id)?.status === 'active'
  const isDone = (id: PipelineStep) => stateFor(id)?.status === 'done'
  const isFailed = (id: PipelineStep) => stateFor(id)?.status === 'failed'
  const isPending = (id: PipelineStep) => !stateFor(id)

  const isDiagramDone = isDone('done')
  const isDiagramFailed = isFailed('done')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {run ? `${run.ticketKey}` : 'Waiting for pipeline…'}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {run?.ticketSummary ?? 'Move a Jira ticket to In Progress to start the pipeline.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Diagram */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {isDiagramDone && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-emerald-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-emerald-700">
              Pipeline complete — draft PR opened on GitHub
            </p>
            {run?.steps.find(s => s.step === 'pr')?.detail && (
              <a
                href={run.steps.find(s => s.step === 'pr')?.detail ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs font-medium text-emerald-600 underline"
              >
                View PR →
              </a>
            )}
          </div>
        )}
        {isDiagramFailed && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <span className="text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-red-700">
              Pipeline failed — {run?.steps.find(s => s.step === 'done')?.detail ?? 'check audit log'}
            </p>
          </div>
        )}

        <div className="flex flex-col">
          {STEP_DEFS.map((def, i) => {
            const active = isActive(def.id)
            const done = isDone(def.id)
            const failed = isFailed(def.id)
            const pending = isPending(def.id)
            const state = stateFor(def.id)
            const isLast = i === STEP_DEFS.length - 1

            return (
              <div key={def.id} className="flex gap-4">
                {/* Left column: connector line + icon */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]'
                      : done
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : failed
                          ? 'border-red-400 bg-red-50 text-red-500'
                          : 'border-gray-200 bg-white text-gray-300'
                  }`}>
                    {active
                      ? <Spinner />
                      : done
                        ? <CheckIcon />
                        : failed
                          ? <XIcon />
                          : def.icon
                    }
                  </div>
                  {!isLast && (
                    <div className={`mt-1 w-0.5 flex-1 min-h-[20px] rounded transition-colors duration-500 ${
                      done ? 'bg-emerald-300' : active ? 'bg-indigo-200' : 'bg-gray-100'
                    }`} />
                  )}
                </div>

                {/* Right column: labels */}
                <div className={`pb-5 pt-1.5 min-w-0 flex-1 ${isLast ? 'pb-0' : ''}`}>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    active ? 'text-indigo-600' : done ? 'text-gray-900' : failed ? 'text-red-600' : 'text-gray-300'
                  }`}>
                    {state?.label ?? def.label}
                  </p>
                  {(active || done || failed) && state?.detail && (
                    <p className={`mt-0.5 truncate text-xs ${
                      active ? 'text-indigo-400' : failed ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {state.detail}
                    </p>
                  )}
                  {active && <ElapsedTimer since={state?.timestamp ?? Date.now()} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Elapsed time counter shown next to the active step
const ElapsedTimer = ({ since }: { since: number }): React.ReactElement => {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - since) / 1000)), 500)
    return () => clearInterval(t)
  }, [since])
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return (
    <p className="mt-1 font-mono text-xs text-indigo-400">
      {m > 0 ? `${m}m ` : ''}{s}s
    </p>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────

function Spinner(): React.ReactElement {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
function CheckIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function XIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}
function TicketIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75a3.375 3.375 0 001.5 2.836v1.828a3.375 3.375 0 00-1.5 2.836V15m0-9H18a3 3 0 013 3v.75M16.5 15H18a3 3 0 003-3v-.75M7.5 6H6a3 3 0 00-3 3v.75M7.5 6v.75a3.375 3.375 0 01-1.5 2.836v1.828A3.375 3.375 0 017.5 14.25V15m0-9h9" /></svg>
}
function WorkspaceIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
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
