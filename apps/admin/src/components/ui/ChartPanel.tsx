import { useEffect, useRef, useState, type ReactElement } from 'react';

export interface ChartDimensions {
  width: number;
  height: number;
}

interface ChartPanelProps {
  height?: number;
  children: (dimensions: ChartDimensions) => ReactElement;
}

/** Renders Recharts only after the container has measurable size (avoids width/height -1 warnings). */
export function ChartPanel({ height = 280, children }: ChartPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const chartHeight = Math.floor(rect.height);
      if (width <= 0 || chartHeight <= 0) return;

      setDimensions((prev) =>
        prev?.width === width && prev?.height === chartHeight ? prev : { width, height: chartHeight },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [height]);

  return (
    <div ref={ref} className="chart-container" style={{ height }}>
      {dimensions ? children(dimensions) : null}
    </div>
  );
}
