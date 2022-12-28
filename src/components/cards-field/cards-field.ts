import './cards-field.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import Card from '../card/card';
import Filter from '../filter/filter';
import Header from '../header/header';
import { ObservedSubject } from '../card/card.types';
import { setDataToLocalStorage, checkDataInLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';

export default class CardsField extends BaseComponent {
  public cardsAll: Card[] = [];

  public activeFilters: string[] = [];

  public visibleCards: Card[] = [];

  public addedItems: number[] = []; // для сохранения id добавленных товаров в local storage

  private readonly storageInfo: JsonObj | null = checkDataInLocalStorage('addedItems');

  constructor(public readonly header: Header) {
    super('div', 'content__container');
    this.render();
    this.checkLocalStorage();
  }

  public render(): void {
    const filtersContainer: HTMLElement = rendered('form', this.element, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('div', filtersContainer, 'filters__btns-wrapper');
    rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');

    // фильтр по категории
    const categoryFilter: Filter = new Filter(filtersContainer, 'Category', this.updateActiveFilters);
    let uniqueCategories = cardsData.products.map((item) => item.category);
    uniqueCategories = Array.from(new Set(uniqueCategories));
    const categoryNames: HTMLElement = categoryFilter.renderCheckbox(uniqueCategories, 'category' /* this.cardsAll */);
    filtersContainer.append(categoryNames);

    // фильтр по размеру
    const sizeFilter: Filter = new Filter(filtersContainer, 'Size', this.updateActiveFilters);
    let uniqueSize = cardsData.products.map((item) => item.size);
    uniqueSize = Array.from(new Set(uniqueSize));
    const sizeNames: HTMLElement = sizeFilter.renderCheckbox(uniqueSize, 'size' /* this.cardsAll */);
    filtersContainer.append(sizeNames);

    // фильтр по цене
    const priceFilter: Filter = new Filter(filtersContainer, 'Price', this.updateActiveFilters);
    const pricesTitles: HTMLElement = priceFilter.renderInputRange('price');
    filtersContainer.append(pricesTitles);

    // фильтр по стоку
    const stockFilter: Filter = new Filter(filtersContainer, 'Stock', this.updateActiveFilters);
    const stockTitles: HTMLElement = stockFilter.renderInputRange('stock');
    filtersContainer.append(stockTitles);

    const cardsContainer: HTMLElement = rendered('div', this.element, 'cards__container');

    cardsData.products.forEach((data) => {
      const card: Card = new Card(data);
      card.attachObserver(this.header);
      card.attachObserver(this);
      this.cardsAll.push(card);
      cardsContainer.append(card.element);
    });
  }

  // функция апдейта активных фильтров
  public updateActiveFilters = (filter: string): void => {
    if (this.activeFilters.includes(filter)) {
      this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
    } else if (filter.split(',')[0] === 'Price') {
      const prevPrice = this.activeFilters.find((elem) => elem.startsWith(filter.split(',')[0]));
      if (prevPrice !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevPrice), 1, filter);
      } else {
        this.activeFilters.push(filter);
      }
    } else if (filter.split(',')[0] === 'Count') {
      console.log('Count active');
      const prevCount = this.activeFilters.find((elem) => elem.startsWith(filter.split(',')[0]));
      if (prevCount !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevCount), 1, filter);
      } else {
        this.activeFilters.push(filter);
      }
    } else if (!this.activeFilters.includes(filter)) {
      this.activeFilters.push(filter);
    }
    console.log(this.activeFilters);
    this.filterByCategoryAndSize(this.activeFilters, this.cardsAll);
  };

  /*  public filtersAll(activeFilters: string[], cards: Card[]): void {
    this.filterByCategoryAndSize(activeFilters, cards);
    this.filterByPriceAndCount(activeFilters, cards);
  } */

  public filterByCategoryAndSize(activeFilters: string[], cards: Card[]): void {
    cards.forEach((card) => {
      if (activeFilters.length === 0) {
        // если массив пустой делаем все карточки видимыми
        card.element.classList.add('visible');
        card.element.classList.remove('hidden');
      } else {
        card.element.classList.add('hidden');
        card.element.classList.remove('visible');
      }
    });
    let filtredBySize: Card[] = [];
    let filtredByCategory: Card[] = [];
    /*     let filtredByPrice: Card[] = [];
    let filtredByCount: Card[] = []; */
    // eslint-disable-next-line max-len
    filtredBySize = cards.filter((card) => activeFilters.some((filter) => card.size.includes(filter)));
    // eslint-disable-next-line max-len
    filtredByCategory = cards.filter((card) => activeFilters.some((filter) => card.category.includes(filter)));

    if (filtredBySize.length > 0 && filtredByCategory.length > 0) {
      // eslint-disable-next-line max-len
      this.visibleCards = [...filtredBySize.filter((item) => filtredByCategory.indexOf(item) !== -1)];
    } else if (filtredBySize.length > 0 && filtredByCategory.length === 0) {
      this.visibleCards = [...filtredBySize];
    } else if (filtredBySize.length === 0 && filtredByCategory.length > 0) {
      this.visibleCards = [...filtredByCategory];
    }
    this.visibleCards.forEach((visibleCard) => {
      visibleCard.element.classList.add('visible');
      visibleCard.element.classList.remove('hidden');
    });
  }

  /* public filterByPriceAndCount(activeFilters: string[], cards: Card[]): void {} */

  /* функция обсервера, реагирующая на добавление карточек,
    чтобы сохранять добавленные товары в local storage */
  public update(subject: ObservedSubject): void {
    if (subject instanceof Card && subject.element.classList.contains('added')) {
      this.addedItems.push(subject.id);
      console.log(this.addedItems);
      setDataToLocalStorage(this.addedItems);
    }

    if (subject instanceof Card && !subject.element.classList.contains('added')) {
      const index = this.addedItems.indexOf(subject.id);
      this.addedItems.splice(index, 1);
      setDataToLocalStorage(this.addedItems);
    }
  }

  /* проверка данных в local storage, чтобы по возвращению из корзины на главную
    не обнулялись данные о добавленных товарах */
  private checkLocalStorage(): void {
    if (this.storageInfo !== null) {
      const values: number[] = Object.values(this.storageInfo);
      this.addedItems = values.slice();
    }
  }
}
