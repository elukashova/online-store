/* eslint-disable operator-linebreak */
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
import findCountOfCurrentProducts from './utils/find.current.count';
import { setDataToLocalStorage, checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageType } from '../../utils/localStorage.types';
// eslint-disable-next-line object-curly-newline
import {
  deleteOneQueryParam,
  deleteQueryParams,
  getQueryParams,
  getUrl,
  setQueryParams,
} from '../../utils/queryParams';
import { FilterTypes, QueryParameters, SortTypes } from './enums.cards-field';

export default class CardsField extends BaseComponent {
  public cardsAll: Card[] = []; // все карточки

  public activeFilters: string[] = []; // активные фильтры

  public visibleCards: Card[] = []; // текущие видимые карточки (для сортировки)

  public addedItems: PosterStorageType[] = []; // для сохранения id добавленных товаров в local storage

  public allOptions: HTMLElement[] | null = null;

  public cardsContainer: HTMLElement | null = null;

  public notFoundText: HTMLElement | null = null;

  public postersFound: HTMLElement | null = null;

  public selectInput: HTMLElement | null = null;

  public searchInput: HTMLElement | null = null;

  public categoryFilter: Filter | null = null;

  public sizeFilter: Filter | null = null;

  public priceFilter: Filter | null = null;

  public stockFilter: Filter | null = null;

  public viewFourProducts: HTMLElement | null = null;

  public viewTwoProducts: HTMLElement | null = null;

  private readonly storageInfo: PosterStorageType[] | null = checkDataInLocalStorage('addedPosters');

  constructor(public readonly header: Header, private callback: (event: Event) => void) {
    super('div', 'content__container');
    this.checkLocalStorage();
    this.checkUrlInfo();
  }

