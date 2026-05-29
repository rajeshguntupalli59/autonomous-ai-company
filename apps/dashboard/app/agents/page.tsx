'use client'
import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'

const KNOWN_AGENTS = [
  { id: 'research-agent',    role: 'Discovers SaaS opportunities',               model: 'Haiku' },
  { id: 'pm-agent',          role: 'Generates PRDs from research',                model: 'Haiku' },
  { id: 'architect-agent',   role: 'Designs DB schema + API architecture',        model: 'Sonnet' },
  { id: 'backend-agent',     role: 'Writes FastAPI Python code',                  model: 'Sonnet' },
  { id: 'frontend-agent',    role: 'Writes Next.js TypeScript code',              model: 'Sonnet' },
  { id: 'qa-agent',          role: 'Runs tests + security checks',                model: 'Haiku' },
  { id: 'deployment-agent',  role: 'Deploys to Railway + Vercel',                 model: 'Haiku' },
]

interface AgentStatus { name: string; status: string; task_id: string | null }

export default function AgentsPage() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([])
  const [services, setServices] = useState({ api: false, memory: false, orchestrator: false })

  const fetch_ = async () => {
    try {
      const [api, mem, orch] = await Promise.allSettled([
        fetch('/api/gateway/health'),
        fetch('/api/memory/health'),
        fetch('/api/orchestrator/health'),
      ])
      setServices({
        api: api.status === 'fulfilled' && api.value.ok,
        memory: mem.status === 'fulfilled' && mem.value.ok,
        orchestrator: orch.status === 'fulfilled' && orch.value.ok,
      })
    } catch { }
  }

  useEffect(() => {
    fetch_()
    const t = setInterval(fetch_, 5000)
    return () => clearInterval(t)
  }, [])

  const serviceList = [
    { name: 'API Gateway',    port: 8000, ok: services.api },
    { name: 'Memory Service', port: 8001, ok: services.memory },
    { name: 'Orchestrator',   port: 8002, ok: services.orchestrator },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agents</h1>
        <p className="text-gray-400 text-sm mt-1">7 specialized AI agents + 3 backend services</p>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Services</h2>
        <div className="grid grid-cols-3 gap-4">
          {serviceList.map(s => (
            <div key={s.name} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <div className={`w-2.5 h-2.5 rounded-full ${s.ok ? 'bg-green-400' : 'bg-red-500'}`} />
              <div>
                <div className="text-sm font-medium text-white">{s.name}</div>
                <div className="text-xs text-gray-500">:{s.port}</div>
              </div>
              <span className={`ml-auto badge ${s.ok ? 'badge-green' : 'badge-red'}`}>
                {s.ok ? 'up' : 'down'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Agent Registry</h2>
        <table className="tbl">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Role</th>
              <th>Model</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {KNOWN_AGENTS.map(a => {
              const live = statuses.find(s => s.name === a.id)
              return (
                <tr key={a.id}>
                  <td>
                    <span className="font-mono text-green-400">{a.id}</span>
                  </td>
                  <td className="text-gray-400">{a.role}</td>
                  <td>
                    <span className={`badge ${a.model === 'Sonnet' ? 'badge-blue' : 'badge-gray'}`}>
                      {a.model}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={live?.status ?? 'idle'} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Token Budget (per run)</h2>
        <table className="tbl">
          <thead>
            <tr><th>Agent</th><th>Max Input</th><th>Max Output</th><th>Model</th></tr>
          </thead>
          <tbody>
            {[
              { name: 'research-agent',   inp: '8,000',  out: '2,000', model: 'Haiku' },
              { name: 'pm-agent',         inp: '6,000',  out: '3,000', model: 'Haiku' },
              { name: 'architect-agent',  inp: '8,000',  out: '4,000', model: 'Sonnet' },
              { name: 'backend-agent',    inp: '12,000', out: '6,000', model: 'Sonnet' },
              { name: 'frontend-agent',   inp: '10,000', out: '5,000', model: 'Sonnet' },
              { name: 'qa-agent',         inp: '6,000',  out: '2,000', model: 'Haiku' },
              { name: 'deployment-agent', inp: '4,000',  out: '1,000', model: 'Haiku' },
            ].map(r => (
              <tr key={r.name}>
                <td className="font-mono text-xs text-gray-400">{r.name}</td>
                <td className="text-gray-300">{r.inp}</td>
                <td className="text-gray-300">{r.out}</td>
                <td><span className={`badge ${r.model === 'Sonnet' ? 'badge-blue' : 'badge-gray'}`}>{r.model}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
