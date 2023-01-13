/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable operator-linebreak */
/* eslint-disable max-lines-per-function */
import './cards-field.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';
import cardsData from '../../assets/json/data';
import Card from '../card/card';
import Filter from '../filter/filter';
import Header from '../header/header';
import { ObservedSubject } from '../card/card.types';
import findCountOfCurrentProducts from './utils/find.current.count';
import { setDataToLocalStorage, checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageType } from '../../utils/localStorage.types';
import {
  deleteAllQueryParams,
  deleteOneQueryParam,
  deleteQueryParams,
  getQueryParams,
  setQueryParams,
} from '../../utils/queryParams';
// eslint-disable-next-line object-curly-newline
import { QueryParameters, TypeOfView, SortBy, CountForFilter } from './cards-field.types';
import { Callback } from '../shopping-cart/shopping-cart.types';

export default class CardsField extends BaseComponent {
  public cardsAll: Card[] = []; // все карточки

  public activeFilters: string[] = []; // активные фильтры

  public visibleCards: Card[] = []; // текущие видимые карточки (для сортировки)

  public addedItems: PosterStorageType[] = []; // сохранение id добавленных товаров в local storage

  public allOptions: HTMLElement[] | null = null;

  public cardsContainer: HTMLElement | null = null;

  public notFoundText: HTMLElement | null = null;

  public postersFound: HTMLElement | null = null;

  public selectInput: HTMLElement | null = null;

  public searchInput: HTMLElement | null = null;

  public defaultOption: HTMLElement | null = null;

  public categoryFilter: Filter | null = null;

  public sizeFilter: Filter | null = null;

  public priceFilter: Filter | null = null;

  public stockFilter: Filter | null = null;

  public viewFourProducts: HTMLElement | null = null;

  public viewTwoProducts: HTMLElement | null = null;

  private readonly storageInfo: PosterStorageType[] | null = checkDataInLocalStorage('addedPosters');

  constructor(public readonly header: Header, private callback: Callback) {
    super('div', 'content__container');
    this.checkLocalStorage();
    this.render();
    this.checkUrlInfo();
  }

