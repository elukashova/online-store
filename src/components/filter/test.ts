// import { DataType } from '../card/card.types';

import Card from '../card/card';

export default function filterCards(categories: string[], data: Card[]): void {
  data.forEach((card) => {
    categories.forEach((category) => {
      const newArr = data.filter((card) => card.category === category);
      if (card.category === category) {
        card.element.classList.add('visible');
      }
      if (card.category !== category && !card.element.classList.contains('visible')) {
        card.element.classList.add('hidden');
      }
      // console.log(card.element.classList);
      return card.element;
    });
    console.log(card.element);
  });
}
