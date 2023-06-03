/* eslint-disable object-curly-newline */
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
import { CardDataInfo, ObservedSubject } from '../card/card.types';
import findCountOfCurrentProducts from './utils/find.current.count';
import { setDataToLocalStorage, checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageInfo } from '../../utils/localStorage.types';
import { deleteAllQueryParams, deleteQueryParams, getQueryParams, setQueryParams } from '../../utils/queryParams';
import {
  QueryParameters,
  TypeOfView,
  SortBy,
  CountForFilter,
  FilterNames,
  optionsData,
  QUERY_SEPARATOR,
} from './cards-field.types';
import { Callback } from '../shopping-cart/shopping-cart.types';

type FilterInfo = {
  type: 'checkbox' | 'inputRange';
  name: FilterNames.PRICE | FilterNames.STOCK;
  filter: Filter | null;
};

export default class CardsField extends BaseComponent {
  public cardsAll: Card[] = [];

  public activeFilters: string[] = [];

  public visibleCards: Card[] = [];

  public addedItems: PosterStorageInfo[] = [];

  public allOptions: HTMLElement[] | null = null;

  public cardsContainer: HTMLElement | null = null;

  public notFoundText: HTMLElement | null = null;

  public postersFound: HTMLElement | null = null;

  public selectInput!: HTMLElement;

  public searchInput: HTMLElement | null = null;

  public defaultOption: HTMLElement | null = null;

  public categoryFilter: Filter | null = null;

  public sizeFilter: Filter | null = null;

  public priceFilter: Filter | null = null;

  public stockFilter: Filter | null = null;

  public viewFourProducts: HTMLElement | null = null;

  public viewTwoProducts: HTMLElement | null = null;

  constructor(public readonly header: Header, private callback: Callback) {
    super('div', 'content__container');
    this.setAddedItemsFromLS();
    this.render();
    this.checkUrlInfo();
  }

  public render(): void {
    const filtersContainer: HTMLElement = rendered('form', this.element, 'filters__container filters');
    const buttonsContainer: HTMLElement = rendered('div', filtersContainer, 'filters__btns-wrapper');

    const resetButton: HTMLButtonElement = rendered('button', buttonsContainer, 'filters__btn-reset', 'Reset filters');
    resetButton.addEventListener('click', () => this.resetFilters());
    const copyLinkButton: HTMLButtonElement = rendered('button', buttonsContainer, 'filters__btn-copy', 'Copy link');
    copyLinkButton.addEventListener('click', () => this.copyLink(copyLinkButton));

    this.categoryFilter = this.createFilter(
      'checkbox',
      FilterNames.CATEGORY,
      filtersContainer,
      this.updateActiveFilters,
    );
    this.sizeFilter = this.createFilter('checkbox', FilterNames.SIZE, filtersContainer, this.updateActiveFilters);
    this.priceFilter = this.createFilter('inputRange', FilterNames.PRICE, filtersContainer, this.updateActiveFilters);
    this.stockFilter = this.createFilter('inputRange', FilterNames.STOCK, filtersContainer, this.updateActiveFilters);

    const contentContainer: HTMLElement = rendered('div', this.element, 'cards__content');
    const sortWrapper: HTMLElement = rendered('div', contentContainer, 'cards__sort-wrapper');
    this.selectInput = rendered('select', sortWrapper, 'cards__sort-products');
    this.cardsContainer = rendered('div', contentContainer, 'cards__container search', '');
    this.defaultOption = rendered('option', this.selectInput, 'cards__sort-standart-value', 'Sort posters', {
      value: 'no-sort',
      disabled: '',
    });
    if (this.selectInput instanceof HTMLElement) {
      const options = optionsData.map((option: { value: string; label: string }) => {
        return rendered('option', this.selectInput, `cards__sort-by-${option.value}`, option.label, {
          value: option.value,
        });
      });

      this.allOptions = [this.defaultOption, ...options];
    }

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
    this.cardsAll = cardsData.products.map((data) => {
      const card: Card = new Card(data, this.callback);
      card.attachObserver(this.header);
      card.attachObserver(this);
      if (this.cardsContainer) this.cardsContainer.append(card.element);
      return card;
    });

    this.setCountFrom(this.cardsAll);
    this.setCountsToInitialValue();

    this.searchInput.addEventListener('input', (): void => {
      this.toDoWhenSearchInputListen();
    });
    this.selectInput.addEventListener('change', (): void => {
      if (this.cardsContainer && this.selectInput) {
        if (this.selectInput instanceof HTMLSelectElement) {
          this.sortCards(this.selectInput.value);
        }
      }
    });
    viewTypes.addEventListener('click', (e: Event): void => this.toDoWhenViewTypesListen(e));
  }