  public render(): void {
    const filtersContainer: HTMLElement = rendered('form', this.element, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('div', filtersContainer, 'filters__btns-wrapper');
    const reset = rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    reset.addEventListener('click', this.resetFilters);
    const copyLink: HTMLElement = rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');
    copyLink.addEventListener('click', this.copyLink);

    // фильтр по категории
    this.categoryFilter = new Filter(filtersContainer, 'category', this.updateActiveFilters);
    let uniqueCategories: string[] = cardsData.products.map((item) => item.category);
    uniqueCategories = Array.from(new Set(uniqueCategories));
    const categoryNames: HTMLElement = this.categoryFilter.renderCheckbox(uniqueCategories, 'category');
    filtersContainer.append(categoryNames);

    // фильтр по размеру
    this.sizeFilter = new Filter(filtersContainer, 'size', this.updateActiveFilters);
    let uniqueSize: string[] = cardsData.products.map((item) => item.size);
    uniqueSize = Array.from(new Set(uniqueSize));
    const sizeNames: HTMLElement = this.sizeFilter.renderCheckbox(uniqueSize, 'size');
    filtersContainer.append(sizeNames);

    // фильтр по цене
    this.priceFilter = new Filter(filtersContainer, 'price', this.updateActiveFilters);
    const pricesTitles: HTMLElement = this.priceFilter.renderInputRange('price');
    filtersContainer.append(pricesTitles);

    // фильтр по стоку
    this.stockFilter = new Filter(filtersContainer, 'stock', this.updateActiveFilters);
    const stockTitles: HTMLElement = this.stockFilter.renderInputRange('stock');
    filtersContainer.append(stockTitles);

    const contentContainer: HTMLElement = rendered('div', this.element, 'cards__content');
    const sortWrapper: HTMLElement = rendered('div', contentContainer, 'cards__sort-wrapper');
    this.selectInput = rendered('select', sortWrapper, 'cards__sort-products');
    this.cardsContainer = rendered('div', contentContainer, 'cards__container search', '', {
      id: 'cards__container',
    });
    this.defaultOption = rendered('option', this.selectInput, 'cards__sort-standart-value', 'Sort posters', {
      value: 'no-sort',
      disabled: '',
    });
    const priceAsc: HTMLElement = rendered(
      'option',
      this.selectInput,
      'cards__sort-by-price-asc',
      'Sort by price asc',
      {
        value: 'price-asc',
      },
    );
    const priceDesc: HTMLElement = rendered(
      'option',
      this.selectInput,
      'cards__sort-by-price-desc',
      'Sort by price desc',
      {
        value: 'price-desc',
      },
    );
    const RatingAsc: HTMLElement = rendered(
      'option',
      this.selectInput,
      'cards__sort-by-rating-asc',
      'Sort by rating asc',
      {
        value: 'rating-asc',
      },
    );
    const RatingDesc: HTMLElement = rendered(
      'option',
      this.selectInput,
      'cards__sort-by-rating-desc',
      'Sort by rating desc',
      {
        value: 'rating-desc',
      },
    );
    this.allOptions = [this.defaultOption, priceAsc, priceDesc, RatingAsc, RatingDesc];
    this.postersFound = rendered('div', sortWrapper, 'cards__found-count', `Found: ${cardsData.products.length}`);
    const searchInputWrapper: HTMLElement = rendered('div', sortWrapper, 'cards__search-wrapper');
    this.searchInput = rendered('input', searchInputWrapper, 'cards__search', '', {
      type: 'search',
      placeholder: 'Search poster',
      id: 'search',
    });
    rendered('img', searchInputWrapper, 'cards__search-icon', '', { src: 'assets/icons/search.svg', alt: '' });
    const viewTypes: HTMLElement = rendered('div', sortWrapper, 'cards__view-types');
    this.viewFourProducts = rendered('img', viewTypes, 'cards__view-four change-type', '', {
      src: 'assets/icons/block4.png',
      id: 'four',
      alt: 'switch to view of four products',
    });
    this.viewTwoProducts = rendered('img', viewTypes, 'cards__view-two', '', {
      src: 'assets/icons/block2.png',
      id: 'two',
      alt: 'switch to view of two products',
    });
    this.notFoundText = rendered('p', this.cardsContainer, 'cards__not-found hidden', 'Product not found', {
      id: 'cards__not-found',
    });
    cardsData.products.forEach((data): void => {
      const card: Card = new Card(data, this.callback);
      card.attachObserver(this.header);
      card.attachObserver(this);
      this.cardsAll.push(card);
      if (this.cardsContainer) this.cardsContainer.append(card.element);
    });

    // слушатель для текстового поиска
    this.searchInput.addEventListener('input', (e): void => this.toDoWhenSearchInputListen(e));
    // слушатель для сортировки
    this.selectInput.addEventListener('change', (): void => {
      if (this.cardsContainer && this.selectInput) {
        if (this.selectInput instanceof HTMLSelectElement) {
          this.sortCards(this.selectInput.value);
        }
      }
    });
    // слушатель смены вида
    viewTypes.addEventListener('click', (e): void => this.toDoWhenViewTypesListen(e));
  }

  /* Методы, вызываемые слушателями */

  // получаем значение введенное в поиск, проверяем на пустое значение и вызываем методы
  public toDoWhenSearchInputListen(e: Event): void {
    if (e.currentTarget && e.currentTarget instanceof HTMLInputElement) {
      const inputText: string = e.currentTarget.value.trim().toLowerCase();
      const val: string = `search,${inputText}`;
      if (inputText === '') {
        if (this.notFoundText) {
          this.notFoundText.classList.add('hidden');
        }
      }
      this.setNewRange(this.cardsAll);
      this.updateActiveFilters(val);
    }
  }

  // меняем рейндж по новому значению
  public setNewRange(data: Card[]): void {
    if (data.length) {
      const [priceMin, priceMax]: number[] = this.getRange(data, 'price');
      const [stockMin, stockMax]: number[] = this.getRange(data, 'stock');
      const changeValue = (typeFilter: Filter): void => {
        // eslint-disable-next-line object-curly-newline
        const { lowestInput, highestInput, minElement, maxElement }: Filter = typeFilter;
        if (
          lowestInput &&
          highestInput &&
          lowestInput instanceof HTMLInputElement &&
          highestInput instanceof HTMLInputElement
        ) {
          lowestInput.setAttribute('value', typeFilter === this.priceFilter ? `${priceMin}` : `${stockMin}`);
          highestInput.setAttribute('value', typeFilter === this.priceFilter ? `${priceMax}` : `${stockMax}`);
          if (minElement) {
            minElement.textContent = `${typeFilter === this.priceFilter ? '$' : ''} ${lowestInput.value}`;
          }
          if (maxElement) {
            maxElement.textContent = `${typeFilter === this.priceFilter ? '$' : ''} ${highestInput.value}`;
          }
        }
      };
      if (this.priceFilter && this.stockFilter) {
        changeValue(this.priceFilter);
        changeValue(this.stockFilter);
      }
    }
  }

  // получаю минимальное и максимальное число среди видимых карт
  public getRange(data: Card[], type: string): number[] {
    const arrCopy: Card[] = [...data];
    const result: Card[] = arrCopy.sort((a: Card, b: Card): number => {
      return type === QueryParameters.Price ? a.price - b.price : a.stock - b.stock;
    });
    const [resMin, resMax]: number[] =
      type === 'price'
        ? [result[0].price, result[result.length - 1].price]
        : [result[0].stock, result[result.length - 1].stock];
    return [resMin, resMax];
  }

  // сортируем карточки
  public sortCards(str: string): void {
    if (this.selectInput instanceof HTMLSelectElement) {
      this.sortByField(this.cardsAll, str);
      setQueryParams('sorting', str);
      // добавляем selected выбранному option
      if (this.allOptions) {
        this.allOptions.forEach((option): void => option.removeAttribute('selected'));
        this.allOptions.forEach((option): void => {
          if (this.selectInput && this.selectInput instanceof HTMLSelectElement) {
            if (option instanceof HTMLOptionElement && str === option.value) {
              option.setAttribute('selected', 'selected');
            }
          }
        });
      } // аппендим карточки в контейнер в новом порядке
      this.cardsAll.forEach((card): void => {
        if (this.cardsContainer) {
          this.cardsContainer.append(card.element);
        }
      });
    }
  }

  // функция сортировки
  public sortByField(arr: Card[], field: string): Card[] {
    return arr.sort((a, b): number => {
      if (field.includes(SortBy.Asc)) {
        return field.includes(QueryParameters.Price) ? a.price - b.price : a.rating - b.rating;
      }
      return field.includes(QueryParameters.Price) ? b.price - a.price : b.rating - a.rating;
    });
  }

  // получаем выбранный вариант вида и передаем в функцию смены вида
  public toDoWhenViewTypesListen(e: Event): void {
    if (this.cardsContainer) {
      if (e.target && e.target instanceof HTMLElement) {
        this.changeViewOfProducts(e.target.id === TypeOfView.ViewFour ? TypeOfView.ViewFour : TypeOfView.ViewTwo);
      }
    }
  }

  // меняем вид отображения товаров в сетке
  public changeViewOfProducts(str: string): void {
    if (this.cardsContainer && this.cardsContainer instanceof HTMLElement) {
      if (this.viewFourProducts && this.viewTwoProducts) {
        if (str === this.viewFourProducts.id) {
          this.cardsContainer.classList.remove('change-type');
          this.viewFourProducts.classList.add('change-type');
          this.viewTwoProducts.classList.remove('change-type');
          setQueryParams('view', TypeOfView.ViewFour);
        } else if (str === this.viewTwoProducts.id) {
          this.cardsContainer.classList.add('change-type');
          this.viewTwoProducts.classList.add('change-type');
          this.viewFourProducts.classList.remove('change-type');
          setQueryParams('view', TypeOfView.ViewTwo);
        } else {
          // сбрасываем
          this.cardsContainer.classList.remove('change-type');
          this.viewFourProducts.classList.remove('change-type');
          this.viewTwoProducts.classList.remove('change-type');
        }
      }
    }
  }

  /* Методы конструктора */

  // Проверяем есть ли данные в query параметрах
  public checkUrlInfo(): void {
    const parameters: string = window.location.search;
    if (parameters.length > 1) {
      // если есть query, получаем их, чтобы применить фильтры
      let decodedParams: string = decodeURI(parameters);
      decodedParams = decodedParams.slice(1);
      this.splitParametersIntoTypes(decodedParams);
    } else {
      this.cardsAll = [];
      this.element.replaceChildren();
      this.render();
    }
  }

  // разбиваем параметры
  public splitParametersIntoTypes = (decodedParams: string): void => {
    const regex: RegExp = /=|~/;
    const splitedParams: string[][] = decodedParams.split('&').map((elem): string[] => elem.split(regex));
    const splitParameters = (value: string[], index: number): string => value[index];
    const updateFilters = (parameters: string[]): void => {
      const values: string[] = parameters.splice(1);
      if (values.length) {
        values.forEach((value): number => this.pushToActive(this.activeFilters, value));
      }
    };
    splitedParams.forEach((elem): void => {
      const type: string = splitParameters(elem, 0);
      if (type === QueryParameters.View) {
        this.changeViewOfProducts(splitParameters(elem, 1));
      } else if (type === QueryParameters.Sorting) {
        this.sortCards(splitParameters(elem, 1));
      } else {
        // если фильтры то обновляем this.activeFilters и передаем какие чекбоксы сделать checked
        if (type === QueryParameters.Category || type === QueryParameters.Size) {
          updateFilters(elem);
          this.activeFilters.forEach((active): void => {
            if (this.categoryFilter && this.sizeFilter) {
              this.addOrRemoveChecked(this.categoryFilter, active, true);
              this.addOrRemoveChecked(this.sizeFilter, active, true);
            }
          });
        }
        if (type === QueryParameters.Price || type === QueryParameters.Count) {
          this.pushToActive(this.activeFilters, elem.toString());
        }
        if (type === QueryParameters.Search) {
          this.pushToActive(this.activeFilters, elem.toString());
          if (this.searchInput && this.searchInput instanceof HTMLInputElement) {
            this.searchInput.value = splitParameters(elem, 1);
          }
        }
      }
    });
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  // функция для пуша в активные фильтры
  public pushToActive = (array: string[], value: string): number => array.push(value);

  // добавляем/убираем чекбоксам checked
  public addOrRemoveChecked(filterType: Filter, filter: string, val: boolean): void {
    filterType.checkboxes.forEach((type): void => {
      if (type.id === filter) {
        if (val) {
          type.setAttribute('checked', 'checked');
        } else {
          type.removeAttribute('checked');
        }
      }
    });
  }

  // Функция апдейта активных фильтров с добавлением/удалением квери параметров
  public updateActiveFilters = (filter: string): void => {
    if (this.getPartOfString(filter, 0) === QueryParameters.Price) {
      this.addOrReplaceFilter(QueryParameters.Price, filter);
    } else if (this.getPartOfString(filter, 0) === QueryParameters.Count) {
      this.addOrReplaceFilter(QueryParameters.Count, filter);
    } else if (this.getPartOfString(filter, 0) === QueryParameters.Search) {
      // если в поиске - пустая строка, удаляем из фильтров и query
      if (this.getPartOfString(filter, 1) === ' ' || this.getPartOfString(filter, 1) === '') {
        this.activeFilters.splice(this.activeFilters.indexOf(filter));
        deleteQueryParams(QueryParameters.Search);
      } else {
        this.addOrReplaceFilter(QueryParameters.Search, filter);
      }
    } else {
      // для значений категории и размера
      const queryType: string = this.checkFilter(filter);
      const prev: string | null = getQueryParams(queryType);
      // если значение уже есть в активных фильтрах, мы его убираем
      if (this.activeFilters.includes(filter)) {
        this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
        if (prev !== null) {
          // если оно есть в квери параметрах и имеет другие значения - удаляем только это значение
          if (prev.includes(filter)) {
            if (prev.includes('~')) {
              deleteOneQueryParam(queryType, filter);
            } else {
              // если это единственное значение такого типа - удаляем весь тип
              deleteQueryParams(queryType);
            }
          }
        }
        // убираем checked
        if (this.categoryFilter) this.addOrRemoveChecked(this.categoryFilter, filter, false);
        if (this.sizeFilter) this.addOrRemoveChecked(this.sizeFilter, filter, false);
        // если значения нет в активных - пушим
      } else if (!this.activeFilters.includes(filter)) {
        this.pushToActive(this.activeFilters, filter);
        if (prev !== null) {
          // если в query есть уже значение с таким типом - добавляем через ~
          setQueryParams(queryType, `${prev}~${filter}`);
        } else {
          // иначе просто добавляем
          setQueryParams(queryType, filter);
        }
        // добавляем checked
        if (this.categoryFilter) this.addOrRemoveChecked(this.categoryFilter, filter, true);
        if (this.sizeFilter) this.addOrRemoveChecked(this.sizeFilter, filter, true);
      }
    }
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  // получить часть строки
  public getPartOfString = (value: string, index: number): string => value.split(',')[index];

  // добавление или замена фильтра в активные фильтры
  public addOrReplaceFilter(filterType: string, filter: string): void {
    const prev = this.activeFilters.find((elem): boolean => elem.startsWith(this.getPartOfString(filter, 0)));
    const query = this.composeQueryString(filter);
    if (prev === undefined) {
      this.pushToActive(this.activeFilters, filter);
    } else {
      this.activeFilters.splice(this.activeFilters.indexOf(prev), 1, filter);
    }
    setQueryParams(filterType, query);
  }

  // составляем строку значения в зависимости от типа фильтра
  public composeQueryString(str: string): string {
    if (this.getPartOfString(str, 0) !== QueryParameters.Search) {
      return `${this.getPartOfString(str, 1).trim()}~${this.getPartOfString(str, 2).trim()}`;
    }
    return `${this.getPartOfString(str, 1).toLowerCase()}`;
  }

  // проверяем тип чекбокса
  public checkFilter(str: string): string {
    let res: boolean = false;
    if (this.categoryFilter) {
      res = this.categoryFilter.checkboxes.some((filter): boolean => filter.id === str);
    }
    return res === true ? QueryParameters.Category : QueryParameters.Size;
  }

  // добавляем и убираем классы
  public addClassesForCards(activeFilters: string[], cards: Card[]): void {
    this.resetClasses(activeFilters, cards); // сбрасываем классы
    const byCategory: Card[] = this.filterByCategory(cards);
    const bySize: Card[] = this.filterBySize(cards);
    const byPrice: Card[] = this.filterByPrice(cards);
    const byCount: Card[] = this.filterByCount(cards);
    const bySearch: Card[] = this.filterBySearch(cards);

    // если у каких-либо массивов отфильтрованных карт есть длина
    if (!!byCategory.length || !!bySize.length || !!byPrice.length || !!byCount.length || !!bySearch.length) {
      // если отфильтрованный массив по поиску не имеет значений, но в query search-параметр есть - скрываем все карты
      if (!bySearch.length && getQueryParams(QueryParameters.Search) !== null) {
        this.visibleCards = [];
        this.doNotFoundVisible();
      } else {
        this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount, bySearch);
        // меняем количество товаров около чекбоксов на актуальное
        if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
        if (this.sizeFilter) this.assignQuantity(this.sizeFilter);
        // скрываем надпись not found и делаем карточки видимыми
        this.visibleCards.forEach((visibleCard): void => {
          if (this.notFoundText) {
            this.notFoundText.classList.add('hidden');
          }
          visibleCard.element.classList.remove('hidden');
        });
      }
    } else {
      // если при применении фильтров значений нет, но активные фильтры не пустые
      // значит у нас нет пересечения между фильтрами. Выводим not found
      // eslint-disable-next-line no-lonely-if
      if (this.activeFilters.length && !this.visibleCards.length) {
        this.visibleCards.length = 0;
        if (this.notFoundText) {
          this.notFoundText.classList.remove('hidden');
          this.cardsAll.forEach((card): void => {
            card.element.classList.add('hidden');
          });
        }
        this.doNotFoundVisible();
        if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
        if (this.sizeFilter) this.assignQuantity(this.sizeFilter);
      } else {
        this.visibleCards = this.cardsAll;
        if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
        if (this.sizeFilter) this.assignQuantity(this.sizeFilter);
      }
    }
    this.setCountFrom(this.visibleCards);
    this.setNewRange(this.visibleCards);
    this.changeFoundItemsCount();
  }

  // сброс классов
  public resetClasses(activeFilters: string[], cards: Card[]): void {
    cards.forEach((card): void => {
      if (activeFilters.length === 0) {
        // если массив пустой, делаем все карточки видимыми
        card.element.classList.remove('hidden');
      } else {
        card.element.classList.add('hidden');
      }
    });
  }

  public filterBySize(cards: Card[]): Card[] {
    return cards.filter(({ size }): boolean => {
      return this.activeFilters.some((filter): boolean => size.includes(filter));
    });
  }

  public filterByCategory(cards: Card[]): Card[] {
    return cards.filter(({ category }): boolean => {
      return this.activeFilters.some((filter): boolean => category.includes(filter));
    });
  }

  public filterByPrice(cards: Card[]): Card[] {
    const [priceFrom, priceTo]: number[] = this.getCountAndPrice(this.activeFilters, QueryParameters.Price);
    return cards.filter((card): boolean => {
      return card.price >= priceFrom && card.price <= priceTo;
    });
  }

  public filterByCount(cards: Card[]): Card[] {
    const [countFrom, countTo]: number[] = this.getCountAndPrice(this.activeFilters, QueryParameters.Count);
    return cards.filter((card): boolean => {
      return card.stock >= countFrom && card.stock <= countTo;
    });
  }

  public filterBySearch(cards: Card[]): Card[] {
    return cards.filter(({ element }): boolean => {
      return this.activeFilters.some((filter: string): boolean => {
        const temp: string = this.getPartOfString(filter, 0);
        if (temp !== QueryParameters.Search) return false;
        return element.innerText.toLowerCase().includes(this.getPartOfString(filter, 1));
      });
    });
  }

  // делаем notFound видимым
  public doNotFoundVisible(): void {
    if (this.notFoundText) {
      this.notFoundText.classList.remove('hidden');
      this.cardsAll.forEach((card): void => {
        card.element.classList.add('hidden');
      });
    }
    if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
    if (this.sizeFilter) this.assignQuantity(this.sizeFilter);
  }

  // функция принимает отфильтрованные значения категории, размера, цены и остатка
  // на складе в виде массивов карточек, проверяет, что массивы не пустые и в зависимости
  // от этого фильтрует товары, исключая те, которые не подходят по всем активным фильтрам.
  public filterArrays(arr1: Card[], arr2: Card[], arr3: Card[], arr4: Card[], arr5: Card[]): Card[] {
    const allArr: Card[][] = [arr1, arr2, arr3, arr4, arr5].filter((arr): boolean => arr.length > 0);
    const result: Card[] = allArr.reduce((acc: Card[], item: Card[]) => {
      return acc.filter((elem: Card): boolean => item.includes(elem));
    });
    return result;
  }

  // установить количество текущих карточек для всех чекбоксов
  public setCountFrom(data: Card[]): void {
    // получаю массив типов
    const allCheckbox: CountForFilter[] = [
      ...findCountOfCurrentProducts(data, QueryParameters.Category),
      ...findCountOfCurrentProducts(data, QueryParameters.Size),
    ];
    allCheckbox.forEach((subtype: CountForFilter): void => {
      this.assignQuantity(
        subtype.type === QueryParameters.Category ? this.categoryFilter : this.sizeFilter,
        subtype.key,
        subtype.count,
      );
    });
  }

  // указываю количество в textcontent
  public assignQuantity(filter: Filter | null, key?: string, count?: number): void {
    if (filter && filter.allCountsFrom) {
      filter.allCountsFrom.forEach((elem): void => {
        const temp: HTMLElement = elem;
        if (!key && !count) {
          temp.textContent = '0';
        } else if (elem.id === key) {
          temp.textContent = `${count}`;
        }
      });
    }
  }

  // смена общего количества карточек
  public changeFoundItemsCount(): void {
    if (this.postersFound) {
      this.postersFound.textContent = this.activeFilters.length
        ? `Found: ${this.visibleCards.length}`
        : `Found: ${this.cardsAll.length}`;

      if (this.postersFound.textContent === 'Found: 0') {
        this.doNotFoundVisible();
      }
      if (this.postersFound.textContent === `Found: ${this.cardsAll.length}`) {
        if (!getQueryParams(QueryParameters.Price) && !getQueryParams(QueryParameters.Count)) {
          if (this.priceFilter) this.resetRange(this.priceFilter);
          if (this.stockFilter) this.resetRange(this.stockFilter);
        }
      }
    }
  }

  // сброс input range ползунков
  public resetRange(filterType: Filter): void {
    // eslint-disable-next-line object-curly-newline
    const { highestInput, lowestInput, maxElement, minElement } = filterType;
    if (lowestInput && lowestInput instanceof HTMLInputElement && minElement) {
      lowestInput.setAttribute('value', lowestInput.min);
      minElement.textContent = filterType === this.priceFilter ? `$ ${lowestInput.value}` : `${lowestInput.value}`;
    }
    if (highestInput && highestInput instanceof HTMLInputElement && maxElement) {
      highestInput.setAttribute('value', highestInput.max);
      maxElement.textContent = filterType === this.priceFilter ? `$ ${highestInput.value}` : `${highestInput.value}`;
    }
  }

  public getCountAndPrice(activeFilters: string[], type: string): number[] {
    let result: number[] = [];
    activeFilters.forEach((filter): void => {
      if (this.getPartOfString(filter, 0) === type) {
        result = [+this.getPartOfString(filter, 1), +this.getPartOfString(filter, 2)];
      }
    });
    return result;
  }

  // функция reset всех фильтров
  public resetFilters = (e: Event): void => {
    e.preventDefault();
    deleteAllQueryParams();
    this.activeFilters.length = 0;
    this.addClassesForCards(this.activeFilters, this.cardsAll);
    this.checkUrlInfo();
  };

  // копирование текущей ссылки
  private copyLink = (e: Event): void => {
    e.preventDefault();
    if (e.target && e.target instanceof HTMLButtonElement) {
      e.target.textContent = 'Link copied!';
      e.target.style.color = '#FF7D15';
      const url: string = window.location.href;
      navigator.clipboard.writeText(url);
      setTimeout((): void => {
        if (e.target && e.target instanceof HTMLButtonElement) {
          e.target.textContent = 'Copy link';
          e.target.style.color = '#65635f';
        }
      }, 1000);
    }
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
      const index: number = this.addedItems.findIndex((i): boolean => i.id === subject.id);
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
