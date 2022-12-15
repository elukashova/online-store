import { Attribute } from './render.types';

const rendered = (element: string, parent: Element, classes: string, attributes?: Attribute): HTMLElement => {
  const newElement: HTMLElement | null = document.createElement(element);
  parent.append(newElement);
  newElement.classList.add(...classes.split(' ')); //чтобы принимал и один, и несколько классов

  if (attributes) {
    //более чем уверена, что эту функцию придется менять(усложнять) в будущем, т.к. она рассчитана на один аттрибут
    newElement.setAttribute(attributes.attribute, attributes.content);
  }
  return newElement;
};

export default rendered;
