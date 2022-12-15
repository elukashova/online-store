/* eslint-disable max-len */
import { Attribute } from './render.types';

const rendered = (element: string, parent: Element, classes: string, attributes?: Attribute): HTMLElement => {
  const newElement: HTMLElement | null = document.createElement(element);
  parent.append(newElement);
  newElement.classList.add(...classes.split(' ')); // чтобы принимал и один, и несколько классов

  if (attributes) {
    newElement.setAttribute(attributes.attribute, attributes.content);
  }
  return newElement;
};

export default rendered;
