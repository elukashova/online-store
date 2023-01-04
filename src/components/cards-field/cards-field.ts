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
import { PosterStorageInfoType } from '../../utils/localStorage.types';

export default class CardsField extends BaseComponent {
  public cardsAll: Card[] = []; // все карточки

  public activeFilters: string[] = []; // активные фильтры

  public visibleCards: Card[] = []; // текущие видимые карточки (для сортировки)

  public addedItems: PosterStorageInfoType[] = []; // для сохранения id добавленных товаров в local storage

  public cardsContainer: HTMLElement | null = null;

  public notFoundText: HTMLElement | null = null;

  public postersFound: HTMLElement | null = null;

  public selectInput: HTMLElement | null = null;

  public searchInput: HTMLElement | null = null;

  private readonly storageInfo: PosterStorageInfoType[] | null = checkDataInLocalStorage('addedPosters');

  constructor(public readonly header: Header, private callback: (event: Event) => void) {
    super('div', 'content__container');
    this.checkLocalStorage();
    this.render();
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
    this.selectInput = rendered('select', sortWrapper, 'cards__sort-products');
    this.cardsContainer = rendered('div', contentContainer, 'cards__container search', '', {
      id: 'cards__container',
    });
    rendered('option', this.selectInput, 'cards__sort-standart-value', 'Sort posters', {
      value: 'no-sort',
      disabled: '',
      selected: '',
    });
    rendered('option', this.selectInput, 'cards__sort-by-price-asc', 'Sort by price asc', {
      value: 'price-asc',
    });
    rendered('option', this.selectInput, 'cards__sort-by-price-desc', 'Sort by price desc', {
      value: 'price-desc',
    });
    rendered('option', this.selectInput, 'cards__sort-by-rating-asc', 'Sort by rating asc', {
      value: 'rating-asc',
    });
    rendered('option', this.selectInput, 'cards__sort-by-rating-desc', 'Sort by rating desc', {
      value: 'rating-desc',
    });
    this.postersFound = rendered('div', sortWrapper, 'cards__found-count', `Found: ${cardsData.products.length}`);
    const searchInputWrapper = rendered('div', sortWrapper, 'cards__search-wrapper');
    const searchInput = rendered('input', searchInputWrapper, 'cards__search', '', {
      type: 'search',
      placeholder: 'Search poster',
      id: 'search',
    });
    // слушатель для текстового поиска
    searchInput.addEventListener('input', () => {
      if (searchInput instanceof HTMLInputElement) {
        const val = `Search,${searchInput.value.trim().toUpperCase()}`;
        this.updateActiveFilters(val);
      }
    });
    rendered('img', searchInputWrapper, 'cards__search-icon', '', { src: 'assets/icons/search.svg' });
    const viewTypes = rendered('div', sortWrapper, 'cards__view-types');

    const viewFourProducts = rendered('img', viewTypes, 'cards__view-four', '', { src: 'assets/icons/block4.png' });
    const viewTwoProducts = rendered('img', viewTypes, 'cards__view-two', '', { src: 'assets/icons/block2.png' });
    viewTwoProducts.addEventListener('click', () => {
      this.cardsContainer?.classList.add('change-type');
      viewTwoProducts.classList.add('change-type');
      viewFourProducts.classList.remove('change-type');
    });
    viewFourProducts.addEventListener('click', () => {
      this.cardsContainer?.classList.remove('change-type');
      viewFourProducts.classList.add('change-type');
      viewTwoProducts.classList.remove('change-type');
    });
    this.notFoundText = rendered('p', this.cardsContainer, 'cards__not-found hidden', 'Product not found', {
      id: 'cards__not-found',
    });

    cardsData.products.forEach((data) => {
      const card: Card = new Card(data, this.callback);
      card.attachObserver(this.header);
      card.attachObserver(this);
      this.cardsAll.push(card);
      if (this.cardsContainer) this.cardsContainer.append(card.element);
    });
    // слушатель для сортировки
    this.selectInput.addEventListener('change', () => {
      if (this.selectInput instanceof HTMLSelectElement) {
        console.log(this.sortByField(this.cardsAll, this.selectInput.value));
        this.sortByField(this.cardsAll, this.selectInput.value);
      }
      this.cardsAll.forEach((card) => {
        if (this.cardsContainer) {
          this.cardsContainer.append(card.element);
        }
      });
    });
  }

