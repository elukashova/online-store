import { Rendered, Attribute } from './render.types';

const rendered: Rendered = (element: string, parent: Element, classes: string, attrData?: Attribute): HTMLElement => {
  const newElement: HTMLElement | null = document.createElement(element);
  if (newElement) {
    parent.appendChild(newElement);
    newElement.classList.add(...classes.split(' ')); //чтобы принимал и один, и несколько классов

    if (attrData) {
      //более чем уверена, что эту функцию придется менять(усложнять) в будущем, т.к. она рассчитана на один аттрибут
      newElement.setAttribute(attrData[0], attrData[1]);
    }
  }
  return newElement;
};

export default rendered;
