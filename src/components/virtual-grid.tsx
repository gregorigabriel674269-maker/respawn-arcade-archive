import { useEffect, useRef, useState, type ReactNode } from "react";

export function VirtualGrid<T>({
  items,
  getKey,
  columns,
  rowHeight,
  gap = 12,
  overscan = 2,
  resetKey,
  renderItem,
}: {
  items: T[];
  getKey: (item: T) => string;
  columns: number;
  rowHeight: number;
  gap?: number;
  overscan?: number;
  resetKey: string;
  renderItem: (item: T) => ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(640);
  const [scrollTop, setScrollTop] = useState(0);
  const cols = Math.max(1, columns);
  const stride = rowHeight + gap;
  const rows = Math.ceil(items.length / cols);
  const start = Math.max(0, Math.floor(scrollTop / stride) - overscan);
  const end = Math.min(rows, start + Math.ceil(height / stride) + overscan * 2);
  const slice = items.slice(start * cols, end * cols);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setHeight(element.clientHeight || 640));
    observer.observe(element);
    setHeight(element.clientHeight || 640);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    setScrollTop(0);
  }, [resetKey, cols]);

  return (
    <div
      ref={scroller}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      className="h-[min(72dvh,56rem)] overflow-y-auto"
    >
      <div style={{ height: start * stride }} />
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
      >
        {slice.map((item) => (
          <div key={getKey(item)} style={{ height: rowHeight }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
      <div style={{ height: Math.max(0, (rows - end) * stride) }} />
    </div>
  );
}
