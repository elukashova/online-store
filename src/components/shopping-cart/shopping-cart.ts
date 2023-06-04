/* eslint-disable max-lines-per-function */
import './shopping-cart.styles.css';
import cardsData from '../../assets/json/data';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';
import CartCard from './card-cart';
import Header from '../header/header';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { PosterStorageInfo } from '../../utils/localStorage.types';
import { ObservedSubject } from '../card/card.types';
import { Callback, PromoInputs, PromoValues } from './shopping-cart.types';
import ModalWindow from '../modal-window/modal-window';
import { setQueryParams, getQueryParams } from '../../utils/queryParams';
import Routes from '../app/routes.types';

export default class ShoppingCart extends BaseComponent {
  private itemsOrder: number = 0;

  private addedItems: PosterStorageInfo[] = [];

  private cartItems: number;

  public totalPrice: number;

  private totalSumContainer: HTMLElement | null = null;

  private totalPriceElement: HTMLElement | null = null;

  private cartItemsElement: HTMLElement | null = null;

  private cartContainer: HTMLElement | null = null;

  private summaryContainer: HTMLElement | null = null;

  private leftArrowBtn: HTMLElement | null = null;

  private rightArrowBtn: HTMLElement | null = null;

  private currentPageElement: HTMLElement | null = null;

  private itemsPerPageElement: HTMLInputElement | null = null;

  private buyNowButton: HTMLElement | null = null;

  private itemsPerPage: number = Number(getQueryParams('limit')) ? Number(getQueryParams('limit')) : 2;

  private pagesNumber: number = 0;

  private currentPage: number = Number(getQueryParams('page')) ? Number(getQueryParams('page')) : 1;

  // индексы, которые мне нужны для создания карточек при перелистывании
  private startIdx: number = 0;

  private endIdx: number = 0;

  // булеан, который нужен для обновления порядкового номера при пролистывании назад
  private slideBack: boolean = false;

  // и для обновления количества товара на странице
  private itemsNumChange: boolean = false;

  // элементы для промокода
  private promocodeContainer: HTMLElement | null = null;

  private promoInputElement: HTMLInputElement | null = null;

  private promoApplyWrapper: HTMLElement | null = null;

  private promoDropWrapper: HTMLElement | null = null;

  private currentPromosElement: HTMLElement | null = null;

  private applyPromoBtn: HTMLElement | null = null;

  private dropPromoBtn: HTMLElement | null = null;

  private newPriceElement: HTMLElement | null = null;

  private appliedPromosElement: HTMLElement | null = null;

  private afterPromoPriceContainer: HTMLElement | null = null;

  private currentPromoValue: number = 0;

  private afterPromoPrice: number = 0;

  private currentPromoName: string = '';

  public appliedPromos: string[] = [];

  private isCheckout: boolean = false;

  private totalDiscount: number = 0;

  // eslint-disable-next-line max-len
  constructor(private header: Header, private callback: Callback, private root?: HTMLElement, checkout?: boolean) {
    super('div', 'cart-container cart');
    if (checkout) {
      this.isCheckout = true;
    }
    this.cartItems = this.header.headerInfo.cartItems;
    this.totalPrice = this.header.headerInfo.totalPrice;
    const storageInfo: PosterStorageInfo[] | null = <PosterStorageInfo[]>checkDataInLocalStorage('addedPosters');
    const promoStorageInfo: string[] | null = <string[]>checkDataInLocalStorage('appliedPromo');
    if (storageInfo) {
      // сохраняю инфу из local storage для создания карточек
      this.addedItems = storageInfo.slice();
      // считаю количество страниц в пагинации
      this.pagesNumber = Math.ceil(this.addedItems.length / this.itemsPerPage);
      this.render();
      // проверяем, было ли уже применены скидки
      if (promoStorageInfo) {
        this.appliedPromos = promoStorageInfo.slice();
        this.appliedPromos.forEach((promo) => {
          const key: number = this.choosePromoValue(promo);
          this.afterPromoPrice = this.calculateNewPrice();
          this.createElementsForAppliedPromo(promo, key);
        });
      }
    } else {
      this.showEmptyCart();
    }
  }

