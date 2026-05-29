'use client'
import { useState } from 'react'

interface MemoryResult {
  id: string; agent_id: string; memory_type: string
  content: string; similarity: number; created_at: string
}

const AGENT_IDS = [
  '', 'research-agent', 'pm-agent', 'architect-agent',
  'backend-agent', 'frontend-agent', 'qa-agent', 'deployment-agent',
]

export default function MemoryPage() {
  const [query, setQuery] = useState('')
  const [agentId, setAgentId] = useState('')
  const [results, setResults] = useState<MemoryResult[]>([])
  const [inject, setInject] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setSearched(false)
    try {
      const params = new URLSearchParams({ query, top_k: '5', inject: 'true' })
      if (agentId) params.set('agent_id', agentId)
      const r = await fetch(`/api/memory/memory/search?${params}`)
      if (r.ok) {
        const d = await r.json()
        setResults(d.results ?? [])
        setInject(d.inject ?? '')
      }
    } catch { }
    setLoading(false); setSearched(true)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Memory</h1>
        <p className="text-gray-400 text-sm mt-1">Vector similarity search across all agent memories</p>
      </div>

      <div className="card">
        <div className="flex gap-3">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            placeholder="Search memories... e.g. DBA tools, PRD, architecture"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
          >
            {AGENT_IDS.map(a => <option key={a} value={a}>{a || 'All agents'}</option>)}
          </select>
          <button className="btn-primary" onClick={search} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {inject && (
        <div className="card border-green-900">
          <h2 className="text-xs font-semibold text-green-400 mb-2">Inject Text (ready for agent context)</h2>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{inject}</pre>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="card text-center text-gray-500 py-10">No memories found for this query.</div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{results.length} results</p>
          {results.map(m => (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-gray text-xs">{m.memory_type}</span>
                    <span className="text-xs text-gray-500 font-mono">{m.agent_id ?? 'unknown'}</span>
                    <span className="text-xs text-gray-600 ml-auto">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{m.content.slice(0, 400)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-green-400">{(m.similarity * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">match</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
