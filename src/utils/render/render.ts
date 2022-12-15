/* eslint-disable max-len */
// import { Attribute } from './render.types';

const rendered = (
  element: string,
  parent: Element,
  classes: string,
  content?: string,
  attributes?: { [key: string]: string } | undefined,
): HTMLElement => {
  const newElement: HTMLElement | null = document.createElement(element);
  parent.append(newElement);
  newElement.classList.add(...classes.split(' ')); // чтобы принимал и один, и несколько классов

  if (content) {
    newElement.textContent = content;
  }

  if (attributes) {
    Object.entries(attributes).forEach((attribute) => {
      // разбиваем объект атрибутов на массив и передаем в элемент
      newElement.setAttribute(attribute[0], attribute[1]);
    });
  }
  return newElement;
};

export default rendered;
