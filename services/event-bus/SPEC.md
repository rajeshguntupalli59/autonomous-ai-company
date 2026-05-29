# Service: Event Bus

Layer: 4
Type: Shared library (not a standalone server — imported by all services and agents)

## Responsibility
Async communication between agents and services via Redis Streams.

## Event Schema (all events must match this)
```python
@dataclass
class Event:
    id: str           # uuid
    type: str         # e.g. "task.completed"
    source: str       # agent or service name
    payload: dict     # event-specific data
    timestamp: str    # ISO 8601
```

## Event Types (define ALL upfront — changing breaks consumers)
```
task.created          payload: { task_id, type, payload }
task.completed        payload: { task_id, result }
task.failed           payload: { task_id, error, retries }

agent.started         payload: { agent_id, task_id }
agent.completed       payload: { agent_id, task_id, output }
agent.error           payload: { agent_id, task_id, error }

memory.updated        payload: { agent_id, memory_id }

deployment.started    payload: { project_id, target }
deployment.done       payload: { project_id, url }
deployment.failed     payload: { project_id, error }

workflow.step.started    payload: { workflow_id, step }
workflow.step.completed  payload: { workflow_id, step, output }
workflow.completed       payload: { workflow_id, result }
```

## Classes
```python
EventPublisher   → publish(event: Event, stream: str)
EventConsumer    → consume(stream, group, consumer, handler_fn)
DeadLetterQueue  → move failed events to postgres dead_letter table
EventReplayer    → replay events from a given timestamp
```

## Dead Letter Queue
- After 3 failed processing attempts → move to `dead_letter` postgres table
- Alert on any dead letter event (log + email)

## Key Files
```
packages/shared-tools/event_bus/
  publisher.py
  consumer.py
  schemas.py       ← all Event dataclasses defined here
  dead_letter.py
  replayer.py
```

## Tests (Layer 4 done when these pass)
- Publish event → consumer receives it within 100ms
- Consumer crash → event stays in stream, reprocessed on restart
- 3 failures → event moves to dead_letter table
- Replay from timestamp → all events re-delivered in order
