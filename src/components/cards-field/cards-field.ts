/* eslint-disable max-lines-per-function */
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

  public filtersAll: Filter[] = [];

  public activeFilters: string[] = [];

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

    // объединение фильтров
    this.filtersAll.push(categoryFilter, sizeFilter, priceFilter, stockFilter);
    console.log(this.activeFilters);
    /*
    this.filtersAll.forEach((filter) => this.listenInputCheck(this.cardsAll, filter.checkboxes)); */

    const cardsContainer: HTMLElement = rendered('div', this.element, 'cards__container');

    cardsData.products.forEach((data) => {
      const card: Card = new Card(data);
      card.attachObserver(this.header);
      card.attachObserver(this);
      this.cardsAll.push(card);
      cardsContainer.append(card.element);
    });
  }

  public updateActiveFilters(checkboxes: HTMLElement[]): void {
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        this.listenInputCheck(this.cardsAll, checkboxes);
      });
    });
  }

  public listenInputCheck(cards: Card[], checkboxes: HTMLElement[]): void {
    const filters: string[] = [];
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('click', (e) => {
        // скрываем все карточки и обнуляем visible
        cards.forEach((card) => {
          card.element.classList.add('hidden');
          card.element.classList.remove('visible');
        });
        // собираем массив checked фильтров или удаляем из него unchecked
        if (e.target && e.target instanceof HTMLInputElement) {
          if (e.target.checked) {
            filters.push(e.target.id);
          } else {
            filters.splice(filters.indexOf(e.target.id), 1);
          }
        }
        console.log(filters);
        this.activeFilters = filters.slice();
        this.filterByCategoryAndSize(filters, cards);
        console.log(this.activeFilters);
      });
    });
  }

  public filterByCategoryAndSize(filters: string[], cards: Card[]): void {
    const filteredArr: Card[] = [];
    // пока тут цикл, так как пыталась работать с двумя видами фильтров
    for (let i = 0; i < filters.length; i += 1) {
      const temporaryCategoryArr = cards.filter((card) => filters[i] === card.category);
      const temporarySizeArr = cards.filter((card) => filters[i] === card.size);

      filteredArr.push(...temporaryCategoryArr, ...temporarySizeArr);

      /* Код не срабатывает, так как у меня приходит либо один вид фильтров, либо второй.
      Их не получчается объединить.
      Работает полноценно либо только по размеру, либо по категории */
    }

    // если массив пустой делаем все карточки видимыми
    if (filteredArr.length === 0) {
      cards.forEach((card) => {
        card.element.classList.add('visible');
        card.element.classList.remove('hidden');
      });
    } else {
      // если не пустой, делаем видимыми только отфильтрованные
      filteredArr.forEach((visibleCard) => {
        visibleCard.element.classList.add('visible');
        visibleCard.element.classList.remove('hidden');
      });
    }
    // console.log(filteredArr);
  }

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
