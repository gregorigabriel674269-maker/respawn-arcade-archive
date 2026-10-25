import { useEffect, useRef, useState } from 'react';
import { gradClass } from '@/lib/catalog';
import { coverAttemptUrl, coverImageOf } from '@/lib/game-covers';
import { cn } from '@/lib/utils';

export function GameCover({ name, images = true, className = '', sizes = '(max-width: 699px) 48vw, 240px' }: { name: string; images?: boolean; className?: string; sizes?: string }) {
  const image = coverImageOf(name);
  // Remount request state whenever identity or source changes (virtualized items included).
  return <CoverRequest key={`${name}|${image}|${images}`} name={name} image={images ? image : null} className={className} sizes={sizes} />;
}

function CoverRequest({ name, image, className, sizes }: { name: string; image: string | null; className: string; sizes: string }) {
  const frame = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = image ? coverAttemptUrl(image, attempt) : null;

  useEffect(() => {
    const element = frame.current;
    if (!element || !image) return;
    if (!('IntersectionObserver' in window)) { setNear(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setNear(true); observer.disconnect(); }
    }, { rootMargin: '160px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [image]);

  return (
    <span ref={frame} className={cn('relative block overflow-hidden', className)} data-cover-name={name} data-cover-state={loaded ? 'loaded' : attempt > 1 ? 'fallback' : 'waiting'}>
      <span aria-hidden="true" className={`absolute inset-0 stripes ${gradClass(name)}`} />
      {near && src ? <img
        key={src}
        src={src}
        srcSet={`${src} 480w`}
        alt={`Capa de ${name}`}
        width={480}
        height={720}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(false); setAttempt((value) => value + 1); }}
        className={`absolute inset-0 h-full w-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
      /> : null}
    </span>
  );
}