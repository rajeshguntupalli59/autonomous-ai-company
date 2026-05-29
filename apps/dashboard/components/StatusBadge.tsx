export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: 'badge-green',
    completed: 'badge-blue',
    awaiting_approval: 'badge-yellow',
    failed: 'badge-red',
    cancelled: 'badge-gray',
    idle: 'badge-gray',
    error: 'badge-red',
    created: 'badge-gray',
    pending: 'badge-gray',
  }
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>
}
