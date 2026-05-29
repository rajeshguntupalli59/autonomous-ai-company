// ─── Agent ────────────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'running' | 'error'

export interface Agent {
  id: string
  name: string
  role: string
  status: AgentStatus
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'

export type TaskType =
  | 'research'
  | 'generate_prd'
  | 'generate_architecture'
  | 'build_backend'
  | 'build_frontend'
  | 'run_qa'
  | 'deploy'

export interface Task {
  id: string
  type: TaskType
  payload: Record<string, unknown>
  status: TaskStatus
  agentId: string | null
  result: Record<string, unknown> | null
  error: string | null
  retries: number
  createdAt: string
  updatedAt: string
}

// ─── Memory ───────────────────────────────────────────────────────────────────

export type MemoryType = 'agent_memory' | 'task_memory' | 'event_memory' | 'knowledge_base'

export interface Memory {
  id: string
  agentId: string
  memoryType: MemoryType
  content: string
  expiresAt: string | null
  createdAt: string
}

export interface MemorySearchResult extends Memory {
  similarity: number
}

// ─── Event ────────────────────────────────────────────────────────────────────

export type EventType =
  | 'task.created' | 'task.completed' | 'task.failed'
  | 'agent.started' | 'agent.completed' | 'agent.error'
  | 'memory.updated'
  | 'deployment.started' | 'deployment.done' | 'deployment.failed'
  | 'workflow.step.started' | 'workflow.step.completed' | 'workflow.completed'

export interface AppEvent {
  id: string
  type: EventType
  source: string
  payload: Record<string, unknown>
  createdAt: string
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'created' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled'

export type WorkflowStepStatus =
  | 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface WorkflowStep {
  id: string
  name: string
  status: WorkflowStepStatus
  agentId: string | null
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  startedAt: string | null
  completedAt: string | null
  error: string | null
}

export interface Workflow {
  id: string
  name: string
  goal: string
  steps: WorkflowStep[]
  status: WorkflowStatus
  currentStep: string | null
  createdAt: string
  updatedAt: string
}

// ─── Token Log ────────────────────────────────────────────────────────────────

export interface TokenLog {
  id: string
  agentId: string
  taskId: string
  model: string
  inputTokens: number
  outputTokens: number
  cachedTokens: number
  costUsd: number
  createdAt: string
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error: string | null
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
}
