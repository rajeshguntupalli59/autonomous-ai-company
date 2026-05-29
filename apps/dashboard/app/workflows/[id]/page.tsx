'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StatusBadge from '../../../components/StatusBadge'

interface Step { name: string; status: string; result: Record<string, unknown> | null }
interface WorkflowDetail {
  id: string; name: string; goal: string; status: string
  current_step: string | null; steps: Step[]; created_at: string
}

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [wf, setWf] = useState<WorkflowDetail | null>(null)

  const fetch_ = async () => {
    const r = await fetch(`/api/orchestrator/workflow/${id}`)
    if (r.ok) setWf(await r.json())
  }

  useEffect(() => {
    fetch_()
    const t = setInterval(fetch_, 2000)
    return () => clearInterval(t)
  }, [id])

  const approve = async () => {
    await fetch(`/api/orchestrator/workflow/${id}/approve`, { method: 'POST' })
    fetch_()
  }

  if (!wf) return <div className="text-gray-400 p-8">Loading...</div>

  const STEP_NAMES = ['research', 'pm', 'architect', 'backend', 'frontend', 'qa', 'deploy']

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button className="btn-ghost text-xs" onClick={() => router.push('/')}>← Back</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white truncate">{wf.goal}</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{wf.id}</p>
        </div>
        <StatusBadge status={wf.status} />
        {wf.status === 'awaiting_approval' && (
          <button className="btn-primary" onClick={approve}>Approve Deploy</button>
        )}
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Pipeline Progress</h2>
        <div className="flex items-center gap-0">
          {STEP_NAMES.map((name, i) => {
            const step = wf.steps.find(s => s.name === name)
            const st = step?.status ?? 'pending'
            const isCurrent = wf.current_step === name
            const colors: Record<string, string> = {
              completed: 'bg-green-500 text-white',
              running: 'bg-blue-500 text-white animate-pulse',
              pending: 'bg-gray-700 text-gray-400',
              failed: 'bg-red-500 text-white',
            }
            return (
              <div key={name} className="flex items-center">
                <div className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors[st] ?? colors.pending}`}>
                    {st === 'completed' ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 w-16 text-center">{name}</span>
                </div>
                {i < STEP_NAMES.length - 1 && (
                  <div className={`w-8 h-0.5 mb-4 ${st === 'completed' ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Step Results</h2>
        <div className="space-y-3">
          {wf.steps.map(step => (
            <div key={step.name} className="border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <StatusBadge status={step.status} />
                <span className="text-sm font-medium text-white">{step.name}</span>
              </div>
              {step.result && (
                <pre className="mt-2 text-xs text-gray-400 bg-gray-800 rounded p-2 overflow-x-auto max-h-32">
                  {JSON.stringify(step.result, null, 2).slice(0, 500)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
