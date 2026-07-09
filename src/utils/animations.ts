import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function killAllAnimations(): void {
  ScrollTrigger.getAll().forEach((st) => st.kill());
  gsap.globalTimeline.getChildren(true, true, true).forEach((t) => t.kill());
}

export function splitTextIntoChars(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent ?? '';
  if (!text.trim()) return [];
  el.textContent = '';
  el.classList.add('split-text');

  // Detect gradient-text or any element relying on bg-clip: text
  const usesBgClip = el.classList.contains('gradient-text') ||
    getComputedStyle(el).webkitBackgroundClip === 'text' ||
    getComputedStyle(el).backgroundClip === 'text';

  const chars: HTMLSpanElement[] = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = usesBgClip ? 'split-char split-char-gradient' : 'split-char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    if (usesBgClip) {
      // Heredar el gradiente al char individual
      span.style.backgroundImage = getComputedStyle(el).backgroundImage;
      span.style.backgroundClip = 'text';
      span.style.webkitBackgroundClip = 'text';
      span.style.webkitTextFillColor = 'transparent';
      span.style.color = 'transparent';
      span.style.display = 'inline-block';
    }
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}

interface MagneticOptions {
  strength?: number;
  duration?: number;
}

export function magneticHover(
  selector: string,
  options: MagneticOptions = {}
): void {
  const { strength = 0.35, duration = 0.5 } = options;
  const elements = document.querySelectorAll<HTMLElement>(selector);
  elements.forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(el, 'y', { duration, ease: 'elastic.out(1, 0.3)' });
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      xTo(x * strength * rect.width);
      yTo(y * strength * rect.height);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.dataset.magneticInit = '1';
  });
}

interface TiltOptions {
  intensity?: number;
  duration?: number;
}

export function tilt3D(
  selector: string,
  options: TiltOptions = {}
): void {
  const { intensity = 8, duration = 0.4 } = options;
  const elements = document.querySelectorAll<HTMLElement>(selector);
  elements.forEach((el) => {
    el.style.transformStyle = 'preserve-3d';
    const rotateXTo = gsap.quickTo(el, 'rotationX', { duration, ease: 'power2.out' });
    const rotateYTo = gsap.quickTo(el, 'rotationY', { duration, ease: 'power2.out' });
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      rotateXTo(ny * -intensity);
      rotateYTo(nx * intensity);
    };
    const onLeave = () => {
      rotateXTo(0);
      rotateYTo(0);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.dataset.tiltInit = '1';
  });
}

export function initCursorFollow(cursor: HTMLElement): () => void {
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3.out' });
  const onMove = (e: PointerEvent) => {
    xTo(e.clientX);
    yTo(e.clientY);
  };
  window.addEventListener('pointermove', onMove);
  return () => window.removeEventListener('pointermove', onMove);
}

export function animateCounter(
  el: HTMLElement,
  target: number,
  suffix = ''
): gsap.core.Tween {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: target,
    duration: 2,
    ease: 'power3.out',
    onUpdate: () => {
      el.textContent = Math.floor(obj.val).toString() + suffix;
    },
  });
}

export function animateCounterTo(
  el: HTMLElement,
  target: number,
  duration = 0.5
): gsap.core.Tween {
  const current = parseInt(el.textContent ?? '0', 10) || 0;
  const obj = { val: current };
  return gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toString();
    },
  });
}
