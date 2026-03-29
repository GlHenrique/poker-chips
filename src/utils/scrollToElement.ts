const defaultOptions: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "start",
};

/**
 * Scrolls the page to the element with the given id.
 * Schedules execution for the next render cycle (after the DOM updates).
 */
export function scrollToElementById(
  id: string,
  options: ScrollIntoViewOptions = defaultOptions,
): void {
  const scroll = () => {
    const el = document.getElementById(id);
    el?.scrollIntoView(options);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(scroll);
  });
}