  public setCountsToInitialValue(): void {
    if (this.categoryFilter) this.categoryFilter.setCountsTo(this.cardsAll);
    if (this.sizeFilter) this.sizeFilter.setCountsTo(this.cardsAll);
  }

  public toDoWhenSearchInputListen(): void {
    if (this.searchInput instanceof HTMLInputElement) {
      const inputText: string = this.searchInput.value.trim().toLowerCase();
      const searchInputValue: string = `search,${inputText}`;
      if (inputText === '' && this.notFoundText) {
        this.notFoundText.classList.add('hidden');
      }
      this.setNewRange(this.cardsAll);
      this.updateActiveFilters(searchInputValue);
    }
  }

  public createFilter(
    filterType: 'checkbox' | 'inputRange',
    filterName: keyof CardDataInfo,
    filtersContainer: HTMLElement,
    updateActiveFilters: (filter: string) => void,
  ): Filter {
    const filter: Filter = new Filter(
      filtersContainer,
      updateActiveFilters,
      filterName,
      filterName === 'price' ? '$' : 'undefined',
    );
    const values: string[] = cardsData.products.map((item: CardDataInfo): string => String(item[filterName]));
    const uniqueValues = Array.from(new Set(values));
    let filterElem: HTMLElement;

    if (filterType === 'checkbox') {
      filterElem = filter.createCheckbox(uniqueValues);
    } else {
      console.log(filter);
      filterElem = filter.createInputRange(filterName);
    }

    filtersContainer.append(filterElem);
    return filter;
  }

  public setNewRange(data: Card[]): void {
    if (!data.length) {
      return;
    }

    const changeValue = (filter: Filter, min: number, max: number): void => {
      const { lowestInput, highestInput, minElement, maxElement } = filter;

      if (lowestInput instanceof HTMLInputElement && highestInput instanceof HTMLInputElement) {
        lowestInput.setAttribute('value', `${min}`);
        highestInput.setAttribute('value', `${max}`);

        if (minElement) {
          minElement.textContent = `${this.getPrefix(filter)} ${lowestInput.value}`;
        }
        if (maxElement) {
          maxElement.textContent = `${this.getPrefix(filter)} ${highestInput.value}`;
        }
      }
    };

    const filters: FilterInfo[] = [
      { type: 'inputRange', name: FilterNames.PRICE, filter: this.priceFilter },
      { type: 'inputRange', name: FilterNames.STOCK, filter: this.stockFilter },
    ];

    filters
      .filter((filter) => filter.type === 'inputRange' && filter.filter !== null)
      .forEach((filter) => {
        const [min, max] = this.getRange(data, filter.name);
        if (filter.filter) {
          changeValue(filter.filter, min, max);
        }
      });
  }

  public getRange(data: Card[], field: FilterNames.PRICE | FilterNames.STOCK): number[] {
    const arrCopy: Card[] = [...data];
    const result: Card[] = arrCopy.sort((a: Card, b: Card): number => {
      return a.products[field] - b.products[field];
    });
    const [resMin, resMax]: number[] = [result[0].products[field], result[result.length - 1].products[field]];
    return [resMin, resMax];
  }

  private getPrefix(typeFilter: Filter): string {
    return typeFilter === this.priceFilter ? '$' : '';
  }

  public sortCards(str: string): void {
    if (this.selectInput instanceof HTMLSelectElement) {
      this.sortByField(this.cardsAll, str);
      setQueryParams('sorting', str);
      if (this.allOptions) {
        this.allOptions.forEach((option: HTMLElement): void => option.removeAttribute('selected'));
        this.allOptions.forEach((option: HTMLElement): void => {
          if (this.selectInput && this.selectInput instanceof HTMLSelectElement) {
            if (option instanceof HTMLOptionElement && str === option.value) {
              option.setAttribute('selected', 'selected');
            }
          }
        });
      }
      this.cardsAll.forEach((card: Card): void => {
        if (this.cardsContainer) {
          this.cardsContainer.append(card.element);
        }
      });
    }
  }

