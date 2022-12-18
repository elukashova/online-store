/* eslint-disable max-lines-per-function */
import './cards-field.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import Card from '../card/card';
import Filter from '../filter/filter';

export default class CardsField extends BaseComponent {
  private readonly categories: number[] = [1, 2, 3, 4, 5, 6];

  private readonly rating: number[] = [1, 2, 3, 4, 5];

  constructor() {
    super('div', 'cards-field cards');
  }

  public render(): void {
    const contentContainer: HTMLElement = rendered('div', this.element, 'content__container');
    const filtersContainer: HTMLElement = rendered('form', contentContainer, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('div', filtersContainer, 'filters__btns-wrapper');
    rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');
    // фильтр по категории
    const categoryFilter: Filter = new Filter(filtersContainer, 'Category');
    const categoryNames: HTMLElement = categoryFilter.renderCheckbox(this.categories, 'category');
    filtersContainer.append(categoryNames);
    // фильтра по рейтингу
    const ratingFilter: Filter = new Filter(filtersContainer, 'Rating');
    const ratingNames: HTMLElement = ratingFilter.renderCheckbox(this.categories, 'rating');
    filtersContainer.append(ratingNames);
    // фильтр по цене
    const priceFilter: Filter = new Filter(filtersContainer, 'Price');
    const pricesTitles: HTMLElement = priceFilter.renderInputRange(this.categories, 'price');
    filtersContainer.append(pricesTitles);
    // фильтр по стоку
    const stockFilter: Filter = new Filter(filtersContainer, 'Stock');
    const stockTitles: HTMLElement = stockFilter.renderInputRange(this.categories, 'stock');
    filtersContainer.append(stockTitles);

    const cardsContainer: HTMLElement = rendered('div', contentContainer, 'cards__container');
    const card: Card = new Card(cardsContainer);
    cardsData.products.forEach((data) => {
      const cardItem = card.render(data);
      cardsContainer.append(cardItem);
    });
  }
}
