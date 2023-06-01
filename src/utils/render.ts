const rendered = <K extends keyof HTMLElementTagNameMap>(
  element: K,
  parent: Element,
  classes: string,
  content?: string,
  attributes?: { [key: string]: string } | undefined,
): HTMLElementTagNameMap[K] => {
  const newElement = document.createElement(element);
  parent.append(newElement);
  newElement.classList.add(...classes.split(' ')); // чтобы принимал и один, и несколько классов

  if (content) {
    newElement.textContent = content;
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      // разбиваем объект атрибутов на массив и передаем в элемент
      newElement.setAttribute(key, value);
    });
  }
  return newElement;
};

export default rendered;