  public sortByField(arr: Card[], field: string): Card[] {
    return arr.sort((a: Card, b: Card): number => {
      if (field.includes(SortBy.Asc)) {
        return field.includes(QueryParameters.Price)
          ? a.products.price - b.products.price
          : a.products.rating - b.products.rating;
      }
      return field.includes(QueryParameters.Price)
        ? b.products.price - a.products.price
        : b.products.rating - a.products.rating;
    });
  }

  public toDoWhenViewTypesListen(e: Event): void {
    if (this.cardsContainer) {
      if (e.target && e.target instanceof HTMLElement) {
        this.changeViewOfProducts(e.target.id === TypeOfView.ViewFour ? TypeOfView.ViewFour : TypeOfView.ViewTwo);
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
          setQueryParams('view', TypeOfView.ViewFour);
        } else if (str === this.viewTwoProducts.id) {
          this.cardsContainer.classList.add('change-type');
          this.viewTwoProducts.classList.add('change-type');
          this.viewFourProducts.classList.remove('change-type');
          setQueryParams('view', TypeOfView.ViewTwo);
        } else {
          this.cardsContainer.classList.remove('change-type');
          this.viewFourProducts.classList.remove('change-type');
          this.viewTwoProducts.classList.remove('change-type');
        }
      }
    }
  }

  public checkUrlInfo(): void {
    const parameters: string = window.location.search;
    if (parameters.length > 1) {
      let decodedParams: string = decodeURI(parameters);
      decodedParams = decodedParams.slice(1);
      this.splitParametersIntoTypes(decodedParams);
    } else {
      this.cardsAll = [];
      this.element.replaceChildren();
      this.render();
    }
  }

  public splitParametersIntoTypes = (decodedParams: string): void => {
    const regex: RegExp = /=|~/;
    const splitedParams: string[][] = decodedParams.split('&').map((elem): string[] => elem.split(regex));
    const splitParameters = (value: string[], index: number): string => value[index];
    const updateFilters = (parameters: string[]): void => {
      const values: string[] = parameters.splice(1);
      if (values.length) {
        values.forEach((value): void => {
          this.activeFilters.push(value);
        });
      }
    };
    splitedParams.forEach((elem: string[]): void => {
      const type: string = splitParameters(elem, 0);
      if (type === QueryParameters.View) {
        this.changeViewOfProducts(splitParameters(elem, 1));
      } else if (type === QueryParameters.Sorting) {
        this.sortCards(splitParameters(elem, 1));
      } else {
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
          this.activeFilters.push(elem.toString());
        }
        if (type === QueryParameters.Search) {
          this.activeFilters.push(elem.toString());
          if (this.searchInput && this.searchInput instanceof HTMLInputElement) {
            this.searchInput.value = splitParameters(elem, 1);
          }
        }
      }
    });
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  public addOrRemoveChecked(filter: Filter, value: string, isChecked: boolean): void {
    filter.checkboxes.forEach((checkbox: HTMLElement): void => {
      if (checkbox.id === value) {
        if (isChecked) {
          checkbox.setAttribute('checked', 'checked');
        } else {
          checkbox.removeAttribute('checked');
        }
      }
    });
  }

  public updateActiveFilters = (filter: string): void => {
    const filterType = this.getPartOfString(filter, 0);
    switch (filterType) {
      case QueryParameters.Price:
        this.addOrReplaceFilter(QueryParameters.Price, filter);
        break;
      case QueryParameters.Count:
        this.addOrReplaceFilter(QueryParameters.Count, filter);
        break;
      case QueryParameters.Search:
        this.updateSearchFilter(filter);
        break;
      default:
        this.updateOtherFilters(filter);
        break;
    }
    this.addClassesForCards(this.activeFilters, this.cardsAll);
  };

  private updateSearchFilter = (filter: string): void => {
    const searchParam = this.getPartOfString(filter, 1);
    if (searchParam === ' ' || searchParam === '') {
      this.removeFilter(filter, QueryParameters.Search);
    } else {
      this.addOrReplaceFilter(QueryParameters.Search, filter);
    }
  };

  private updateOtherFilters = (filter: string): void => {
    const queryType = this.checkFilter(filter);
    const prev = getQueryParams(queryType);

    if (this.activeFilters.includes(filter)) {
      this.removeFilter(filter, queryType);
    } else if (!this.activeFilters.includes(filter)) {
      this.addFilter(filter, queryType, prev);
    }

    if (this.categoryFilter) {
      this.addOrRemoveChecked(this.categoryFilter, filter, this.activeFilters.includes(filter));
    }
    if (this.sizeFilter) {
      this.addOrRemoveChecked(this.sizeFilter, filter, this.activeFilters.includes(filter));
    }
  };

  private addFilter = (filter: string, queryType: string, prev: string | null): void => {
    this.activeFilters.push(filter);
    if (prev !== null) {
      setQueryParams(queryType, `${prev}${QUERY_SEPARATOR}${filter}`);
    } else {
      setQueryParams(queryType, filter);
    }
  };

  private removeFilter = (filter: string, queryType: string): void => {
    const index = this.activeFilters.indexOf(filter);
    if (index !== -1) {
      this.activeFilters.splice(index, 1);
      deleteQueryParams(queryType);
    }
    if (this.categoryFilter) {
      this.addOrRemoveChecked(this.categoryFilter, filter, false);
    }
    if (this.sizeFilter) {
      this.addOrRemoveChecked(this.sizeFilter, filter, false);
    }
  };

  public getPartOfString = (value: string, index: number): string => value.split(',')[index];

  public addOrReplaceFilter(filterType: string, filter: string): void {
    const prev = this.activeFilters.find((elem: string): boolean => elem.startsWith(this.getPartOfString(filter, 0)));
    const query = this.composeQueryString(filter);
    if (prev === undefined) {
      this.activeFilters.push(filter);
    } else {
      this.activeFilters.splice(this.activeFilters.indexOf(prev), 1, filter);
    }
    setQueryParams(filterType, query);
  }

  public composeQueryString(str: string): string {
    if (this.getPartOfString(str, 0) !== QueryParameters.Search) {
      return `${this.getPartOfString(str, 1).trim()}${QUERY_SEPARATOR}${this.getPartOfString(str, 2).trim()}`;
    }
    return `${this.getPartOfString(str, 1).toLowerCase()}`;
  }

  public checkFilter(str: string): string {
    let res: boolean = false;
    if (this.categoryFilter) {
      res = this.categoryFilter.checkboxes.some((filter): boolean => filter.id === str);
    }
    return res === true ? QueryParameters.Category : QueryParameters.Size;
  }

  public addClassesForCards(activeFilters: string[], cards: Card[]): void {
    this.resetClasses(activeFilters, cards); // сбрасываем классы
    const byCategory: Card[] = this.filterByCategory(cards);
    const bySize: Card[] = this.filterBySize(cards);
    const byPrice: Card[] = this.filterByPrice(cards);
    const byCount: Card[] = this.filterByCount(cards);
    const bySearch: Card[] = this.filterBySearch(cards);

    if (!!byCategory.length || !!bySize.length || !!byPrice.length || !!byCount.length || !!bySearch.length) {
      if (!bySearch.length && getQueryParams(QueryParameters.Search) !== null) {
        this.visibleCards = [];
        this.doNotFoundVisible();
      } else {
        this.visibleCards = this.filterArrays(byCategory, bySize, byPrice, byCount, bySearch);
        if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
        if (this.sizeFilter) this.assignQuantity(this.sizeFilter);
        this.visibleCards.forEach((visibleCard): void => {
          if (this.notFoundText) {
            this.notFoundText.classList.add('hidden');
          }
          visibleCard.element.classList.remove('hidden');
        });
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this.activeFilters.length && !this.visibleCards.length) {
        this.doNotFoundVisible();
        if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
      } else {
        this.visibleCards = this.cardsAll;
        if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
      }
      if (this.sizeFilter) this.assignQuantity(this.sizeFilter);
    }
    this.setCountFrom(this.visibleCards);
    this.setNewRange(this.visibleCards);
    this.changeFoundItemsCount();
  }

  public resetClasses(activeFilters: string[], cards: Card[]): void {
    cards.forEach((card: Card): void => {
      if (activeFilters.length) {
        card.element.classList.add('hidden');
      } else {
        card.element.classList.remove('hidden');
      }
    });
  }

  public filterBySize(cards: Card[]): Card[] {
    return cards.filter(({ products }: Card): boolean => {
      const { size } = products;
      return this.activeFilters.some((filter): boolean => size.includes(filter));
    });
  }

  public filterByCategory(cards: Card[]): Card[] {
    return cards.filter(({ products }: Card): boolean => {
      const { category } = products;
      return this.activeFilters.some((filter): boolean => category.includes(filter));
    });
  }

  public filterByPrice(cards: Card[]): Card[] {
    const [priceFrom, priceTo]: number[] = this.getCountAndPrice(this.activeFilters, QueryParameters.Price);
    return cards.filter((card: Card): boolean => {
      return card.products.price >= priceFrom && card.products.price <= priceTo;
    });
  }

  public filterByCount(cards: Card[]): Card[] {
    const [countFrom, countTo]: number[] = this.getCountAndPrice(this.activeFilters, QueryParameters.Count);
    return cards.filter((card: Card): boolean => {
      return card.products.stock >= countFrom && card.products.stock <= countTo;
    });
  }

  public filterBySearch(cards: Card[]): Card[] {
    return cards.filter(({ element }: Card): boolean => {
      return this.activeFilters.some((filter: string): boolean => {
        const temp: string = this.getPartOfString(filter, 0);
        if (temp !== QueryParameters.Search) return false;
        return element.innerText.toLowerCase().includes(this.getPartOfString(filter, 1));
      });
    });
  }

  public doNotFoundVisible(): void {
    if (this.notFoundText) {
      this.notFoundText.classList.remove('hidden');
      this.cardsAll.forEach((card: Card): void => {
        card.element.classList.add('hidden');
      });
    }
    /*    if (this.categoryFilter) this.assignQuantity(this.categoryFilter);
    if (this.sizeFilter) this.assignQuantity(this.sizeFilter); */
  }

  public filterArrays(arr1: Card[], arr2: Card[], arr3: Card[], arr4: Card[], arr5: Card[]): Card[] {
    const allArr: Card[][] = [arr1, arr2, arr3, arr4, arr5].filter((arr): boolean => arr.length > 0);
    const result: Card[] = allArr.reduce((acc: Card[], item: Card[]) => {
      return acc.filter((elem: Card): boolean => item.includes(elem));
    });
    return result;
  }

  public setCountFrom(data: Card[]): void {
    const allCheckbox: CountForFilter[] = [
      ...findCountOfCurrentProducts(data, QueryParameters.Category),
      ...findCountOfCurrentProducts(data, QueryParameters.Size),
    ];

    /* this.categoryFilter?.updateCount(allCheckbox); */
    allCheckbox.forEach((subtype: CountForFilter): void => {
      this.assignQuantity(
        subtype.type === QueryParameters.Category ? this.categoryFilter : this.sizeFilter,
        subtype.key,
        subtype.count,
      );
    });
  }

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

  public resetFilters = (): void => {
    deleteAllQueryParams();
    this.activeFilters.length = 0;
    this.addClassesForCards(this.activeFilters, this.cardsAll);
    this.checkUrlInfo();
  };

  private copyLink = (button: HTMLButtonElement): void => {
    const temporaryButton = button;
    temporaryButton.textContent = 'Link copied!';
    temporaryButton.style.color = '#FF7D15';
    const url: string = window.location.href;
    navigator.clipboard.writeText(url);
    setTimeout((): void => {
      temporaryButton.textContent = 'Copy link';
      temporaryButton.style.color = '#65635f';
    }, 1000);
  };

  public update(subject: ObservedSubject): void {
    if (subject instanceof Card && subject.element.classList.contains('added')) {
      const info: PosterStorageInfo = {
        id: 0,
        quantity: 0,
      };
      info.id = subject.products.id;
      info.quantity += 1;
      this.addedItems.push(info);
      setDataToLocalStorage(this.addedItems, 'addedPosters');
    }

    if (subject instanceof Card && !subject.element.classList.contains('added')) {
      const index: number = this.addedItems.findIndex((i): boolean => i.id === subject.products.id);
      this.addedItems.splice(index, 1);
      if (this.addedItems.length > 0) {
        setDataToLocalStorage(this.addedItems, 'addedPosters');
      } else {
        localStorage.removeItem('addedPosters');
      }
    }
  }

  private setAddedItemsFromLS(): void {
    const storageInfo: PosterStorageInfo[] | null = checkDataInLocalStorage('addedPosters');
    if (storageInfo !== null) {
      this.addedItems = storageInfo.slice();
    }
  }
}
