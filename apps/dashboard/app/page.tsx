'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatusBadge from '../components/StatusBadge'

interface Workflow { id: string; name: string; goal: string; status: string; current_step: string | null }

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [goal, setGoal] = useState('')
  const [starting, setStarting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const fetchWorkflows = async () => {
    try {
      const r = await fetch('/api/orchestrator/workflow')
      if (r.ok) setWorkflows(await r.json())
    } catch { }
    setLoading(false)
  }

  useEffect(() => {
    fetchWorkflows()
    const t = setInterval(fetchWorkflows, 3000)
    return () => clearInterval(t)
  }, [])

  const startWorkflow = async () => {
    if (!goal.trim()) return
    setStarting(true); setMsg('')
    try {
      const r = await fetch('/api/orchestrator/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim(), workflow_type: 'product_creation' }),
      })
      if (r.ok) { setGoal(''); setMsg('Workflow started'); fetchWorkflows() }
      else setMsg('Failed to start workflow')
    } catch { setMsg('Connection error') }
    setStarting(false)
  }

  const approve = async (id: string) => {
    await fetch(`/api/orchestrator/workflow/${id}/approve`, { method: 'POST' })
    fetchWorkflows()
  }

  const cancel = async (id: string) => {
    await fetch(`/api/orchestrator/workflow/${id}/cancel`, { method: 'POST' })
    fetchWorkflows()
  }

  const running = workflows.filter(w => ['running', 'awaiting_approval'].includes(w.status)).length
  const done = workflows.filter(w => w.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-gray-400 text-sm mt-1">Product creation pipeline: Research → PM → Architect → Build → QA → Deploy</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="card py-3 px-5 text-center">
            <div className="text-2xl font-bold text-green-400">{running}</div>
            <div className="text-gray-400">Running</div>
          </div>
          <div className="card py-3 px-5 text-center">
            <div className="text-2xl font-bold text-blue-400">{done}</div>
            <div className="text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Start New Workflow</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            placeholder="e.g. Build a self-hosted Postgres query analyzer for indie teams"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startWorkflow()}
          />
          <button className="btn-primary" onClick={startWorkflow} disabled={starting}>
            {starting ? 'Starting...' : 'Start'}
          </button>
        </div>
        {msg && <p className="mt-2 text-xs text-green-400">{msg}</p>}
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Status</th>
              <th>Current Step</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="text-center text-gray-500 py-8">Loading...</td></tr>
            )}
            {!loading && workflows.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-500 py-8">No workflows yet. Start one above.</td></tr>
            )}
            {workflows.map(w => (
              <tr key={w.id}>
                <td>
                  <Link href={`/workflows/${w.id}`} className="text-white hover:text-green-400 font-medium">
                    {w.goal.length > 60 ? w.goal.slice(0, 60) + '...' : w.goal}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono">{w.id.slice(0, 8)}</div>
                </td>
                <td><StatusBadge status={w.status} /></td>
                <td className="text-gray-400">{w.current_step ?? '—'}</td>
                <td className="flex gap-2">
                  {w.status === 'awaiting_approval' && (
                    <button className="btn-primary text-xs py-1 px-3" onClick={() => approve(w.id)}>
                      Approve Deploy
                    </button>
                  )}
                  {['running', 'awaiting_approval'].includes(w.status) && (
                    <button className="btn-danger text-xs py-1 px-3" onClick={() => cancel(w.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