  public render(): void {
    // items block
    this.cartContainer = rendered('div', this.element, 'cart__items_container cart-items');
    const cartInfoContainer: HTMLElement = rendered('div', this.cartContainer, 'cart-items__info');
    const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
    rendered('span', totalNumWrapper, 'info-items__text', 'Items on page:');
    this.itemsPerPageElement = rendered('input', totalNumWrapper, 'info-items__number-input', '', {
      type: 'number',
      value: `${this.itemsPerPage}`,
      min: '1',
      max: `${this.addedItems.length}`,
    });
    // eslint-disable-next-line prettier/prettier
    this.itemsPerPageElement.addEventListener('change', () => this.itemsNumberInputCallback(this.itemsPerPageElement?.value));
    const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
    rendered('span', totalPagesWrapper, 'cart-items__info_pages_text', 'Pages:');
    const buttonsWrapper: HTMLElement = rendered('div', totalPagesWrapper, 'info-pages__btns');
    this.leftArrowBtn = rendered('img', buttonsWrapper, 'info-pages__btn-left disabled', '', {
      src: 'assets/icons/cart-btn__left.svg',
      alt: 'left arrow',
    });
    this.currentPageElement = rendered('span', buttonsWrapper, 'info-pages__pages-total', `${this.currentPage}`);
    this.rightArrowBtn = rendered('img', buttonsWrapper, 'info-pages__btn-right disabled', '', {
      src: 'assets/icons/cart-btn__right.svg',
      alt: 'right arrow',
    });

    // items
    // проверяю количество товаров, чтобы понять, нужна ли пагинация
    if (this.addedItems.length <= this.itemsPerPage) {
      this.createItemsCards(this.addedItems, this.callback);
    } else if (this.addedItems.length > this.itemsPerPage && this.currentPage === 1) {
      // передаем первые два товара на первую страницу пагинации
      this.createItemsCards(this.addedItems.slice(0, this.itemsPerPage), this.callback);
      // активируем кнопку и добавляем листенер
      this.activateNextPageBtn();
    } else if (this.addedItems.length > this.itemsPerPage && this.currentPage !== 1) {
      this.itemsNumChange = true;
      this.showNotFirstPage();
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
    this.totalSumContainer = rendered('div', this.summaryContainer, 'cart-summary__total-sum_container total-sum');
    rendered('span', this.totalSumContainer, 'cart-total-sum__text', 'Total:');
    this.totalPriceElement = rendered(
      'span',
      this.totalSumContainer,
      'cart-total-sum__num',
      `$ ${this.totalPrice.toLocaleString('en-US')}`,
    );
    this.promocodeContainer = rendered('div', this.summaryContainer, 'cart-summary__promocode cart-promocode');
    this.promoInputElement = rendered('input', this.promocodeContainer, 'cart-promocode__input', '', {
      type: 'search',
      placeholder: 'Enter promo code',
    });
    this.promoInputElement.addEventListener('input', this.promocodeInputCallback);
    this.currentPromosElement = rendered(
      'p',
      this.promocodeContainer,
      'cart-promocode__active-codes',
      "Active promo codes: 'BEHAPPY', 'SMILE'",
    );
    rendered('div', this.summaryContainer, 'cart-total-sum__line');
    this.buyNowButton = rendered('button', this.summaryContainer, 'cart-total-sum__buy-btn', 'buy now');
    this.buyNowButton.addEventListener('click', this.buyNowBtnCallback);
    // открываем модалку, если корзина открыта через product page
    if (this.isCheckout === true) {
      this.openModalCheckout();
      this.isCheckout = false;
    }
  }

  // функция создания карточек
  private createItemsCards(array: PosterStorageInfo[], callback: () => void): void {
    for (let i: number = 0; i < array.length; i += 1) {
      cardsData.products.forEach((data) => {
        if (array[i].id === data.id) {
          if (this.slideBack === true || this.itemsNumChange === true) {
            this.itemsOrder = this.addedItems.indexOf(array[0]);
          }
          this.slideBack = false;
          this.itemsNumChange = false;
          this.itemsOrder += 1;
          const card = new CartCard(data, this.itemsOrder, callback);
          card.attachObserver(this.header);
          card.attachObserver(this);
          this.cartContainer?.append(card.element);
        }
      });
    }
  }

  // колбэк для кнопки покупки
  private buyNowBtnCallback = (): void => {
    this.openModalCheckout();
  };

  private openModalCheckout(): void {
    if (this.root) {
      const modal: ModalWindow = new ModalWindow(this.root);
      modal.attachObserver(this.header);
      modal.attachObserver(this);
      this.root.insertBefore(modal.element, this.header.element);
    }
  }

  // колбэк для правой стрелки (пагинация)
  private nextPageBtnCallback = (): void => {
    this.slideBack = false;
    // меняем номер страницы
    this.currentPage += 1;
    setQueryParams('page', `${this.currentPage}`);
    this.updatePageNumber();
    // активируем левую кнопку и вешаем слушатель
    this.activatePrevPageBtn();
    // удаляем старые карточки
    this.deleteCards();
    // проверяем количнство следующих карточек
    this.startIdx += this.itemsPerPage;
    this.endIdx = this.startIdx + this.itemsPerPage;
    if (this.addedItems.slice(this.startIdx).length <= this.itemsPerPage) {
      this.createItemsCards(this.addedItems.slice(this.startIdx), this.callback);
      if (this.currentPage === this.pagesNumber && this.rightArrowBtn) {
        this.deactivateNextPageBtn();
      }
    } else {
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
    }
  };

  // создание карточек после чтения query с номером страницы, которая не равна 1
  private showNotFirstPage(): void {
    this.activatePrevPageBtn();
    if (this.currentPage === this.pagesNumber && this.rightArrowBtn) {
      this.deactivateNextPageBtn();
    } else {
      this.activateNextPageBtn();
    }
    this.startIdx = this.currentPage * this.itemsPerPage - this.itemsPerPage;
    this.endIdx = this.startIdx + this.itemsPerPage;
    this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
  }

  // колбэк для левой стрелки (пагинация)
  private prevPageBtnCallback = (): void => {
    this.slideBack = true;
    // меняем номер страницы
    this.currentPage -= 1;
    setQueryParams('page', `${this.currentPage}`);
    this.updatePageNumber();
    // активируем правую кнопку, если речь о предпоследней странице
    if (this.rightArrowBtn && this.currentPage === this.pagesNumber - 1) {
      this.updateBtnState(this.rightArrowBtn);
      this.rightArrowBtn.addEventListener('click', this.nextPageBtnCallback);
    }
    // удаляем старые карточки
    this.deleteCards();
    // проверяем, на какой мы странице и создаем новые карточки
    this.endIdx = this.startIdx;
    this.startIdx -= this.itemsPerPage;
    this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
    if (this.currentPage === 1) {
      if (this.leftArrowBtn) {
        this.deactivatePrevPageBtn();
      }
    }
  };

  // колбэк для смены количества айтемов на странице
  private itemsNumberInputCallback = (value: string | undefined): void => {
    if (this.itemsPerPageElement && value && value !== '0') {
      // проверка, нужно ли реактивировать кнопки
      this.activateBothButtons();
      this.itemsPerPageElement.textContent = value;
      this.itemsPerPage = Number(value);
      this.updatePaginationAfterChange();
      // проверить, единственная ли у нас страница
      if (this.itemsPerPage === this.addedItems.length || Number(value) > this.addedItems.length) {
        this.currentPage = 1;
        this.deactivateBothButtons();
        setQueryParams('page', `${this.currentPage}`);
      }
      setQueryParams('limit', `${this.itemsPerPage}`);
    }
  };

  // колбэк для ввода промокода
  private promocodeInputCallback = (): void => {
    if (this.currentPromosElement && this.promoInputElement) {
      const { value } = this.promoInputElement;
      this.currentPromoName = value;
      if (this.promoApplyWrapper) {
        this.deletePromoApplyBlock();
      }
      if (value === PromoInputs.behappy || value === PromoInputs.smile) {
        const key: number = this.choosePromoValue(value);
        this.createApplyOrDropPromoBlock(value, key);
      }
    }
  };

  // выбрать нужное значение промокода
  public choosePromoValue(value: string): number {
    // eslint-disable-next-line max-len
    this.currentPromoValue = value === PromoInputs.behappy ? PromoValues.behappy : PromoValues.smile;
    return this.currentPromoValue;
  }

  // подвешивание блок apply, с кнопкой и без
  private createApplyOrDropPromoBlock(value: string, key: number): void {
    this.promoApplyWrapper = this.createAplyOrDropPromoBlock(value, key, 'apply');
    if (this.currentPromosElement && this.currentPromosElement.parentNode) {
      const parent: ParentNode | null = this.currentPromosElement.parentNode;
      parent.insertBefore(this.promoApplyWrapper, this.currentPromosElement);
    }
  }

  private createDropBlock(value: string, key: number, action: string): void {
    this.promoDropWrapper = this.createAplyOrDropPromoBlock(value, key, action);
    //  подвешиваем drop
    if (this.appliedPromosElement) {
      this.appliedPromosElement.append(this.promoDropWrapper);
    }
  }

  // создание блока для применения или сброса прокомода
  private createAplyOrDropPromoBlock(value: string, key: number, action?: string): HTMLElement {
    const newBlock: HTMLElement = document.createElement('div');
    newBlock.classList.add(`cart-promocode__code-${action}_wrapper`);
    rendered('span', newBlock, `cart-promocode__code-${action}_text`, `Promo ${value} - ${key} %`);
    if (action === 'apply' && !this.appliedPromos.includes(value)) {
      this.applyPromoBtn = rendered('button', newBlock, `cart-promocode__code-${action}_btn`, `${action}`);
      this.applyPromoBtn.addEventListener('click', this.applyPromoCallback);
    } else if (action === 'drop') {
      this.dropPromoBtn = rendered('button', newBlock, `cart-promocode__code-${action}_btn`, `${action}`, {
        name: value,
      });
      this.dropPromoBtn.addEventListener('click', this.dropPromoCallback);
    }
    return newBlock;
  }

  // колбэк при применении промокода
  private applyPromoCallback = (): void => {
    this.deletePromoApplyBlock();
    // данные для создания блока с drop
    const value: string | null = this.currentPromoName ? this.currentPromoName : '';
    const key: number | null = value ? this.choosePromoValue(value) : null;
    // сохраняем инфо о премененном коде
    this.appliedPromos.push(value);
    setDataToLocalStorage(this.appliedPromos, 'appliedPromo');
    // оставляем описание промо под input, но без кнопки
    if (value && key) {
      this.createApplyOrDropPromoBlock(value, key);
      this.afterPromoPrice = this.calculateNewPrice();
      this.createElementsForAppliedPromo(value, key);
    }
  };

  private createElementsForAppliedPromo(value: string, key: number): void {
    if (this.totalSumContainer && key && value) {
      // запоминаем будущего родителя новых элементов
      const parent: ParentNode | null = this.totalSumContainer.parentNode;
      // если это первый код
      if (!this.totalSumContainer.classList.contains('old-price')) {
        // перечеркиваем старую цену
        this.totalSumContainer.classList.add('old-price');
        // создаем блок с новой ценой
        this.afterPromoPriceContainer = document.createElement('div');
        this.afterPromoPriceContainer.classList.add('cart-summary__total-sum_container');
        this.afterPromoPriceContainer.classList.add('new-price');
        rendered('span', this.afterPromoPriceContainer, 'cart-total-sum__text', 'Total:');
        this.newPriceElement = rendered(
          'span',
          this.afterPromoPriceContainer,
          'cart-total-sum__num',
          `$ ${this.afterPromoPrice}`,
        );
        // создаем родителя для промокодов
        this.appliedPromosElement = document.createElement('div');
        this.appliedPromosElement.classList.add('cart-promocode__applied-codes');
        rendered('span', this.appliedPromosElement, 'cart-promocode__applied-codes_title', 'Applied promo codes:');
        // подвешиваем новый элемент
        if (parent && this.promocodeContainer) {
          parent.insertBefore(this.afterPromoPriceContainer, this.promocodeContainer);
          parent.insertBefore(this.appliedPromosElement, this.promocodeContainer);
        }
      } else if (this.newPriceElement) {
        this.newPriceElement.textContent = `$ ${this.afterPromoPrice.toLocaleString('en-US')}`;
      }
      // создание блока с drop
      this.createDropBlock(value, key, 'drop');
    }
  }

  // колбэк при удаления промокода
  private dropPromoCallback = (): void => {
    // удаляем промо из массива с примененными промо
    if (this.dropPromoBtn) {
      const promo: string | null = this.dropPromoBtn.getAttribute('name');
      if (promo) {
        const index: number = this.appliedPromos.indexOf(promo);
        this.appliedPromos.splice(index, 1);
        setDataToLocalStorage(this.appliedPromos, 'appliedPromo');
      }
      // пересчитываем цену и удаляем блок с экрана
      if (this.appliedPromos.length) {
        this.afterPromoPrice = this.calculateNewPrice();
        if (this.newPriceElement) {
          this.newPriceElement.textContent = `$ ${this.afterPromoPrice.toLocaleString('en-US')}`;
        }
        const elementToRemove: ParentNode | null = this.dropPromoBtn.parentNode;
        if (this.appliedPromosElement && elementToRemove) {
          this.appliedPromosElement.removeChild(elementToRemove);
        }
      } else if (this.appliedPromosElement) {
        const parent: ParentNode | null = this.appliedPromosElement.parentNode;
        if (parent && this.afterPromoPriceContainer && this.totalSumContainer) {
          parent.removeChild(this.afterPromoPriceContainer);
          parent.removeChild(this.appliedPromosElement);
          this.totalSumContainer.classList.remove('old-price');
        }
      }
      // если в поле осталось название дропнутого промо, надо вывести кнопку apply
      if (this.promoInputElement && this.promoInputElement instanceof HTMLInputElement) {
        if (promo && this.promoInputElement.value === promo) {
          this.deletePromoApplyBlock();
          const key: number = this.choosePromoValue(promo);
          this.createApplyOrDropPromoBlock(promo, key);
        }
      }
    }
  };

  // удаление блока с применением промокода
  private deletePromoApplyBlock(): void {
    if (this.promoApplyWrapper) {
      if (this.promoApplyWrapper.parentElement === this.promocodeContainer) {
        this.promocodeContainer?.removeChild(this.promoApplyWrapper);
      }
    }
  }

  // считаем цену после примеренного промокода
  public calculateNewPrice(): number {
    const promoValues: number[] = [];
    let result: number = 0;
    if (this.appliedPromos.length) {
      this.appliedPromos.forEach((promo) => {
        const value: number = this.choosePromoValue(promo);
        promoValues.push(value);
      });
      this.totalDiscount = promoValues.reduce((a, v) => a + v, 0);
      result = this.totalPrice - (this.totalPrice * this.totalDiscount) / 100;
    }
    return result;
  }

  // повторяющийся код, который использую при пагинации и удалении
  private updatePaginationAfterChange(): void {
    this.itemsNumChange = true;
    this.deleteCards();
    this.pagesNumber = Math.ceil(this.addedItems.length / this.itemsPerPage);
    // обновить нумерацию страниц и создать новые карточки
    this.updatePageNumber();
    this.startIdx = this.itemsPerPage * (this.currentPage - 1);
    this.endIdx = this.startIdx + this.itemsPerPage;
    if (this.currentPage === 1) {
      this.startIdx = 0;
      this.endIdx = this.startIdx + this.itemsPerPage;
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
      this.deactivatePrevPageBtn();
      if (this.pagesNumber === 1) {
        this.deactivateNextPageBtn();
      }
    } else if (this.currentPage === this.pagesNumber) {
      this.createItemsCards(this.addedItems.slice(this.startIdx), this.callback);
      this.deactivateNextPageBtn();
    } else {
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
    }
  }

  // обновление номера страницы
  private updatePageNumber(): void {
    if (this.currentPageElement) {
      // если я нахожусь на странице, которая превышает возможное кол-во страниц (пагинация)
      if (this.currentPage > this.pagesNumber) {
        this.currentPage = this.pagesNumber;
        this.currentPageElement.textContent = `${this.pagesNumber}`;
        setQueryParams('page', `${this.currentPage}`);
        if (this.rightArrowBtn) {
          this.deactivateNextPageBtn();
        }
      } else {
        this.currentPageElement.textContent = `${this.currentPage}`;
      }
    }
  }

  // разные функции активации и деактивации кнопок
  private deactivateBothButtons(): void {
    this.deactivatePrevPageBtn();
    this.deactivateNextPageBtn();
  }

  private deactivatePrevPageBtn(): void {
    if (this.leftArrowBtn && !this.leftArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.leftArrowBtn);
      this.leftArrowBtn.removeEventListener('click', this.prevPageBtnCallback);
    }
  }

