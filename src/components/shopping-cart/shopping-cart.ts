/* eslint-disable max-lines-per-function */
import './shopping-cart.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import CartCard from './card-cart';
import Header from '../header/header';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';
import cardsData from '../../assets/json/data';
import { ObservedSubject } from '../card/card.types';
// import { ItemInfoType } from './shopping-cart.types';

export default class Cart extends BaseComponent {
  private storageInfo: JsonObj | null = checkDataInLocalStorage('addedItems');

  private itemsOrder: number = 0;

  private addedItems: number[] = []; // для сохранения id добавленных товаров в local storage

  private cartItems: number;

  private totalPrice: number;

  private totalPriceElement: HTMLElement | null = null;

  private cartItemsElement: HTMLElement | null = null;

  private cartContainer: HTMLElement | null = null;

  private summaryContainer: HTMLElement | null = null;

  private leftArrowBtn: HTMLElement | null = null;

  private rightArrowBtn: HTMLElement | null = null;

  private currentPageElement: HTMLElement | null = null;

  private itemsPerPageElement: HTMLElement | null = null;

  private itemsPerPage: number = 2;

  private pagesNumber: number = 0;

  private currentPage: number = 1;

  // индексы, которые мне нужны для создания карточек при перелистывании
  private startIdx: number = 0;

  private endIdx: number = 0;

  // булеан, который нужен для обновления порядкового номера при пролистывании назад
  private slideBack: boolean = false;

  // и для обновления количества товара на странице
  private itemsNumberChange: boolean = false;

  constructor(public readonly header: Header) {
    super('div', 'cart-container cart');
    this.cartItems = this.header.headerInfo.cartItems;
    this.totalPrice = this.header.headerInfo.totalPrice;
    if (this.storageInfo !== null) {
      // сохраняю id из local storage для создания карточек
      this.addedItems = Object.values(this.storageInfo);
      // считаю количество страниц в пагинации
      this.pagesNumber = Math.ceil(this.addedItems.length / this.itemsPerPage);
      this.render();
    } else {
      this.showEmptyCart();
    }
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // items block
    this.cartContainer = rendered('div', this.element, 'cart__items_container cart-items');
    const cartInfoContainer: HTMLElement = rendered('div', this.cartContainer, 'cart-items__info');
    const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
    rendered('span', totalNumWrapper, 'info-items__text', 'Items:');
    this.itemsPerPageElement = rendered('input', totalNumWrapper, 'info-items__number', '', {
      type: 'text',
      placeholder: '2',
      minlength: '1',
      maxlength: '4',
    });
    this.itemsPerPageElement.addEventListener('change', this.itemsNumberInputCallback);
    const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
    this.leftArrowBtn = rendered('img', totalPagesWrapper, 'info-pages__btn-left disabled', '', {
      src: '../../assets/icons/cart-btn__left.svg',
    });
    this.currentPageElement = rendered('span', totalPagesWrapper, 'info-pages__pages-total', `${this.currentPage}`);
    this.rightArrowBtn = rendered('img', totalPagesWrapper, 'info-pages__btn-right disabled', '', {
      src: '../../assets/icons/cart-btn__right.svg',
    });

    // items
    // проверяю количество товаров, чтобы понять, нужна ли пагинация
    if (this.addedItems.length <= this.itemsPerPage) {
      this.createItemsCards(this.addedItems);
    } else if (this.addedItems.length > this.itemsPerPage) {
      // передаем первые два товара на первую страницу пагинации
      this.createItemsCards(this.addedItems.slice(0, this.itemsPerPage));
      // активируем кнопку и добавляем листенер
      this.activateRightButton();
    }

    // summary
    this.summaryContainer = rendered('div', this.element, 'cart-summary__container cart-summary');
    rendered('span', this.summaryContainer, 'cart-summary__title', 'Summary');
    const totalItemsContainer: HTMLElement = rendered(
      'div',
      this.summaryContainer,
      'cart-summary__total-items_container cart-total-items',
    );
    rendered('span', totalItemsContainer, 'cart-total-items__text', 'Items:');
    this.cartItemsElement = rendered('span', totalItemsContainer, 'cart-total-items__num', `${this.cartItems}`);
    const totalSumContainer: HTMLElement = rendered(
      'div',
      this.summaryContainer,
      'cart-summary__total-sum_container total-sum',
    );
    rendered('span', totalSumContainer, 'cart-total-sum__text', 'Total:');
    this.totalPriceElement = rendered('span', totalSumContainer, 'cart-total-sum__num', `$ ${this.totalPrice}`);
    const promocodeContainer: HTMLElement = rendered(
      'div',
      this.summaryContainer,
      'cart-summary__promocode cart-promocode',
    );
    rendered('input', promocodeContainer, 'cart-promocode__input', '', {
      type: 'search',
      placeholder: 'Enter promo code',
    });
    rendered('div', this.summaryContainer, 'cart-total-sum__line');
    rendered('button', this.summaryContainer, 'cart-total-sum__buy-btn', 'buy now');
  }

