/* eslint-disable operator-linebreak */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
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
import { QueryParameters, SortTypes } from './enums.cards-field';
import { Callback } from '../shopping-cart/shopping-cart.types';

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
    let uniqueCategories = cardsData.products.map((item) => item.category);
    uniqueCategories = Array.from(new Set(uniqueCategories));
    const categoryNames: HTMLElement = this.categoryFilter.renderCheckbox(uniqueCategories, 'category');
    filtersContainer.append(categoryNames);

    // фильтр по размеру
    this.sizeFilter = new Filter(filtersContainer, 'size', this.updateActiveFilters);
    let uniqueSize = cardsData.products.map((item) => item.size);
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
    const sortWrapper = rendered('div', contentContainer, 'cards__sort-wrapper');
    this.selectInput = rendered('select', sortWrapper, 'cards__sort-products');
    this.cardsContainer = rendered('div', contentContainer, 'cards__container search', '', {
      id: 'cards__container',
    });
    this.defaultOption = rendered('option', this.selectInput, 'cards__sort-standart-value', 'Sort posters', {
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
    this.allOptions = [this.defaultOption, priceAsc, priceDesc, RatingAsc, RatingDesc];
    this.postersFound = rendered('div', sortWrapper, 'cards__found-count', `Found: ${cardsData.products.length}`);
    const searchInputWrapper = rendered('div', sortWrapper, 'cards__search-wrapper');
    this.searchInput = rendered('input', searchInputWrapper, 'cards__search', '', {
      type: 'search',
      placeholder: 'Search poster',
      id: 'search',
    });
    rendered('img', searchInputWrapper, 'cards__search-icon', '', { src: 'assets/icons/search.svg' });
    const viewTypes = rendered('div', sortWrapper, 'cards__view-types');
    this.viewFourProducts = rendered('img', viewTypes, 'cards__view-four change-type', '', {
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
    this.searchInput.addEventListener('input', (e) => {
      if (e.currentTarget && e.currentTarget instanceof HTMLInputElement) {
        const inputText = e.currentTarget.value.trim().toLowerCase();
        const val = `search,${inputText}`;
        if (inputText === '') {
          if (this.notFoundText) {
            this.notFoundText.classList.add('hidden');
          }
        }
        this.setNewRange(this.cardsAll);
        this.updateActiveFilters(val);
      }
    });

    // слушатель для сортировки
    this.selectInput.addEventListener('change', () => {
      if (this.cardsContainer && this.selectInput) {
        if (this.selectInput instanceof HTMLSelectElement) {
          this.sortCards(this.selectInput.value);
        }
      }
    });

    // слушатель смены вида
    viewTypes.addEventListener('click', (e) => {
      if (this.cardsContainer) {
        if (e.target && e.target instanceof HTMLElement) {
          if (e.target.classList.contains('cards__view-four')) {
            this.changeViewOfProducts('four');
          } else {
            this.changeViewOfProducts('two');
          }
        }
      }
    });
  }

  // Проверяем есть ли данные в query параметрах
  public checkUrlInfo(): void {
    const parameters: string = window.location.search;
    if (parameters.length > 1) {
      // если есть query, получаем их, чтобы применить фильтры
      let decodedParams = decodeURI(parameters);
      decodedParams = decodedParams.slice(1);
      const regex = /=|~/;
      const splitedParams = decodedParams.split('&').map((elem) => elem.split(regex));
      this.splitParametersIntoTypes(splitedParams);
    } else {
      this.cardsAll = [];
      this.element.replaceChildren();
      this.render();
    }
  }

  // разбиваем параметры
  public splitParametersIntoTypes = (params: string[][]): void => {
    const splitParameters = (value: string[], index: number): string => value[index];
    const updateFilters = (parameters: string[]): void => {
      const values = parameters.splice(1);
      if (values.length) {
        values.forEach((value) => this.pushToActive(this.activeFilters, value));
      }
    };
    params.forEach((elem) => {
      elem.forEach((item) => item.split(','));
      const type = splitParameters(elem, 0);
      if (type === QueryParameters.View) {
        this.changeViewOfProducts(splitParameters(elem, 1));
      } else if (type === QueryParameters.Sorting) {
        this.sortCards(splitParameters(elem, 1));
      } else {
        // если фильтры то обновляем this.activeFilters и передаем какие чекбоксы сделать checked
        if (type === QueryParameters.Category || type === QueryParameters.Size) {
          updateFilters(elem);
          if (this.categoryFilter) {
            this.addCheckedForCheckboxes(this.categoryFilter, this.activeFilters);
          }
          if (this.sizeFilter) {
            this.addCheckedForCheckboxes(this.sizeFilter, this.activeFilters);
          }
        }
        if (type === QueryParameters.Price || type === QueryParameters.Count) {
          this.pushToActive(this.activeFilters, elem.toString());
          // выставить ползунки
        }
        if (type === QueryParameters.Search) {
          this.pushToActive(this.activeFilters, elem.toString());
          if (this.searchInput && this.searchInput instanceof HTMLInputElement) {
            this.searchInput.value = splitParameters(elem, 1);
          }
        }
        this.addClassesForCards(this.activeFilters, this.cardsAll);
      }
    });
  };

  // добавляем чекбоксам checked, если они есть в квери параметрах
  public addCheckedForCheckboxes(filter: Filter, activeFilters: string[]): void {
    if (filter) {
      filter.checkboxes.forEach((checkbox) => {
        if (activeFilters.length) {
          activeFilters.forEach((active) => {
            if (checkbox.id === active) {
              checkbox.setAttribute('checked', 'checked');
            }
          });
        }
      });
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
          setQueryParams('view', SortTypes.ViewFour);
        } else if (str === this.viewTwoProducts.id) {
          this.cardsContainer.classList.add('change-type');
          this.viewTwoProducts.classList.add('change-type');
          this.viewFourProducts.classList.remove('change-type');
          setQueryParams('view', SortTypes.ViewTwo);
        } else {
          this.cardsContainer.classList.remove('change-type');
          this.viewFourProducts.classList.remove('change-type');
          this.viewTwoProducts.classList.remove('change-type');
        }
      }
    }
  }

  // сортируем карточки
  public sortCards(str: string): void {
    if (this.selectInput instanceof HTMLSelectElement) {
      this.sortByField(this.cardsAll, str);
      setQueryParams('sorting', str);
      // добавляем selected выбранному option
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
    // аппендим карточки в контейнер в новом порядке
    this.cardsAll.forEach((card) => {
      if (this.cardsContainer) {
        this.cardsContainer.append(card.element);
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
      // если в поиске - пустая строка, удаляем из фильтров
      if (this.getPartOfString(filter, 1) === ' ' || this.getPartOfString(filter, 1) === '') {
        this.activeFilters.splice(this.activeFilters.indexOf(filter));
        deleteQueryParams(QueryParameters.Search);
      } else {
        this.addOrReplaceFilter(QueryParameters.Search, filter);
      }
      // для значений категории и размера
    } else {
      const queryType = this.checkFilter(filter);
      const prev = getQueryParams(queryType);

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
        if (this.categoryFilter) this.removeCheckboxes(this.categoryFilter, filter);
        if (this.sizeFilter) this.removeCheckboxes(this.sizeFilter, filter);
        // если значения нет в активных - пушим либо через ~, либо просто, если других значений нет
      } else if (!this.activeFilters.includes(filter)) {
        this.pushToActive(this.activeFilters, filter);
        if (prev !== null) {
          setQueryParams(queryType, `${prev}~${filter}`);
        } else {
          setQueryParams(queryType, filter);
        }
        if (this.categoryFilter) this.addCheckboxes(this.categoryFilter, filter);
        if (this.sizeFilter) this.addCheckboxes(this.sizeFilter, filter);
      }
    }
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  public addCheckboxes(filterType: Filter, filter: string): void {
    filterType.checkboxes.forEach((category) => {
      if (category.id === filter) {
        category.setAttribute('checked', 'checked');
      }
    });
  }

  public removeCheckboxes(filterType: Filter, filter: string): void {
    filterType.checkboxes.forEach((category) => {
      if (category.id === filter) {
        category.removeAttribute('checked');
      }
    });
  }

  // добавление или замена фильтра в активные фильтры
  public addOrReplaceFilter(filterType: string, filter: string): void {
    const prev = this.activeFilters.find((elem) => elem.startsWith(this.getPartOfString(filter, 0)));
    console.log(prev);
    const query = this.composeQueryString(filter);
    if (prev === undefined) {
      this.pushToActive(this.activeFilters, filter);
    } else {
      this.activeFilters.splice(this.activeFilters.indexOf(prev), 1, filter);
    }
    setQueryParams(filterType, query);
  }

  // функция для пуша в активные фильтры
  public pushToActive = (array: string[], value: string): number => array.push(value);

  // составляем строку значения в зависимости от типа фильтра
  public composeQueryString(str: string): string {
    if (this.getPartOfString(str, 0) !== QueryParameters.Search) {
      return `${this.getPartOfString(str, 1).trim()}~${this.getPartOfString(str, 2).trim()}`;
    }
    return `${this.getPartOfString(str, 1).toLowerCase()}`;
  }

  // проверяем тип чекбокса
  public checkFilter(str: string): string {
    let res;
    if (this.categoryFilter) {
      res = this.categoryFilter.checkboxes.some((filter) => filter.id === str);
    }
    return res === true ? QueryParameters.Category : QueryParameters.Size;
  }

  // добавляем и убираем классы
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
        const temp = this.getPartOfString(filter, 0);
        if (temp !== QueryParameters.Search) return false;
        return element.innerText.toLowerCase().includes(this.getPartOfString(filter, 1));
      });
    });
    /* // если при применении фильтров есть значения - фильтруем их все вместе
    if (!!byCategory.length || !!bySize.length || !!byPrice.length || !!byCount.length || !!bySearch.length) {
      this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount, bySearch);
      // меняем количество товаров около чекбоксов на актуальное
      if (this.categoryFilter) this.changeStartValueForNotEmpty(this.categoryFilter);
      if (this.sizeFilter) this.changeStartValueForNotEmpty(this.sizeFilter);
      // скрываем надпись not found и делаем карточки видимыми
      this.visibleCards.forEach((visibleCard) => {
        if (this.notFoundText) {
          this.notFoundText.classList.add('hidden');
        }
        visibleCard.element.classList.remove('hidden');
      });
    } else {
      this.visibleCards.length = 0;
      // если при применении фильтров значений нет, но активные фильтры не пустые
      // значит у нас нет пересечения между фильтрами. Выводим not found
      if (this.activeFilters.length !== 0) {
        if (this.notFoundText) {
          this.notFoundText.classList.remove('hidden');
          this.cardsAll.forEach((card) => {
            card.element.classList.add('hidden');
          });
        }
        if (this.categoryFilter) this.changeStartValueForNotEmpty(this.categoryFilter);
        if (this.sizeFilter) this.changeStartValueForNotEmpty(this.sizeFilter);
      } else if (this.visibleCards.length === 0 && this.activeFilters.length === 0) {
        if (this.categoryFilter) this.changeValueForEmpty(this.categoryFilter);
        if (this.sizeFilter) this.changeValueForEmpty(this.sizeFilter);
      }
    } */

    // если при применении фильтров есть значения - фильтруем их все вместе
    if (!!byCategory.length || !!bySize.length || !!byPrice.length || !!byCount.length || !!bySearch.length) {
      this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount, bySearch);
      // меняем количество товаров около чекбоксов на актуальное
      if (this.categoryFilter) this.changeStartValueForNotEmpty(this.categoryFilter);
      if (this.sizeFilter) this.changeStartValueForNotEmpty(this.sizeFilter);
      // скрываем надпись not found и делаем карточки видимыми
      this.visibleCards.forEach((visibleCard) => {
        if (this.notFoundText) {
          this.notFoundText.classList.add('hidden');
        }
        visibleCard.element.classList.remove('hidden');
      });
    } else {
      this.visibleCards.length = 0;
      // если при применении фильтров значений нет, но активные фильтры не пустые
      // значит у нас нет пересечения между фильтрами. Выводим not found
      if (this.activeFilters.length !== 0) {
        if (this.notFoundText) {
          this.notFoundText.classList.remove('hidden');
          this.cardsAll.forEach((card) => {
            card.element.classList.add('hidden');
          });
        }
        if (this.categoryFilter) this.changeStartValueForNotEmpty(this.categoryFilter);
        if (this.sizeFilter) this.changeStartValueForNotEmpty(this.sizeFilter);
      } else if (this.visibleCards.length === 0 && this.activeFilters.length === 0) {
        if (this.categoryFilter) this.changeValueForEmpty(this.categoryFilter);
        if (this.sizeFilter) this.changeValueForEmpty(this.sizeFilter);
      }
    }

    /* if (!bySearch.length) {
      if (getQueryParams(QueryParameters.Search)) {
        console.log('Поиск не дал результатов');
        this.visibleCards = [];
        this.doNotFoundVisible();
      }
    } else if (!!byCategory.length || !!bySize.length || !!byPrice.length || !!byCount.length || !!bySearch.length) {
      this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount, bySearch);
      // меняем количество товаров около чекбоксов на актуальное
      if (this.categoryFilter) this.changeStartValueForNotEmpty(this.categoryFilter);
      if (this.sizeFilter) this.changeStartValueForNotEmpty(this.sizeFilter);
      // скрываем надпись not found и делаем карточки видимыми
      this.visibleCards.forEach((visibleCard) => {
        if (this.notFoundText) {
          this.notFoundText.classList.add('hidden');
        }
        visibleCard.element.classList.remove('hidden');
      });
    } else {
      this.visibleCards.length = 0;
      // если при применении фильтров значений нет, но активные фильтры не пустые
      // значит у нас нет пересечения между фильтрами. Выводим not found
      if (this.activeFilters.length !== 0) {
        this.doNotFoundVisible();
      } else if (this.visibleCards.length === 0 && this.activeFilters.length === 0) {
        if (this.categoryFilter) this.changeValueForEmpty(this.categoryFilter);
        if (this.sizeFilter) this.changeValueForEmpty(this.sizeFilter);
      }
    } */
    this.setCountFrom(this.visibleCards);
    this.setNewRange(this.visibleCards);
    this.changeFoundItemsCount();
  }

  public doNotFoundVisible(): void {
    if (this.notFoundText) {
      this.notFoundText.classList.remove('hidden');
      this.cardsAll.forEach((card) => {
        card.element.classList.add('hidden');
      });
    }
    if (this.categoryFilter) this.changeStartValueForNotEmpty(this.categoryFilter);
    if (this.sizeFilter) this.changeStartValueForNotEmpty(this.sizeFilter);
  }

  public setNewRange(data: Card[]): void {
    if (data.length) {
      const [priceMin, priceMax] = this.getRange(data, 'price');
      const [stockMin, stockMax] = this.getRange(data, 'stock');
      const changeValue = (typeFilter: Filter): void => {
        // eslint-disable-next-line object-curly-newline
        const { lowestInput, highestInput, minElement, maxElement } = typeFilter;
        if (
          lowestInput &&
          highestInput &&
          lowestInput instanceof HTMLInputElement &&
          highestInput instanceof HTMLInputElement
        ) {
          if (typeFilter === this.priceFilter) {
            lowestInput.setAttribute('value', `${priceMin}`);
            highestInput.setAttribute('value', `${priceMax}`);
          } else if (typeFilter === this.stockFilter) {
            lowestInput.setAttribute('value', `${stockMin}`);
            highestInput.setAttribute('value', `${stockMax}`);
          }
          if (minElement) {
            minElement.textContent = `$${lowestInput.value}`;
          }
          if (maxElement) {
            maxElement.textContent = `$${highestInput.value}`;
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
    const arrCopy = [...data];
    const result = arrCopy.sort((a, b) => (type === 'price' ? a.price - b.price : a.stock - b.stock));
    // eslint-disable-next-line operator-linebreak
    const [resMin, resMax] =
      type === 'price'
        ? [result[0].price, result[result.length - 1].price]
        : [result[0].stock, result[result.length - 1].stock];
    return [resMin, resMax];
  }

  // получаем изначальные значения количества товаров и указываем их
  public changeValueForEmpty(filter: Filter): void {
    if (filter && filter.allCountsFrom) {
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
    }
  }

  public changeStartValueForNotEmpty(filter: Filter): void {
    if (filter && filter.allCountsFrom) {
      filter.allCountsFrom.forEach((elem) => {
        const temp = elem;
        temp.textContent = '0';
      });
    }
  }

  // получить часть строки
  public getPartOfString = (value: string, index: number): string => value.split(',')[index];

  // установить количество текущих карточек для чекбоксов
  public setCountFrom(data: Card[]): void {
    // получаю массив типов
    const allCheckbox = [
      ...findCountOfCurrentProducts(data, QueryParameters.Category),
      ...findCountOfCurrentProducts(data, QueryParameters.Size),
    ];
    allCheckbox.forEach((subtype) => {
      this.assignQuantity(
        subtype.type === QueryParameters.Category ? this.categoryFilter : this.sizeFilter,
        subtype.key,
        subtype.count,
      );
    });
  }

  // указываю количество в textcontent
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

  // смена общего количества карточек
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
      if (this.getPartOfString(filter, 0) === 'price') {
        result = [+this.getPartOfString(filter, 1), +this.getPartOfString(filter, 2)];
      }
    });
    return result;
  }

  public getCount(activeFilters: string[]): number[] {
    let result: number[] = [];
    activeFilters.forEach((filter) => {
      if (this.getPartOfString(filter, 0) === 'count') {
        result = [+this.getPartOfString(filter, 1), +this.getPartOfString(filter, 2)];
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
      setTimeout(() => {
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
      console.log(this.addedItems);
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
