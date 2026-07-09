import gsap from 'gsap';

const SHOCKWAVE_COLORS = ['#00f5ff', '#bf00ff', '#ff00ff', '#818cf8'];
const PARTICLE_COLORS_DARK = ['#00f5ff', '#bf00ff', '#ff00ff', '#818cf8'];
const PARTICLE_COLORS_LIGHT = ['#2563eb', '#a855f7', '#7c3aed', '#3b82f6'];

interface PoolItem<T> {
  el: T;
  busy: boolean;
}

function createPool<T extends Element>(
  size: number,
  factory: () => T,
): PoolItem<T>[] {
  return Array.from({ length: size }, () => ({ el: factory(), busy: false }));
}

function takeFromPool<T extends Element>(pool: PoolItem<T>[]): T | null {
  for (const item of pool) {
    if (!item.busy) {
      item.busy = true;
      return item.el;
    }
  }
  return null;
}

export function initEffects(): void {
  // Idempotencia: garantizar una sola instancia activa de los listeners,
  // incluso si BaseLayout re-ejecuta initEffects en cada View Transition.
  if ((window as Window & { __effectsInit?: boolean }).__effectsInit) return;
  (window as Window & { __effectsInit?: boolean }).__effectsInit = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ─── Shockwave pool ───
  const shockwavePool: PoolItem<SVGSVGElement>[] = createPool(6, () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'shockwave');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '50');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);
    svg.style.opacity = '0';
    document.body.appendChild(svg);
    return svg;
  });

  // ─── Particle pool ───
  const particlePool: PoolItem<HTMLDivElement>[] = createPool(60, () => {
    const div = document.createElement('div');
    div.className = 'particle';
    div.style.opacity = '0';
    document.body.appendChild(div);
    return div;
  });

function releaseToPool<T extends Element>(pool: PoolItem<T>[], el: T) {
  const item = pool.find((p) => p.el === el);
  if (item) item.busy = false;
  // SVGSVGElement and HTMLElement both expose `style` at runtime
  (el as unknown as { style: { opacity: string } }).style.opacity = '0';
}

  // ─── Shockwave spawner ───
  if (finePointer && !reduceMotion) {
    let lastMoveAt = 0;
    let lastWaveAt = 0;
    let lastX = 0;
    let lastY = 0;

    const spawnWave = (x: number, y: number, isClick: boolean) => {
      const now = performance.now();
      if (now - lastWaveAt < (isClick ? 30 : 150)) return;
      lastWaveAt = now;

      const wave = takeFromPool(shockwavePool);
      if (!wave) return;
      const circle = wave.querySelector('circle') as SVGCircleElement | null;
      if (!circle) return;

      const color = SHOCKWAVE_COLORS[Math.floor(Math.random() * SHOCKWAVE_COLORS.length)];
      circle.setAttribute('stroke', color);
      wave.style.left = `${x - 50}px`;
      wave.style.top = `${y - 50}px`;
      wave.style.width = '100px';
      wave.style.height = '100px';

      const targetScale = isClick ? 5 : 2.5;
      const duration = isClick ? 0.7 : 0.4;

      gsap.set(wave, { opacity: 1, scale: 0 });
      gsap.set(circle, { strokeWidth: 3 });
      gsap.to(wave, {
        scale: targetScale,
        opacity: 0,
        duration,
        ease: 'power2.out',
        onComplete: () => releaseToPool(shockwavePool, wave),
      });
      gsap.to(circle, { strokeWidth: 0, duration, ease: 'power2.out' });
    };

    // GSAP context auto-cleanups cualquier addEventListener
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = now - lastMoveAt;
      lastMoveAt = now;
      if (dt <= 0) return;
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      const velocity = dist / dt;
      lastX = e.clientX;
      lastY = e.clientY;
      if (velocity > 0.8) spawnWave(e.clientX, e.clientY, false);
    };
    const onClick = (e: MouseEvent) => spawnWave(e.clientX, e.clientY, true);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('click', onClick);
  }

  // ─── Theme toggle burst ───
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn && !reduceMotion) {
    const onThemeClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const ox = rect.left + rect.width / 2;
      const oy = rect.top + rect.height / 2;
      const html = document.documentElement;
      const toLight = html.classList.contains('dark');
      const palette = toLight ? PARTICLE_COLORS_LIGHT : PARTICLE_COLORS_DARK;

      const count = 40;
      for (let i = 0; i < count; i++) {
        const p = takeFromPool(particlePool);
        if (!p) break;

        const color = palette[Math.floor(Math.random() * palette.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 220 + 80;
        const vx = Math.cos(angle) * speed;
        const vyUp = Math.sin(angle) * speed * 0.65 - 200;

        p.style.backgroundColor = color;
        p.style.boxShadow = `0 0 12px ${color}, 0 0 24px ${color}55`;
        const scale0 = Math.random() * 0.7 + 0.6;

        gsap.set(p, { x: ox, y: oy, scale: 0, opacity: 1 });
        gsap.set(p, { scale: scale0, duration: 0.1 });
        gsap.to(p, {
          x: ox + vx,
          y: oy + vyUp,
          scale: 0,
          opacity: 0,
          duration: 0.9 + Math.random() * 0.3,
          ease: 'power2.out',
          delay: Math.random() * 0.08,
          onComplete: () => releaseToPool(particlePool, p),
        });
        gsap.to(p, {
          y: '+=' + (300 + Math.random() * 200),
          duration: 1.1 + Math.random() * 0.3,
          ease: 'power1.in',
        });
      }
    };

    themeBtn.addEventListener('click', onThemeClick);
  }

  // ─── Card flip handler ───
  const reduceMotionFlip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flipCards = document.querySelectorAll<HTMLElement>('[data-flip-card]');

  flipCards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    if (!card.hasAttribute('aria-label')) card.setAttribute('aria-label', 'Flip card');

      const toggle = (e?: Event) => {
        e?.preventDefault?.();
        const flipped = card.classList.contains('is-flipped');
        card.classList.toggle('is-flipped');
        gsap.to(card, {
          rotationY: flipped ? 180 : 0,
          duration: reduceMotionFlip ? 0 : 0.7,
          ease: 'back.out(1.2)',
        });
      };

    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  });

  // Botón "↻" dentro de cada card que también dispare flip-back
  document.querySelectorAll<HTMLElement>('[data-flip-back]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest<HTMLElement>('[data-flip-card]');
      if (!card) return;
      card.classList.remove('is-flipped');
      gsap.to(card, { rotationY: 0, duration: 0.6, ease: 'back.out(1.2)' });
    });
  });
}
