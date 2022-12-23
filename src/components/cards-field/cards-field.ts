/* eslint-disable max-lines-per-function */
import './cards-field.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import Card from '../card/card';
import Filter from '../filter/filter';

export default class CardsField extends BaseComponent {
  public cardsAll: Card[] = [];

  constructor() {
    super('div', 'content__container');
  }

  public render(): void {
    const filtersContainer: HTMLElement = rendered('form', this.element, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('div', filtersContainer, 'filters__btns-wrapper');
    rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');

    // фильтр по категории
    const categoryFilter: Filter = new Filter(filtersContainer, 'Category');
    let uniqueCategories = cardsData.products.map((item) => item.category);
    uniqueCategories = Array.from(new Set(uniqueCategories));
    const categoryNames: HTMLElement = categoryFilter.renderCheckbox(uniqueCategories, 'category');
    filtersContainer.append(categoryNames);

    // фильтр по размеру
    const ratingFilter: Filter = new Filter(filtersContainer, 'Rating');
    let uniqueSize = cardsData.products.map((item) => item.size);
    uniqueSize = Array.from(new Set(uniqueSize));
    const ratingNames: HTMLElement = ratingFilter.renderCheckbox(uniqueSize, 'rating');
    filtersContainer.append(ratingNames);

    // фильтр по цене
    const priceFilter: Filter = new Filter(filtersContainer, 'Price');
    const pricesTitles: HTMLElement = priceFilter.renderInputRange('price');
    filtersContainer.append(pricesTitles);

    // фильтр по стоку
    const stockFilter: Filter = new Filter(filtersContainer, 'Stock');
    const stockTitles: HTMLElement = stockFilter.renderInputRange('stock');
    filtersContainer.append(stockTitles);

    const cardsContainer: HTMLElement = rendered('div', this.element, 'cards__container');
    cardsData.products.forEach((data) => {
      const card: Card = new Card(data);
      this.cardsAll.push(card);
      cardsContainer.append(card.element);
    });
  }

  public filterByCategory(): void {}
}
