import './cards-field.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import Card from '../card/card';

export default class CardsField extends BaseComponent {
  private readonly categories: number[] = [1, 2, 3, 4, 5, 6];

  private readonly rating: number[] = [1, 2, 3, 4, 5];

  constructor() {
    super('main', 'cards-field cards');
  }

  public render(): void {
    const contentContainer: HTMLElement = rendered('div', this.element, 'content__container');
    const filtersContainer: HTMLElement = rendered('form', contentContainer, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('button', filtersContainer, 'filters__btn');
    rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');
    const categoryFilter: HTMLElement = rendered('fieldset', filtersContainer, 'filters__category category');
    rendered('legend', categoryFilter, 'category__legend-1', 'Category');
    this.categories.forEach((num) => {
      const inputWrapper: HTMLElement = rendered('div', categoryFilter, 'category__input-wrapper');
      rendered('input', inputWrapper, `category__input-${num}`, '', {
        id: `category-${num}`,
        type: 'checkbox',
        name: `category-${num}`,
      });
      rendered('label', inputWrapper, `category__label-${num}`, `Category${num}`, {
        for: `category-${num}`,
      });
    });
    const ratingFilter: HTMLElement = rendered('fieldset', filtersContainer, 'filters__rating rating');
    rendered('legend', ratingFilter, 'rating__legend-1', 'Rating');
    this.rating.forEach((num) => {
      const inputWrapper: HTMLElement = rendered('div', ratingFilter, 'rating__input-wrapper');
      rendered('input', inputWrapper, `rating__input-${num}`, '', {
        id: `rating-${num}`,
        type: 'checkbox',
        name: `rating-${num}`,
      });
      rendered('label', inputWrapper, `rating__label-${num}`, 'Rating', {
        for: `rating-${num}`,
      });
    });
    const cardsContainer: HTMLElement = rendered('div', contentContainer, 'cards__container');
    const card: Card = new Card(cardsContainer);
    cardsData.products.forEach((data) => {
      const cardItem = card.render(data);
      cardsContainer.append(cardItem);
    });
  }
}