  // функция создания карточек
  private createItemsCards(array: number[]): void {
    cardsData.products.forEach((data) => {
      for (let i: number = 0; i < array.length; i += 1) {
        if (data.id === array[i]) {
          if (this.slideBack === true || this.itemsNumberChange === true) {
            this.itemsOrder = this.addedItems.indexOf(array[0]);
          }
          this.slideBack = false;
          this.itemsNumberChange = false;
          this.itemsOrder += 1;
          const card = new CartCard(data, this.itemsOrder);
          card.attachObserver(this.header);
          card.attachObserver(this);
          this.cartContainer?.append(card.element);
        }
      }
    });
  }

  // колбэк для правой стрелки (пагинация)
  // eslint-disable-next-line max-lines-per-function
  private rightBtnCallback = (e: Event): void => {
    this.slideBack = false;
    e.preventDefault();
    // меняем номер страницы
    this.currentPage += 1;
    this.updatePageNumber();
    // активируем левую кнопку и вешаем слушатель
    this.activateLeftButton();
    // удаляем старые карточки
    this.deleteCards();
    // проверяем количнство следующих карточек
    this.startIdx += this.itemsPerPage;
    this.endIdx = this.startIdx + this.itemsPerPage;
    if (this.addedItems.slice(this.startIdx).length <= this.itemsPerPage) {
      this.createItemsCards(this.addedItems.slice(this.startIdx));
      if (this.currentPage === this.pagesNumber && this.rightArrowBtn) {
        this.deactivateRightButton();
      }
    } else {
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx));
    }
  };

  // колбэк для левой стрелки (пагинация)
  private leftBtnCallback = (e: Event): void => {
    e.preventDefault();
    this.slideBack = true;
    // меняем номер страницы
    this.currentPage -= 1;
    this.updatePageNumber();
    // активируем правую кнопку, если речь о предпоследней странице
    if (this.rightArrowBtn && this.currentPage === this.pagesNumber - 1) {
      this.updateBtnState(this.rightArrowBtn);
      this.rightArrowBtn.addEventListener('click', this.rightBtnCallback);
    }
    // удаляем старые карточки
    this.deleteCards();
    // проверяем, на какой мы странице и создаем новые карточки
    this.endIdx = this.startIdx;
    this.startIdx -= this.itemsPerPage;
    this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx));
    if (this.currentPage === 1) {
      if (this.leftArrowBtn) {
        this.deactivateLeftButton();
      }
    }
  };

  // колбэк для смены количества айтемов на странице
  private itemsNumberInputCallback = (e: Event): void => {
    e.preventDefault();
    if (this.itemsPerPageElement && e.target instanceof HTMLInputElement) {
      // проверка, нужно ли реактивировать кнопки
      this.activateBothButtons();
      this.itemsPerPageElement.textContent = e.target.value;
      this.itemsPerPage = Number(e.target.value);
      this.updateAfterChange();
      // проверить, единственная ли у нас страница
      // eslint-disable-next-line max-len
      if (this.itemsPerPage === this.addedItems.length || Number(e.target.value) > this.addedItems.length) {
        this.currentPage = 1;
        this.deactivateBothButtons();
      }
    }
  };

  // повторяющийся код, который использую при пагинации и удалении
  private updateAfterChange(): void {
    this.itemsNumberChange = true;
    this.deleteCards();
    this.pagesNumber = Math.ceil(this.addedItems.length / this.itemsPerPage);
    // обновить нумерацию страниц и создать новые карточки
    this.updatePageNumber();
    this.startIdx = this.itemsPerPage * (this.currentPage - 1);
    this.endIdx = this.startIdx + this.itemsPerPage;
    if (this.currentPage === 1) {
      this.startIdx = 0;
      this.endIdx = this.startIdx + this.itemsPerPage;
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx));
      this.deactivateLeftButton();
      if (this.pagesNumber === 1) {
        this.deactivateRightButton();
      }
    } else if (this.currentPage === this.pagesNumber) {
      this.createItemsCards(this.addedItems.slice(this.startIdx));
      this.deactivateRightButton();
    } else {
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx));
    }
  }

  // обновление номера страницы
  private updatePageNumber(): void {
    if (this.currentPageElement) {
      // если я нахожусь на странице, которая превышает возможное кол-во страниц (пагинация)
      if (this.currentPage > this.pagesNumber) {
        this.currentPage = this.pagesNumber;
        this.currentPageElement.textContent = `${this.pagesNumber}`;
        if (this.rightArrowBtn) {
          this.deactivateRightButton();
        }
      } else {
        this.currentPageElement.textContent = `${this.currentPage}`;
      }
    }
  }

  // разные функции активации и деактивации кнопок
  private deactivateBothButtons(): void {
    this.deactivateLeftButton();
    this.deactivateRightButton();
  }

  private deactivateLeftButton(): void {
    if (this.leftArrowBtn && !this.leftArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.leftArrowBtn);
      this.leftArrowBtn.removeEventListener('click', this.leftBtnCallback);
    }
  }

  private deactivateRightButton(): void {
    if (this.rightArrowBtn && !this.rightArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.rightArrowBtn);
      this.rightArrowBtn.removeEventListener('click', this.rightBtnCallback);
    }
  }

  private activateBothButtons(): void {
    this.activateLeftButton();
    this.activateRightButton();
  }

  private activateLeftButton(): void {
    if (this.leftArrowBtn && this.leftArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.leftArrowBtn);
      this.leftArrowBtn.addEventListener('click', this.leftBtnCallback);
    }
  }

  private activateRightButton(): void {
    if (this.rightArrowBtn && this.rightArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.rightArrowBtn);
      this.rightArrowBtn.addEventListener('click', this.rightBtnCallback);
    }
  }

  // активируем и деактивирем кнопки (класс)
  private updateBtnState(btn: HTMLElement): void {
    if (btn && btn.classList.contains('disabled')) {
      btn.classList.remove('disabled');
    } else if (btn && !btn.classList.contains('disabled')) {
      btn.classList.add('disabled');
    }
  }

  // удаление детей (карточек)
  private deleteCards(): void {
    if (this.cartContainer) {
      if (this.cartContainer.children.length > 1) {
        let idx: number = this.cartContainer.children.length - 1;
        while (this.cartContainer.children.length > 1 && idx > 0) {
          this.cartContainer.removeChild(this.cartContainer.children[idx]);
          idx -= 1;
        }
      }
    }
  }

  // функция обсервера
  public update(subject: ObservedSubject): void {
    if (subject instanceof CartCard) {
      if (subject.plus === true && subject.cartItemInfo.itemAmount <= subject.stock) {
        this.totalPrice += subject.price;
        this.cartItems += 1;
        if (this.totalPriceElement && this.cartItemsElement) {
          this.totalPriceElement.textContent = `$ ${this.totalPrice}`;
          this.cartItemsElement.textContent = `${this.cartItems}`;
        }
      } else if (subject.minus === true && subject.cartItemInfo.itemAmount >= 0) {
        this.totalPrice -= subject.price;
        this.cartItems -= 1;
        if (this.totalPriceElement && this.cartItemsElement) {
          this.totalPriceElement.textContent = `$ ${this.totalPrice}`;
          this.cartItemsElement.textContent = `${this.cartItems}`;
        }
        this.checkIfZero(subject);
      }
    }
  }

  /* проверить, является ли количество одного продукта нулевым
  и последующее удаление */
  private checkIfZero(subject: ObservedSubject): void {
    if (subject instanceof CartCard && subject.cartItemInfo.itemAmount === 0) {
      localStorage.removeItem(`${subject.id}`); // удаляю из local storage
      const index = this.addedItems.indexOf(subject.id); // удаляю из массива добавленных в корзину
      this.addedItems.splice(index, 1);
      setDataToLocalStorage(this.addedItems); // обновляю инфу о добавленных в корзину
      this.updateAfterChange();
      // если у меня ноль товара на странице, надо вывести страницу пустой корзины
      if (this.addedItems.length === 0) {
        this.cartContainer?.remove();
        this.summaryContainer?.remove();
        this.showEmptyCart();
        localStorage.removeItem('addedItems');
      }
    }
  }

  // страница с пустой корзиной
  private showEmptyCart(): void {
    // меняю стили контейнера с грида на флекс
    this.element.style.display = 'flex';
    this.element.style.flexDirection = 'column';

    rendered('img', this.element, 'cart__empty_img', '', {
      src: '../../assets/images/empty-cart.png',
    });
    rendered('span', this.element, 'cart__empty_title', 'Your cart is empty!');
    rendered('span', this.element, 'cart__empty_text', 'Looks like you have not added anything to your cart yet.');
  }
}