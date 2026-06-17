import { useCallback, useRef, useState } from 'react';

import '../automation.css';

export interface BuilderNode {
  nodeKey: string;
  type: string;
  label: string;
  positionX: number;
  positionY: number;
  config?: Record<string, unknown>;
  nextNodeKeys?: string[];
  conditions?: Array<{ field: string; operator: string; value?: unknown }>;
  actions?: Array<{ actionType: string; templateCode?: string; channel?: string }>;
}

interface JourneyCanvasProps {
  nodes: BuilderNode[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  onMove: (key: string, x: number, y: number) => void;
  onDropPalette: (type: string, label: string, x: number, y: number) => void;
}

function nodeCenter(node: BuilderNode) {
  return { x: node.positionX + 90, y: node.positionY + 28 };
}

export function JourneyCanvas({ nodes, selectedKey, onSelect, onMove, onDropPalette }: JourneyCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/automation-node');
      if (!raw || !canvasRef.current) return;
      const item = JSON.parse(raw) as { type: string; label: string };
      const rect = canvasRef.current.getBoundingClientRect();
      onDropPalette(item.type, item.label, e.clientX - rect.left - 90, e.clientY - rect.top - 28);
    },
    [onDropPalette],
  );

  const lines = nodes.flatMap((node) =>
    (node.nextNodeKeys ?? []).map((targetKey) => {
      const target = nodes.find((n) => n.nodeKey === targetKey);
      if (!target) return null;
      const from = nodeCenter(node);
      const to = nodeCenter(target);
      return { key: `${node.nodeKey}-${targetKey}`, from, to };
    }).filter(Boolean),
  ) as Array<{ key: string; from: { x: number; y: number }; to: { x: number; y: number } }>;

  return (
    <div
      className="automation-canvas-wrap"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="automation-canvas" ref={canvasRef}>
        <svg className="connections">
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke="var(--color-primary)"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          ))}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-primary)" />
            </marker>
          </defs>
        </svg>

        {nodes.map((node) => (
          <div
            key={node.nodeKey}
            className={`automation-node${selectedKey === node.nodeKey ? ' selected' : ''}`}
            data-type={node.type}
            style={{ left: node.positionX, top: node.positionY }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect(node.nodeKey);
              setDragKey(node.nodeKey);
              dragOffset.current = { x: e.clientX - node.positionX, y: e.clientY - node.positionY };
            }}
            onMouseMove={(e) => {
              if (dragKey !== node.nodeKey) return;
              onMove(node.nodeKey, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
            }}
            onMouseUp={() => setDragKey(null)}
            onMouseLeave={() => setDragKey(null)}
          >
            <div className="automation-node-type">{node.type}</div>
            <div className="automation-node-label">{node.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