  private deactivateNextPageBtn(): void {
    if (this.rightArrowBtn && !this.rightArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.rightArrowBtn);
      this.rightArrowBtn.removeEventListener('click', this.nextPageBtnCallback);
    }
  }

  private activateBothButtons(): void {
    this.activatePrevPageBtn();
    this.activateNextPageBtn();
  }

  private activatePrevPageBtn(): void {
    if (this.leftArrowBtn && this.leftArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.leftArrowBtn);
      this.leftArrowBtn.addEventListener('click', this.prevPageBtnCallback);
    }
  }

  private activateNextPageBtn(): void {
    if (this.rightArrowBtn && this.rightArrowBtn.classList.contains('disabled')) {
      this.updateBtnState(this.rightArrowBtn);
      this.rightArrowBtn.addEventListener('click', this.nextPageBtnCallback);
    }
  }

  // активируем и деактивирем кнопки (класс)
  private updateBtnState(btn: HTMLElement): void {
    btn.classList.toggle('disabled');
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
  public update(subject: ObservedSubject, e?: Event): void {
    if (subject instanceof CartCard) {
      if (subject.plus === true && subject.itemAmount <= subject.stock) {
        this.updateCartInfoForObserver(subject, subject.plus);
      } else if (subject.minus === true && subject.itemAmount >= 0) {
        this.updateCartInfoForObserver(subject);
        this.checkIfZero(subject);
      }
    }
    if (subject instanceof ModalWindow) {
      if (e) {
        this.showThankYouMessage();
      }
      this.cartContainer?.remove();
      this.summaryContainer?.remove();
      localStorage.removeItem('addedPosters');
      localStorage.removeItem('appliedPromo');
    }
  }

  private updateCartInfoForObserver(subject: CartCard, isAdding?: boolean): void {
    const modifier = isAdding ? 1 : -1;
    this.totalPrice += modifier * subject.price;
    this.cartItems += modifier;
    this.updateSummaryContent();
    this.updatePromoPrice();
    for (let i: number = 0; i < this.addedItems.length; i += 1) {
      if (this.addedItems[i].id === subject.id) {
        this.addedItems[i].quantity += modifier;
      }
    }
    setDataToLocalStorage(this.addedItems, 'addedPosters');
  }

  private updateSummaryContent(): void {
    if (this.totalPriceElement && this.cartItemsElement) {
      this.totalPriceElement.textContent = `$ ${this.totalPrice.toLocaleString('en-US')}`;
      this.cartItemsElement.textContent = `${this.cartItems}`;
    }
  }

  private updatePromoPrice(): void {
    if (this.newPriceElement) {
      this.afterPromoPrice = this.calculateNewPrice();
      this.newPriceElement.textContent = `$ ${this.afterPromoPrice.toLocaleString('en-US')}`;
    }
  }

  private showThankYouMessage(): void {
    let count: number = 3;
    const background: HTMLElement = rendered('div', this.element, 'redirect-message-container');
    rendered('h2', background, 'redirect-message-container__thank-you-text', 'Thank you for your order!');
    const timerText: HTMLElement = rendered(
      'span',
      background,
      'redirect-message-container__timer-text',
      `Redirect to the store in ${count} seconds`,
    );
    const interval: NodeJS.Timer = setInterval(() => {
      count -= 1;
      timerText.textContent = `Redirect to the store in ${count} seconds`;

      if (count === 0) {
        clearInterval(interval);
        window.history.pushState({}, '', Routes.Home);
        this.callback();
      }
    }, 1000);
  }

  /* проверить, является ли количество одного продукта нулевым
  и последующее удаление */
  private checkIfZero(subject: ObservedSubject): void {
    if (subject instanceof CartCard && subject.itemAmount === 0) {
      this.addedItems = this.addedItems.filter((i) => i.id !== subject.id);
      if (this.addedItems.length > 0) {
        setDataToLocalStorage(this.addedItems, 'addedPosters');
        this.updatePaginationAfterChange();
        // если у меня ноль товара на странице, надо вывести страницу пустой корзины
      } else {
        this.cartContainer?.remove();
        this.summaryContainer?.remove();
        this.showEmptyCart();
        localStorage.removeItem('addedPosters');
      }
    }
  }

  // страница с пустой корзиной
  private showEmptyCart(): void {
    // меняю стили контейнера с грида на флекс
    this.element.style.display = 'flex';
    this.element.style.flexDirection = 'column';
    rendered('span', this.element, 'cart__empty_title', 'Your cart is empty!');
    rendered('img', this.element, 'cart__empty_img', '', {
      src: 'assets/images/empty-cart.png',
      alt: 'Empty cart on orange phone.',
    });
    rendered('span', this.element, 'cart__empty_text', 'Looks like you have not added anything to your cart yet.');
  }
}
