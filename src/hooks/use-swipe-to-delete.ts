"use client";

import { useCallback, useRef } from "react";

const DRAG_DETECT_PX = 6; // movimento mínimo para considerar arrasto (vs tap)
const SWIPE_TRIGGER_PX = -88; // distância para acionar exclusão
const MAX_DRAG_PX = -180; // teto da rolagem visual

export interface SwipeBag {
  /** Atribuir ao elemento que sofre o transform e recebe os pointer events. */
  ref: React.RefObject<HTMLDivElement | null>;
  dragHandlers: {
    onPointerDown: React.PointerEventHandler<HTMLDivElement>;
    onPointerMove: React.PointerEventHandler<HTMLDivElement>;
    onPointerUp: React.PointerEventHandler<HTMLDivElement>;
    onPointerCancel: React.PointerEventHandler<HTMLDivElement>;
  };
  /** Click guardado: ignora cliques que vieram após um arrasto real. */
  onClick: React.MouseEventHandler;
}

/**
 * Swipe-to-delete sem framer-motion. Usa pointer events + CSS variable
 * (`--swipe-x`) escrita direto no DOM (zero re-render durante o drag).
 *
 * Como usar:
 * ```tsx
 * const swipe = useSwipeToDelete({ onTap: edit, onDelete: remove });
 * <div
 *   ref={swipe.ref}
 *   {...swipe.dragHandlers}
 *   style={{ transform: 'translateX(var(--swipe-x, 0px))', touchAction: 'pan-y' }}
 *   className="transition-transform duration-200 data-[dragging=true]:transition-none"
 * >
 *   <button onClick={swipe.onClick}>...</button>
 * </div>
 * ```
 *
 * `touch-action: pan-y` deixa o browser cuidar do scroll vertical sem
 * envolver o JS — só capturamos o gesto horizontal.
 */
export function useSwipeToDelete({
  onTap,
  onDelete,
}: {
  onTap: () => void;
  onDelete: () => void;
}): SwipeBag {
  const elRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);

  const setSwipeX = (px: number) => {
    elRef.current?.style.setProperty("--swipe-x", `${px}px`);
  };
  const setDraggingAttr = (val: boolean) => {
    if (elRef.current) {
      elRef.current.dataset.dragging = val ? "true" : "false";
    }
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startXRef.current = e.clientX;
      draggingRef.current = false;
      draggedRef.current = false;
      // ativa a classe que desliga a transition durante o drag para o dedo
      // mover o item em tempo real, sem easing.
      setDraggingAttr(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* alguns browsers podem rejeitar capture em determinados elementos */
      }
    },
    [],
  );

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.buttons === 0) return;
      const dx = e.clientX - startXRef.current;
      if (!draggingRef.current) {
        if (Math.abs(dx) < DRAG_DETECT_PX) return;
        draggingRef.current = true;
      }
      const clamped = Math.max(MAX_DRAG_PX, Math.min(0, dx));
      setSwipeX(clamped);
    },
    [],
  );

  const finishDrag = useCallback(
    (dx: number) => {
      // re-liga a transition para o snap-back/swipe-out ficarem suaves.
      setDraggingAttr(false);
      const wasDragging = draggingRef.current;
      draggingRef.current = false;
      draggedRef.current = wasDragging;
      if (wasDragging && dx < SWIPE_TRIGGER_PX) {
        setSwipeX(-window.innerWidth);
        window.setTimeout(() => onDelete(), 180);
      } else {
        setSwipeX(0);
      }
    },
    [onDelete],
  );

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const dx = e.clientX - startXRef.current;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      finishDrag(dx);
    },
    [finishDrag],
  );

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = useCallback(
    () => {
      finishDrag(0);
    },
    [finishDrag],
  );

  const onClick: React.MouseEventHandler = useCallback(
    (e) => {
      if (draggedRef.current) {
        draggedRef.current = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onTap();
    },
    [onTap],
  );

  return {
    ref: elRef,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    onClick,
  };
}