  // функция сортировки
  public sortByField(arr: Card[], field: string): Card[] {
    return arr.sort((a, b): number => {
      if (field.includes('asc')) {
        if (field.includes('price')) return a.price - b.price;
        return a.rating - b.rating;
      }
      if (field.includes('desc')) {
        if (field.includes('price')) return b.price - a.price;
      }
      return b.rating - a.rating;
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
    const pushToActive = (array: string[], value: string): number => array.push(value);
    if (this.getFilterType(filter, 0) === 'Price') {
      // убрать повторы на рефакторинге
      const prevPrice = this.activeFilters.find((elem) => elem.startsWith(this.getFilterType(filter, 0)));
      if (prevPrice !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevPrice), 1, filter);
      } else {
        pushToActive(this.activeFilters, filter);
      }
    } else if (this.getFilterType(filter, 0) === 'Count') {
      const prevCount = this.activeFilters.find((elem) => elem.startsWith(this.getFilterType(filter, 0)));
      if (prevCount !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevCount), 1, filter);
      } else {
        pushToActive(this.activeFilters, filter);
      }
    } else if (this.getFilterType(filter, 0) === 'Search') {
      const prevCount = this.activeFilters.find((elem) => elem.startsWith(this.getFilterType(filter, 0)));
      if (this.getFilterType(filter, 1) === ' ') {
        this.activeFilters.splice(this.activeFilters.indexOf(filter));
      } else if (prevCount !== undefined) {
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
    console.log(this.activeFilters);
  };

  public addClassesForCards(activeFilters: string[], cards: Card[]): void {
    console.log(activeFilters);
    this.resetClasses(activeFilters, cards); // сбрасываем классы
    // eslint-disable-next-line arrow-body-style
    const bySize: Card[] = cards.filter(({ size }): boolean => {
      return activeFilters.some((filter): boolean => size.includes(filter));
    });
    // eslint-disable-next-line arrow-body-style
    const byCategory: Card[] = cards.filter(({ category }): boolean => {
      return activeFilters.some((filter): boolean => category.includes(filter));
    });
    const byPrice: Card[] = cards.filter((card): boolean => {
      const [priceFrom, priceTo] = this.getPrice(activeFilters);
      return card.price >= priceFrom && card.price <= priceTo;
    });
    const byCount: Card[] = cards.filter((card): boolean => {
      const [countFrom, countTo] = this.getCount(activeFilters);
      return card.stock >= countFrom && card.stock <= countTo;
    });
    // eslint-disable-next-line arrow-body-style
    const bySearch: Card[] = cards.filter(({ element }): boolean => {
      return activeFilters.some((filter: string): boolean => {
        const textIntoElement = element.innerText.toUpperCase();
        const temp = this.getFilterType(filter, 0);
        if (temp !== 'Search') {
          return false;
        }
        console.log(textIntoElement.includes(this.getFilterType(filter, 1)), this.getFilterType(filter, 1));
        return textIntoElement.includes(this.getFilterType(filter, 1));
      });
    });
    console.log(bySize, byCategory, bySearch, byPrice, byCount);
    if (!!byCategory.length || !!bySize.length || !!byPrice.length || !!byCount.length || !!bySearch.length) {
      this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount, bySearch);
    } else {
      this.visibleCards.length = 0;
    }

    if (this.visibleCards.length === 0 && this.activeFilters.length !== 0) {
      if (this.notFoundText) {
        this.notFoundText.classList.remove('hidden');
        this.cardsAll.forEach((card) => {
          card.element.classList.add('hidden');
        });
      }
    } else {
      this.visibleCards.forEach((visibleCard) => {
        if (this.notFoundText) {
          this.notFoundText.classList.add('hidden');
        }
        visibleCard.element.classList.remove('hidden');
      });
    }
    this.changeFoundItem();
  }

  public getFilterType = (value: string, index: number): string => value.split(',')[index];

  public changeFoundItem(): void {
    if (this.postersFound) {
      if (this.activeFilters.length === 0) {
        this.postersFound.textContent = `Found: ${this.cardsAll.length}`;
      } else if (this.visibleCards.length >= 0) {
        this.postersFound.textContent = `Found: ${this.visibleCards.length}`;
      }
    }
  }

  // функция принимает отфильтрованные значения категории, размера, цены и остатка
  // на складе в виде массивов карточек, проверяет, что массивы не пустые и в зависимости
  // от этого фильтрует товары, исключая те, которые не подходят по всем активным фильтрам.
  public filterArrays(arr1: Card[], arr2: Card[], arr3: Card[], arr4: Card[], arr5: Card[]): Card[] {
    const allArr: Card[][] = [arr1, arr2, arr3, arr4, arr5].filter((arr) => arr.length > 0);
    const result = allArr.reduce((acc, item) => acc.filter((elem) => item.includes(elem)));
    return result;
  }

  // сброс классов
  public resetClasses(activeFilters: string[], cards: Card[]): void {
    cards.forEach((card) => {
      if (activeFilters.length === 0) {
        // если массив пустой делаем все карточки видимыми
        card.element.classList.remove('hidden');
      } else {
        card.element.classList.add('hidden');
      }
    });
  }

  public getPrice(activeFilters: string[]): number[] {
    let result: number[] = [];
    activeFilters.forEach((filter) => {
      if (this.getFilterType(filter, 0) === 'Price') {
        result = [+this.getFilterType(filter, 1), +this.getFilterType(filter, 2)];
      }
    });
    return result;
  }

  public getCount(activeFilters: string[]): number[] {
    let result: number[] = [];
    activeFilters.forEach((filter) => {
      if (this.getFilterType(filter, 0) === 'Count') {
        result = [+this.getFilterType(filter, 1), +this.getFilterType(filter, 2)];
      }
    });
    return result;
  }

  /* функция обсервера, реагирующая на добавление карточек,
    чтобы сохранять добавленные товары в local storage */
  public update(subject: ObservedSubject): void {
    if (subject instanceof Card && subject.element.classList.contains('added')) {
      const info: PosterStorageInfoType = {
        id: 0,
        quantity: 0,
      };
      info.id = subject.id;
      info.quantity += 1;
      this.addedItems.push(info);
      setDataToLocalStorage(this.addedItems, 'addedPosters');
    }

    if (subject instanceof Card && !subject.element.classList.contains('added')) {
      const index = this.addedItems.findIndex((i) => i.id === subject.id);
      this.addedItems.splice(index, 1);
      if (this.addedItems.length > 0) {
        setDataToLocalStorage(this.addedItems, 'addedPosters');
      } else {
        localStorage.removeItem('addedPosters');
      }
    }
  }

  /* проверка данных в local storage, чтобы по возвращению из корзины на главную
    не обнулялись данные о добавленных товарах */
  private checkLocalStorage(): void {
    if (this.storageInfo !== null) {
      this.addedItems = this.storageInfo.slice();
    }
  }
}
