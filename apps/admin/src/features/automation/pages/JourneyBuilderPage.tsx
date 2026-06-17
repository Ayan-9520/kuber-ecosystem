import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, LoadingSpinner, PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { JourneyCanvas, type BuilderNode } from '@/features/automation/components/JourneyCanvas';
import { NodePalette } from '@/features/automation/components/NodePalette';
import { NodePropertiesPanel } from '@/features/automation/components/NodePropertiesPanel';
import { fieldStr } from '@/lib/utils';
import { automationService } from '@/services/automation.service';

function uid() {
  return `node_${Math.random().toString(36).slice(2, 9)}`;
}

export function JourneyBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const workflow = useQuery({
    queryKey: ['automation', 'workflow', id],
    queryFn: () => automationService.workflow(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    const data = workflow.data;
    if (!data) return;
    const rawNodes = (data.nodes as BuilderNode[] | undefined) ?? [];
    setNodes(
      rawNodes.map((n) => ({
        nodeKey: n.nodeKey,
        type: n.type,
        label: n.label,
        positionX: n.positionX ?? 0,
        positionY: n.positionY ?? 0,
        config: (n.config as Record<string, unknown>) ?? undefined,
        nextNodeKeys: Array.isArray(n.nextNodeKeys) ? n.nextNodeKeys.map(String) : [],
        conditions: n.conditions,
        actions: n.actions,
      })),
    );
  }, [workflow.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      automationService.updateWorkflow(id!, {
        nodes,
        canvasJson: { zoom: 1, nodes: nodes.map((n) => n.nodeKey) },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['automation'] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => automationService.approveWorkflow(id!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['automation', 'workflow', id] }),
  });

  const addNode = useCallback((type: string, label: string, x = 120, y = 120) => {
    const node: BuilderNode = {
      nodeKey: uid(),
      type,
      label: `${label} ${nodes.length + 1}`,
      positionX: x + nodes.length * 24,
      positionY: y + nodes.length * 16,
      nextNodeKeys: [],
      config: type === 'DELAY' ? { delayType: 'HOURS', value: 24 } : undefined,
      actions: type === 'ACTION' ? [{ actionType: 'SEND_EMAIL', templateCode: 'CAMPAIGN_EMAIL' }] : undefined,
      conditions: type === 'CONDITION' ? [{ field: 'leadScore', operator: 'gte', value: 70 }] : undefined,
    };
    setNodes((prev) => [...prev, node]);
    setSelectedKey(node.nodeKey);
  }, [nodes.length]);

  const updateNode = useCallback((nodeKey: string, patch: Partial<BuilderNode>) => {
    setNodes((prev) => prev.map((n) => (n.nodeKey === nodeKey ? { ...n, ...patch } : n)));
  }, []);

  const moveNode = useCallback((nodeKey: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.nodeKey === nodeKey ? { ...n, positionX: Math.max(0, x), positionY: Math.max(0, y) } : n)));
  }, []);

  const connectNodes = useCallback((fromKey: string, toKey: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.nodeKey === fromKey
          ? { ...n, nextNodeKeys: [...new Set([...(n.nextNodeKeys ?? []), toKey])] }
          : n,
      ),
    );
  }, []);

  if (workflow.isLoading) return <LoadingSpinner />;
  if (!workflow.data) return <p>Workflow not found</p>;

  const wf = workflow.data;

  return (
    <div>
      <PageHeader
        title={fieldStr(wf, 'name')}
        subtitle={`Journey Builder · ${fieldStr(wf, 'journeyType')}`}
        actions={
          <>
            <StatusBadge status={fieldStr(wf, 'status')} />
            <Button variant="secondary" onClick={() => navigate('/automation')}>
              Back
            </Button>
            <Button variant="secondary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Save
            </Button>
            <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              Approve & Activate
            </Button>
          </>
        }
      />

      <div className="automation-builder">
        <NodePalette onAdd={(type, label) => addNode(type, label)} />
        <JourneyCanvas
          nodes={nodes}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onMove={moveNode}
          onDropPalette={addNode}
        />
        <NodePropertiesPanel
          node={nodes.find((n) => n.nodeKey === selectedKey) ?? null}
          onChange={updateNode}
          onConnect={connectNodes}
          allNodes={nodes}
        />
      </div>
    </div>
  );
}
