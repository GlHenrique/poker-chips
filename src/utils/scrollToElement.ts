const defaultOptions: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "start",
};

/**
 * Rola a página até o elemento com o id informado.
 * Agenda a execução para o próximo ciclo de renderização (após o DOM atualizar).
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