  public render(): void {
    const filtersContainer: HTMLElement = rendered('form', this.element, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('div', filtersContainer, 'filters__btns-wrapper');
    const reset = rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    reset.addEventListener('click', this.resetFilters);
    rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');

    // фильтр по категории
    this.categoryFilter = new Filter(filtersContainer, 'Category', this.updateActiveFilters);
    let uniqueCategories = cardsData.products.map((item) => item.category);
    uniqueCategories = Array.from(new Set(uniqueCategories));
    const categoryNames: HTMLElement = this.categoryFilter.renderCheckbox(uniqueCategories, 'category');
    filtersContainer.append(categoryNames);

    // фильтр по размеру
    this.sizeFilter = new Filter(filtersContainer, 'Size', this.updateActiveFilters);
    let uniqueSize = cardsData.products.map((item) => item.size);
    uniqueSize = Array.from(new Set(uniqueSize));
    const sizeNames: HTMLElement = this.sizeFilter.renderCheckbox(uniqueSize, 'size');
    filtersContainer.append(sizeNames);

    // фильтр по цене
    this.priceFilter = new Filter(filtersContainer, 'Price', this.updateActiveFilters);
    const pricesTitles: HTMLElement = this.priceFilter.renderInputRange('price');
    filtersContainer.append(pricesTitles);

    // фильтр по стоку
    this.stockFilter = new Filter(filtersContainer, 'Stock', this.updateActiveFilters);
    const stockTitles: HTMLElement = this.stockFilter.renderInputRange('stock');
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
    });
    const priceAsc = rendered('option', this.selectInput, 'cards__sort-by-price-asc', 'Sort by price asc', {
      value: 'price-asc',
    });
    const priceDesc = rendered('option', this.selectInput, 'cards__sort-by-price-desc', 'Sort by price desc', {
      value: 'price-desc',
    });
    const RatingAsc = rendered('option', this.selectInput, 'cards__sort-by-rating-asc', 'Sort by rating asc', {
      value: 'rating-asc',
    });
    const RatingDesc = rendered('option', this.selectInput, 'cards__sort-by-rating-desc', 'Sort by rating desc', {
      value: 'rating-desc',
    });
    this.allOptions = [priceAsc, priceDesc, RatingAsc, RatingDesc];
    this.postersFound = rendered('div', sortWrapper, 'cards__found-count', `Found: ${cardsData.products.length}`);
    const searchInputWrapper = rendered('div', sortWrapper, 'cards__search-wrapper');
    const searchInput = rendered('input', searchInputWrapper, 'cards__search', '', {
      type: 'search',
      placeholder: 'Search poster',
      id: 'search',
    });
    rendered('img', searchInputWrapper, 'cards__search-icon', '', { src: 'assets/icons/search.svg' });
    const viewTypes = rendered('div', sortWrapper, 'cards__view-types');
    this.viewFourProducts = rendered('img', viewTypes, 'cards__view-four', '', {
      src: 'assets/icons/block4.png',
      id: 'four',
    });
    this.viewTwoProducts = rendered('img', viewTypes, 'cards__view-two', '', {
      src: 'assets/icons/block2.png',
      id: 'two',
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

    // слушатель для текстового поиска
    searchInput.addEventListener('input', () => {
      if (searchInput instanceof HTMLInputElement) {
        const val = `Search,${searchInput.value.trim().toLowerCase()}`;
        this.updateActiveFilters(val);
      }
    });

    // слушатель для сортировки
    this.selectInput.addEventListener('change', () => {
      if (this.cardsContainer && this.selectInput) {
        this.startSorting(this.selectInput);
      }
    });

    // слушатель смены вида
    viewTypes.addEventListener('click', (e) => {
      if (this.cardsContainer) {
        this.checkView(e);
      }
    });
  }

  // Проверяем есть ли данные в query параметрах
  public checkUrlInfo(): void {
    const url = getUrl();
    if (url) {
      if (url.endsWith('/')) {
        // желательно сменить проверку, эта ненадежная
        this.render();
      } else {
        this.render();

        const params = decodeURI(url.slice(url.indexOf('?') + 1));
        if (params.length > 0) {
          const regex = /=|~/;
          const splitedParams = params.split('&').map((elem) => elem.split(regex));
          this.splitParametersIntoTypes(splitedParams);
        }
      }
    }
  }

  // разбиваем параметры и вызываем нужные фильтры и сортировки
  public splitParametersIntoTypes = (params: string[][]): void => {
    const splitParameters = (value: string[], index: number): string => value[index];
    const updateFilters = (parameters: string[]): void => {
      const values = parameters.splice(1);
      if (values.length) {
        values.forEach((value) => this.activeFilters.push(value));
      }
    };
    params.forEach((elem) => {
      elem.forEach((item) => item.split(','));
      console.log(elem);
      const type = splitParameters(elem, 0);
      if (type === QueryParameters.View) {
        this.changeViewOfProducts(splitParameters(elem, 1));
      } else if (type === QueryParameters.Sorting) {
        this.sortCards(splitParameters(elem, 1));
      } else {
        // если фильтры то обновляем this.activeFilters
        // и передаем какие чекбоксы сделать checked
        if (type === QueryParameters.Category || type === QueryParameters.Size) {
          updateFilters(elem);
          if (this.categoryFilter) {
            this.addCheckedForCheckboxes(this.categoryFilter, this.activeFilters);
          }
          if (this.sizeFilter) {
            this.addCheckedForCheckboxes(this.sizeFilter, this.activeFilters);
          }
        }

        if (type === QueryParameters.Price) {
          updateFilters(elem);
        } /*
        if (type === QueryParameters.Count) {
          updateFilters(elem);
        }
        if (type === QueryParameters.Search) {
          updateFilters(elem);
        } */
        // console.log(this.activeFilters);
      }
    });
  };

  public addCheckedForCheckboxes(filter: Filter, activeFilters: string[]): void {
    if (filter) {
      filter.checkboxes.forEach((checkbox) => {
        activeFilters.forEach((active) => {
          if (checkbox.id === active) {
            checkbox.setAttribute('checked', 'checked');
          }
        });
      });
    }
  }

  public checkView(e: Event): void {
    if (e.target && e.target instanceof HTMLElement) {
      if (e.target.classList.contains('cards__view-four')) {
        this.changeViewOfProducts('four');
      } else {
        this.changeViewOfProducts('two');
      }
    }
  }

  public changeViewOfProducts(str: string): void {
    if (this.cardsContainer && this.cardsContainer instanceof HTMLElement) {
      if (this.viewFourProducts && this.viewTwoProducts) {
        if (str === this.viewFourProducts.id) {
          this.cardsContainer.classList.remove('change-type');
          this.viewFourProducts.classList.add('change-type');
          this.viewTwoProducts.classList.remove('change-type');
          setQueryParams('view', SortTypes.ViewFour);
        } else {
          this.cardsContainer.classList.add('change-type');
          this.viewTwoProducts.classList.add('change-type');
          this.viewFourProducts.classList.remove('change-type');
          setQueryParams('view', SortTypes.ViewTwo);
        }
      }
    }
  }

  public startSorting(select: HTMLElement): void {
    if (select instanceof HTMLSelectElement) {
      this.sortCards(select.value);
    }
  }

  public sortCards(str: string): void {
    if (this.selectInput instanceof HTMLSelectElement) {
      this.sortByField(this.cardsAll, str);
      setQueryParams('sorting', str);
      if (this.allOptions) {
        this.allOptions.forEach((option) => option.removeAttribute('selected'));
        this.allOptions.forEach((option) => {
          if (this.selectInput && this.selectInput instanceof HTMLSelectElement) {
            if (option instanceof HTMLOptionElement && str === option.value) {
              option.setAttribute('selected', 'selected');
            }
          }
        });
      }
    }
    this.cardsAll.forEach((card) => {
      if (this.cardsContainer) {
        this.cardsContainer.append(card.element);
      }
    });
  }

  // Функция апдейта активных фильтров
  public updateActiveFilters = (filter: string): void => {
    const pushToActive = (array: string[], value: string): number => array.push(value);

    if (this.getFilterType(filter, 0) === FilterTypes.Price) {
      const prevPrice = this.activeFilters.find((elem) => elem.startsWith(this.getFilterType(filter, 0)));
      const query = this.composeQueryString(filter);
      if (prevPrice !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevPrice), 1, filter);
      } else {
        pushToActive(this.activeFilters, filter);
      }
      setQueryParams(FilterTypes.Price.toLowerCase(), query);
    } else if (this.getFilterType(filter, 0) === FilterTypes.Count) {
      const prevCount = this.activeFilters.find((elem) => elem.startsWith(this.getFilterType(filter, 0)));
      const query = this.composeQueryString(filter);
      if (prevCount !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevCount), 1, filter);
      } else {
        pushToActive(this.activeFilters, filter);
      }
      setQueryParams(FilterTypes.Count.toLowerCase(), query);
    } else if (this.getFilterType(filter, 0) === FilterTypes.Search) {
      const prevCount = this.activeFilters.find((elem) => elem.startsWith(this.getFilterType(filter, 0)));
      const query = this.composeQueryString(filter);
      if (this.getFilterType(filter, 1) === ' ' || this.getFilterType(filter, 1) === '') {
        this.activeFilters.splice(this.activeFilters.indexOf(filter));
        deleteQueryParams(FilterTypes.Search.toLowerCase());
      } else if (prevCount !== undefined) {
        this.activeFilters.splice(this.activeFilters.indexOf(prevCount), 1, filter);
        setQueryParams(FilterTypes.Search.toLowerCase(), query);
      } else {
        pushToActive(this.activeFilters, filter);
        setQueryParams(FilterTypes.Search.toLowerCase(), query);
      }
    } else if (this.activeFilters.includes(filter)) {
      this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
      const queryType = this.checkFilter(filter);
      const prev = getQueryParams(queryType);
      if (prev !== null) {
        if (prev.includes(filter)) {
          if (prev.includes('~')) {
            deleteOneQueryParam(queryType, filter);
          } else {
            deleteQueryParams(queryType);
          }
        } else {
          setQueryParams(queryType, `${prev}~${filter}`);
        }
      }
    } else if (!this.activeFilters.includes(filter)) {
      pushToActive(this.activeFilters, filter);
      const queryType = this.checkFilter(filter);
      const prev = getQueryParams(queryType);
      if (prev !== null) {
        setQueryParams(queryType, `${prev}~${filter}`);
      } else {
        setQueryParams(queryType, filter);
      }
    }
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  public composeQueryString(str: string): string {
    if (this.getFilterType(str, 0) !== FilterTypes.Search) {
      return `${this.getFilterType(str, 1)}~${this.getFilterType(str, 2)}`;
    }
    return `${this.getFilterType(str, 1).toLowerCase()}`;
  }

  public checkFilter(str: string): string {
    let res;
    if (this.categoryFilter) {
      res = this.categoryFilter.checkboxes.some((filter) => filter.id === str);
    }
    return res === true ? FilterTypes.Category.toLowerCase() : FilterTypes.Size.toLowerCase();
  }

  public addClassesForCards(activeFilters: string[], cards: Card[]): void {
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
        const temp = this.getFilterType(filter, 0);
        if (temp !== 'Search') return false;
        return element.innerText.toLowerCase().includes(this.getFilterType(filter, 1));
      });
    });
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
      if (this.categoryFilter) this.changeStartValueOfCount('remove', this.categoryFilter);
      if (this.sizeFilter) this.changeStartValueOfCount('remove', this.sizeFilter);
    } else if (this.visibleCards.length === 0 && this.activeFilters.length === 0) {
      if (this.categoryFilter) this.changeStartValueOfCount('start', this.categoryFilter);
      if (this.sizeFilter) this.changeStartValueOfCount('start', this.sizeFilter);
    } else {
      if (this.categoryFilter) this.changeStartValueOfCount('change', this.categoryFilter);
      if (this.sizeFilter) this.changeStartValueOfCount('change', this.sizeFilter);
      this.visibleCards.forEach((visibleCard) => {
        if (this.notFoundText) {
          this.notFoundText.classList.add('hidden');
        }
        visibleCard.element.classList.remove('hidden');
      });
    }
    this.setCountFrom(this.visibleCards);
    // this.setNewRange(this.visibleCards);
    this.changeFoundItemsCount();
  }

  /* public setNewRange(data: Card[]): void {
    if (data.length) {
      const [priceMin, priceMax] = this.getRange(data, 'price');
      const [stockMin, stockMax] = this.getRange(data, 'stock');
      if (this.priceFilter) {
        if (this.priceFilter.lowestInput) {
          this.priceFilter.lowestInput.setAttribute('value', `${priceMin}`);
        }
        if (this.priceFilter.highestInput) {
          this.priceFilter.highestInput.setAttribute('value', `${priceMax}`);
        }
        if (this.priceFilter.minElement) this.priceFilter.minElement.textContent = `$${priceMin}`;
        if (this.priceFilter.maxElement) this.priceFilter.maxElement.textContent = `$${priceMax}`;
      }
      if (this.stockFilter) {
        if (this.stockFilter.lowestInput) {
          this.stockFilter.lowestInput.setAttribute('value', `${stockMin}`);
        }
        if (this.stockFilter.highestInput) {
          this.stockFilter.highestInput.setAttribute('value', `${stockMax}`);
        }
        if (this.stockFilter.minElement) this.stockFilter.minElement.textContent = `${stockMin}`;
        if (this.stockFilter.maxElement) this.stockFilter.maxElement.textContent = `${stockMax}`;
      }
    }
  } */

  public getRange(data: Card[], type: string): number[] {
    const arrCopy = [...data];
    const result = arrCopy.sort((a, b) => (type === 'price' ? a.price - b.price : a.stock - b.stock));
    // eslint-disable-next-line operator-linebreak
    const [resMin, resMax] =
      type === 'price'
        ? [result[0].price, result[result.length - 1].price]
        : [result[0].stock, result[result.length - 1].stock];
    return [resMin, resMax];
  }

  public changeStartValueOfCount(type: string, filter: Filter): void {
    if (filter && filter.allCountsFrom) {
      if (type === 'start') {
        filter.allCountsFrom.forEach((elem) => {
          if (filter.allCountsTo) {
            filter.allCountsTo.forEach((initialEl) => {
              const temp = elem;
              if (initialEl.className === elem.className) {
                temp.textContent = `${initialEl.textContent}`;
              }
            });
          }
        });
      } else if (type === 'remove') {
        filter.allCountsFrom.forEach((elem) => {
          const temp = elem;
          temp.textContent = '0';
        });
      } else {
        filter.allCountsFrom.forEach((elem) => {
          const temp = elem;
          temp.textContent = '0';
        });
      }
    }
  }

  public getFilterType = (value: string, index: number): string => value.split(',')[index];

  public setCountFrom(data: Card[]): void {
    const allCheckbox = [...findCountOfCurrentProducts(data, 'category'), ...findCountOfCurrentProducts(data, 'size')];
    allCheckbox.forEach((subtype) => {
      this.assignQuantity(
        subtype.type === 'category' ? this.categoryFilter : this.sizeFilter,
        subtype.key,
        subtype.count,
      );
    });
  }

  public assignQuantity(filter: Filter | null, key: string, count: number): void {
    if (filter && filter.allCountsFrom) {
      filter.allCountsFrom.forEach((elem) => {
        const temp = elem;
        if (elem.id === key) {
          temp.textContent = `${count}`;
        }
      });
    }
  }

  public changeFoundItemsCount(): void {
    if (this.postersFound) {
      this.postersFound.textContent = this.activeFilters.length
        ? `Found: ${this.visibleCards.length}`
        : `Found: ${this.cardsAll.length}`;
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

  /* функция обсервера, реагирующая на добавление карточек,
    чтобы сохранять добавленные товары в local storage */
  public update(subject: ObservedSubject): void {
    if (subject instanceof Card && subject.element.classList.contains('added')) {
      const info: PosterStorageType = {
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
