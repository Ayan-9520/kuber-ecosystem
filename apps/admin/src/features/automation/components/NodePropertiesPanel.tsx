import type { BuilderNode } from './JourneyCanvas';

const ACTION_TYPES = [
  'SEND_EMAIL',
  'SEND_SMS',
  'SEND_WHATSAPP',
  'SEND_PUSH',
  'CREATE_CRM_TASK',
  'ASSIGN_LEAD',
  'REASSIGN_LEAD',
  'UPDATE_LEAD_SCORE',
  'UPDATE_STATUS',
  'CREATE_FOLLOW_UP',
  'CREATE_TICKET',
  'ESCALATE_TICKET',
  'TRIGGER_AI_RECOMMENDATION',
  'GENERATE_AI_CONTENT',
];

const DELAY_TYPES = ['MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'UNTIL_DATE', 'UNTIL_EVENT'];

interface NodePropertiesPanelProps {
  node: BuilderNode | null;
  onChange: (nodeKey: string, patch: Partial<BuilderNode>) => void;
  onConnect: (fromKey: string, toKey: string) => void;
  allNodes: BuilderNode[];
}

export function NodePropertiesPanel({ node, onChange, onConnect, allNodes }: NodePropertiesPanelProps) {
  if (!node) {
    return (
      <div className="automation-properties">
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Select a node to edit properties</p>
      </div>
    );
  }

  const config = (node.config ?? {}) as Record<string, unknown>;
  const actions = node.actions ?? [];
  const conditions = node.conditions ?? [];

  return (
    <div className="automation-properties">
      <h4>{node.label}</h4>
      <div className="automation-field">
        <label>Label</label>
        <input value={node.label} onChange={(e) => onChange(node.nodeKey, { label: e.target.value })} />
      </div>

      {node.type === 'DELAY' && (
        <>
          <div className="automation-field">
            <label>Delay Type</label>
            <select
              value={String(config.delayType ?? 'HOURS')}
              onChange={(e) => onChange(node.nodeKey, { config: { ...config, delayType: e.target.value } })}
            >
              {DELAY_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="automation-field">
            <label>Value</label>
            <input
              type="number"
              min={1}
              value={Number(config.value ?? 1)}
              onChange={(e) => onChange(node.nodeKey, { config: { ...config, value: Number(e.target.value) } })}
            />
          </div>
        </>
      )}

      {node.type === 'ACTION' && (
        <div className="automation-field">
          <label>Action Type</label>
          <select
            value={actions[0]?.actionType ?? 'SEND_EMAIL'}
            onChange={(e) =>
              onChange(node.nodeKey, {
                actions: [{ actionType: e.target.value, templateCode: actions[0]?.templateCode ?? 'CAMPAIGN_EMAIL' }],
              })
            }
          >
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {node.type === 'ACTION' && (
        <div className="automation-field">
          <label>Template Code</label>
          <input
            value={actions[0]?.templateCode ?? ''}
            onChange={(e) =>
              onChange(node.nodeKey, {
                actions: [{ actionType: actions[0]?.actionType ?? 'SEND_EMAIL', templateCode: e.target.value }],
              })
            }
          />
        </div>
      )}

      {node.type === 'CONDITION' && (
        <>
          <div className="automation-field">
            <label>Field</label>
            <input
              value={conditions[0]?.field ?? 'leadScore'}
              onChange={(e) =>
                onChange(node.nodeKey, {
                  conditions: [{ field: e.target.value, operator: conditions[0]?.operator ?? 'gte', value: conditions[0]?.value ?? 70 }],
                })
              }
            />
          </div>
          <div className="automation-field">
            <label>Operator</label>
            <select
              value={conditions[0]?.operator ?? 'gte'}
              onChange={(e) =>
                onChange(node.nodeKey, {
                  conditions: [{ field: conditions[0]?.field ?? 'leadScore', operator: e.target.value, value: conditions[0]?.value ?? 70 }],
                })
              }
            >
              {['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains'].map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          <div className="automation-field">
            <label>Value</label>
            <input
              value={String(conditions[0]?.value ?? '')}
              onChange={(e) =>
                onChange(node.nodeKey, {
                  conditions: [{ field: conditions[0]?.field ?? 'leadScore', operator: conditions[0]?.operator ?? 'gte', value: e.target.value }],
                })
              }
            />
          </div>
        </>
      )}

      {node.type === 'GOAL' && (
        <div className="automation-field">
          <label>Goal Type</label>
          <input
            value={String(config.goalType ?? 'APPLICATION_SUBMITTED')}
            onChange={(e) => onChange(node.nodeKey, { config: { ...config, goalType: e.target.value } })}
          />
        </div>
      )}

      <div className="automation-field">
        <label>Connect To</label>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onConnect(node.nodeKey, e.target.value);
          }}
        >
          <option value="">Select next node…</option>
          {allNodes
            .filter((n) => n.nodeKey !== node.nodeKey)
            .map((n) => (
              <option key={n.nodeKey} value={n.nodeKey}>
                {n.label}
              </option>
            ))}
        </select>
      </div>

      {node.nextNodeKeys?.length ? (
        <div className="automation-field">
          <label>Next Nodes</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{node.nextNodeKeys.join(' → ')}</p>
        </div>
      ) : null}
    </div>
  );
}
