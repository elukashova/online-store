/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
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
  public cardsAll: Card[] = []; // все карточки

  public activeFilters: string[] = []; // активные фильтры

  public visibleCards: Card[] = []; // текущие видимые карточки (для сортировки)

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
    const reset = rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    reset.addEventListener('click', this.resetFilters);
    rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');
    // фильтр по категории
    const categoryFilter: Filter = new Filter(filtersContainer, 'Category', this.updateActiveFilters);
    let uniqueCategories = cardsData.products.map((item) => item.category);
    uniqueCategories = Array.from(new Set(uniqueCategories));
    const categoryNames: HTMLElement = categoryFilter.renderCheckbox(uniqueCategories, 'category');
    filtersContainer.append(categoryNames);
    // фильтр по размеру
    const sizeFilter: Filter = new Filter(filtersContainer, 'Size', this.updateActiveFilters);
    let uniqueSize = cardsData.products.map((item) => item.size);
    uniqueSize = Array.from(new Set(uniqueSize));
    const sizeNames: HTMLElement = sizeFilter.renderCheckbox(uniqueSize, 'size');
    filtersContainer.append(sizeNames);
    // фильтр по цене
    const priceFilter: Filter = new Filter(filtersContainer, 'Price', this.updateActiveFilters);
    const pricesTitles: HTMLElement = priceFilter.renderInputRange('price');
    filtersContainer.append(pricesTitles);
    // фильтр по стоку
    const stockFilter: Filter = new Filter(filtersContainer, 'Stock', this.updateActiveFilters);
    const stockTitles: HTMLElement = stockFilter.renderInputRange('stock');
    filtersContainer.append(stockTitles);

    const contentContainer: HTMLElement = rendered('div', this.element, 'cards__content');
    const sortWrapper = rendered('div', contentContainer, 'cards__sort-wrapper');
    const selectInput = rendered('select', sortWrapper, 'cards__sort-products');
    rendered('option', selectInput, 'cards__sort-by-price', 'Sort posters', {
      value: 'price',
      disabled: '',
      selected: '',
    });
    rendered('option', selectInput, 'cards__sort-by-price', 'Sort by price', { value: 'price' });
    rendered('option', selectInput, 'cards__sort-by-rating', 'Sort by rating', { value: 'rating' });
    rendered('div', sortWrapper, 'cards__found-count', 'Found: 100');
    const searchInputWrapper = rendered('div', sortWrapper, 'cards__search-wrapper');
    rendered('input', searchInputWrapper, 'cards__search', '', {
      type: 'search',
      placeholder: 'Search poster',
    });
    rendered('img', searchInputWrapper, 'cards__search-icon', '', { src: 'assets/icons/search.svg' });
    const viewTypes = rendered('div', sortWrapper, 'cards__view-types');
    rendered('img', viewTypes, 'cards__view-line', '', { src: 'assets/icons/list-line.png' });
    rendered('img', viewTypes, 'cards__view-block', '', { src: 'assets/icons/list-block.png' });
    const cardsContainer: HTMLElement = rendered('div', contentContainer, 'cards__container', '', {
      id: 'cards__container',
    });
    rendered('p', cardsContainer, 'cards__not-found hidden', 'Product not found', { id: 'cards__not-found' });
    cardsData.products.forEach((data) => {
      const card: Card = new Card(data);
      card.attachObserver(this.header);
      card.attachObserver(this);
      this.cardsAll.push(card);
      cardsContainer.append(card.element);
    });
  }

  // функция reset всех фильтров
  public resetFilters = (): void => {
    this.activeFilters = [];
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  // Функция апдейта активных фильтров. В фильтры цены и стока приходят значения
  // в формате 'Price, 75, 125'. Проверяем есть ли значение, начинающееся на Price
  // в массиве. Если нет - пушим, есть - заменяем.
  public updateActiveFilters = (filter: string): void => {
    const getFilterType = (value: string): string => value.split(',')[0];
    const pushToActive = (array: string[], value: string): number => array.push(value);
    if (getFilterType(filter) === 'Price') {
      const prevPrice = this.activeFilters.find((elem) => elem.startsWith(getFilterType(filter)));
      if (prevPrice !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevPrice), 1, filter);
      } else {
        pushToActive(this.activeFilters, filter);
      }
    } else if (getFilterType(filter) === 'Count') {
      const prevCount = this.activeFilters.find((elem) => elem.startsWith(getFilterType(filter)));
      if (prevCount !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevCount), 1, filter);
      } else {
        pushToActive(this.activeFilters, filter);
      }
    } else if (this.activeFilters.includes(filter)) {
      this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
    } else if (!this.activeFilters.includes(filter)) {
      pushToActive(this.activeFilters, filter);
    }
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  public addClassesForCards(activeFilters: string[], cards: Card[]): void {
    this.resetClasses(activeFilters, cards); // сбрасываем классы
    this.visibleCards.length = 0;

    const bySize: Card[] = cards.filter((card) => activeFilters.some((filt) => card.size.includes(filt)));
    const byCategory: Card[] = cards.filter((card) => activeFilters.some((filt) => card.category.includes(filt)));
    const byPrice: Card[] = cards.filter((card) => {
      const [priceFrom, priceTo] = this.getPrice(activeFilters);
      return card.price >= priceFrom && card.price <= priceTo;
    });
    const byCount: Card[] = cards.filter((card) => {
      const [countFrom, countTo] = this.getCount(activeFilters);
      return card.stock >= countFrom && card.stock <= countTo;
    });

    this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount);
    console.log(this.visibleCards);
    const notFoundText = document.getElementById('cards__not-found');
    if (this.visibleCards.length === 0 && this.activeFilters.length !== 0) {
      if (notFoundText) {
        notFoundText.classList.add('visible');
        notFoundText.classList.remove('hidden');
        this.cardsAll.forEach((card) => {
          card.element.classList.add('hidden');
          card.element.classList.remove('visible');
        });
      }
    } else {
      this.visibleCards.forEach((visibleCard) => {
        if (notFoundText) {
          notFoundText.classList.add('hidden');
          notFoundText.classList.remove('visible');
        }
        visibleCard.element.classList.add('visible');
        visibleCard.element.classList.remove('hidden');
      });
    }
  }

  // функция принимает отфильтрованные значения категории, размера, цены и остатка
  // на складе в виде массивов карточек, проверяет, что массивы не пустые и в зависимости
  // от этого фильтрует товары, исключая те, которые не подходят по всем активным фильтрам.
  public filterArrays(arr1: Card[], arr2: Card[], arr3: Card[], arr4: Card[]): Card[] {
    const allArr = [arr1, arr2, arr3, arr4].filter((arr) => arr.length > 0);
    const result = allArr.reduce((acc, item) => acc.filter((elem) => item.includes(elem)));
    return result;
  }

  // сброс классов
  public resetClasses(activeFilters: string[], cards: Card[]): void {
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
  }

  public getPrice(activeFilters: string[]): number[] {
    let result: number[] = [];
    activeFilters.forEach((filter) => {
      if (filter.split(',')[0] === 'Price') {
        result = [+filter.split(',')[1], +filter.split(',')[2]];
      }
    });
    return result;
  }

  public getCount(activeFilters: string[]): number[] {
    let result: number[] = [];
    activeFilters.forEach((filter) => {
      if (filter.split(',')[0] === 'Count') {
        result = [+filter.split(',')[1], +filter.split(',')[2]];
      }
    });
    return result;
  }

  /* функция обсервера, реагирующая на добавление карточек,
    чтобы сохранять добавленные товары в local storage */
  public update(subject: ObservedSubject): void {
    if (subject instanceof Card && subject.element.classList.contains('added')) {
      this.addedItems.push(subject.id);
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
