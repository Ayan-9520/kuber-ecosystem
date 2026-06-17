import { GitBranch, Clock, Flag, LogOut, Play, Repeat, Split, Zap } from 'lucide-react';

export interface PaletteNodeType {
  type: string;
  label: string;
  icon: React.ReactNode;
}

export const PALETTE_NODES: PaletteNodeType[] = [
  { type: 'TRIGGER', label: 'Trigger', icon: <Play size={14} /> },
  { type: 'CONDITION', label: 'Condition', icon: <Split size={14} /> },
  { type: 'ACTION', label: 'Action', icon: <Zap size={14} /> },
  { type: 'DELAY', label: 'Delay', icon: <Clock size={14} /> },
  { type: 'BRANCH', label: 'Branch', icon: <GitBranch size={14} /> },
  { type: 'LOOP', label: 'Loop', icon: <Repeat size={14} /> },
  { type: 'GOAL', label: 'Goal', icon: <Flag size={14} /> },
  { type: 'EXIT', label: 'Exit', icon: <LogOut size={14} /> },
];

interface NodePaletteProps {
  onAdd: (type: string, label: string) => void;
}

export function NodePalette({ onAdd }: NodePaletteProps) {
  return (
    <div className="automation-palette">
      <h4 style={{ margin: '0 0 12px', fontSize: '0.875rem' }}>Nodes</h4>
      {PALETTE_NODES.map((item) => (
        <div
          key={item.type}
          className="automation-palette-item"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/automation-node', JSON.stringify(item));
          }}
          onClick={() => onAdd(item.type, item.label)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onAdd(item.type, item.label)}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>
  );
}
