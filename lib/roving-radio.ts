import type { KeyboardEvent } from "react";

// ARIA Authoring Practices radiogroup pattern: the group is a single Tab
// stop (roving tabindex — only the checked/first option gets tabIndex 0)
// and Arrow keys move both focus and selection among options.
export function handleRadioGroupKeyDown(
  event: KeyboardEvent<HTMLElement>,
  currentIndex: number,
  count: number,
  onSelect: (index: number) => void,
) {
  const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
  const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
  if (!forward && !backward) return;

  event.preventDefault();
  const nextIndex = forward
    ? (currentIndex + 1) % count
    : (currentIndex - 1 + count) % count;

  onSelect(nextIndex);

  const group = event.currentTarget;
  const options = group.querySelectorAll<HTMLElement>('[role="radio"]');
  options[nextIndex]?.focus();
}
