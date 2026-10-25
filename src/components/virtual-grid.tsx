import { useEffect, useRef, useState, type ReactNode } from "react";

/** Visible row window, clamped so a shrinking list never leaves an empty viewport. */
export function virtualWindow(itemCount: number, columns: number, stride: number, scrollTop: number, height: number, overscan: number) {
  const cols = Math.max(1, columns);
  const rows = Math.ceil(itemCount / cols);
  const visible = Math.ceil(height / stride);
  const maxStart = Math.max(0, rows - visible - overscan);
  const start = Math.min(maxStart, Math.max(0, Math.floor(scrollTop / stride) - overscan));
  const end = Math.min(rows, start + visible + overscan * 2);
  return { rows, start, end };
}

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
  const { rows, start, end } = virtualWindow(items.length, cols, stride, scrollTop, height, overscan);
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

  // When items are removed (e.g. unfavoriting) keep the scroll position inside the list.
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const maxTop = Math.max(0, rows * stride - element.clientHeight);
    if (element.scrollTop > maxTop) {
      element.scrollTop = maxTop;
      setScrollTop(maxTop);
    }
  }, [rows, stride]);

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
