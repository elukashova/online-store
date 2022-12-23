// import { DataType } from '../card/card.types';

export default function filter(category: string, data: HTMLCollectionOf<Element>[]): void {
  data.forEach((card) => {
    const item = card;
    console.log(card);
    console.log(category);
    if (item instanceof HTMLElement) {
      item.style.display = 'none';
    }

    /* const isItemFiltered = !card.classList.contains(category);
    const isShowAll = category.toLowerCase() === 'all';
    if (isItemFiltered && !isShowAll) {
      card.classList.add('anime');
    } else {
      card.classList.remove('hide');
      item.classList.remove('anime');
    } */
  });
}
