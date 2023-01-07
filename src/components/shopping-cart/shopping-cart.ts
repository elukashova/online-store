/* eslint-disable max-lines-per-function */
import './shopping-cart.styles.css';
import cardsData from '../../assets/json/data';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';
import CartCard from './card-cart';
import Header from '../header/header';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { PosterStorageType } from '../../utils/localStorage.types';
import { ObservedSubject } from '../card/card.types';
import { Callback, PromoInputs, PromoValues } from './shopping-cart.types';
import ModalWindow from '../modal-window/modal-window';
import { setQueryParams, getQueryParams } from '../../utils/queryParams';

export default class Cart extends BaseComponent {
  private storageInfo: PosterStorageType[] | null = checkDataInLocalStorage('addedPosters');

  private promoStorageInfo: string[] | null = checkDataInLocalStorage('appliedPromo');

  private itemsOrder: number = 0;

  private addedItems: PosterStorageType[] = [];

  private cartItems: number;

  private totalPrice: number;

  private totalSumContainer: HTMLElement | null = null;

  private totalPriceElement: HTMLElement | null = null;

  private cartItemsElement: HTMLElement | null = null;

  private cartContainer: HTMLElement | null = null;

  private summaryContainer: HTMLElement | null = null;

  private leftArrowBtn: HTMLElement | null = null;

  private rightArrowBtn: HTMLElement | null = null;

  private currentPageElement: HTMLElement | null = null;

  private itemsPerPageElement: HTMLElement | null = null;

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

  private promoInputElement: HTMLElement | null = null;

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

  private appliedPromos: string[] = [];

  private isCheckout: boolean = false;

  // eslint-disable-next-line max-len
  constructor(private header: Header, private callback: Callback, private root: HTMLElement, checkout?: boolean) {
    super('div', 'cart-container cart');
    if (checkout && checkout === true) {
      this.isCheckout = true;
    }
    this.cartItems = this.header.headerInfo.cartItems;
    this.totalPrice = this.header.headerInfo.totalPrice;
    if (this.storageInfo !== null) {
      // сохраняю инфу из local storage для создания карточек
      this.addedItems = this.storageInfo.slice();
      // считаю количество страниц в пагинации
      this.pagesNumber = Math.ceil(this.addedItems.length / this.itemsPerPage);
      this.render();
      // проверяем, было ли уже применены скидки
      if (this.promoStorageInfo !== null) {
        this.appliedPromos = this.promoStorageInfo.slice();
        this.appliedPromos.forEach((promo) => {
          const name: string = promo;
          const key: number = this.choosePromoValue(name);
          this.afterPromoPrice = this.calculateNewPrice();
          this.createElementsForAppliedPromo(name, key);
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
    this.itemsPerPageElement.addEventListener('change', this.itemsNumberInputCallback);
    const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
    rendered('span', totalPagesWrapper, 'cart-items__info_pages_text', 'Pages:');
    const buttonsWrapper: HTMLElement = rendered('div', totalPagesWrapper, 'info-pages__btns');
    this.leftArrowBtn = rendered('img', buttonsWrapper, 'info-pages__btn-left disabled', '', {
      src: 'assets/icons/cart-btn__left.svg',
    });
    this.currentPageElement = rendered('span', buttonsWrapper, 'info-pages__pages-total', `${this.currentPage}`);
    this.rightArrowBtn = rendered('img', buttonsWrapper, 'info-pages__btn-right disabled', '', {
      src: 'assets/icons/cart-btn__right.svg',
    });

    // items
    // проверяю количество товаров, чтобы понять, нужна ли пагинация
    if (this.addedItems.length <= this.itemsPerPage) {
      this.createItemsCards(this.addedItems, this.callback);
    } else if (this.addedItems.length > this.itemsPerPage && this.currentPage === 1) {
      // передаем первые два товара на первую страницу пагинации
      this.createItemsCards(this.addedItems.slice(0, this.itemsPerPage), this.callback);
      // активируем кнопку и добавляем листенер
      this.activateRightButton();
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
  private createItemsCards(array: PosterStorageType[], callback: (event: Event) => void): void {
    cardsData.products.forEach((data) => {
      for (let i: number = 0; i < array.length; i += 1) {
        if (data.id === array[i].id) {
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
      }
    });
  }

  // колбэк для кнопки покупки
  private buyNowBtnCallback = (e: Event): void => {
    e.preventDefault();
    this.openModalCheckout();
  };

  private openModalCheckout(): void {
    const modal: ModalWindow = new ModalWindow(this.root);
    modal.attachObserver(this.header);
    modal.attachObserver(this);
    this.root.insertBefore(modal.element, this.header.element);
  }

  // колбэк для правой стрелки (пагинация)
  private rightBtnCallback = (e: Event): void => {
    this.slideBack = false;
    e.preventDefault();
    // меняем номер страницы
    this.currentPage += 1;
    setQueryParams('page', `${this.currentPage}`);
    this.updatePageNumber();
    // активируем левую кнопку и вешаем слушатель
    this.activateLeftButton();
    // удаляем старые карточки
    this.deleteCards();
    // проверяем количнство следующих карточек
    this.startIdx += this.itemsPerPage;
    this.endIdx = this.startIdx + this.itemsPerPage;
    if (this.addedItems.slice(this.startIdx).length <= this.itemsPerPage) {
      this.createItemsCards(this.addedItems.slice(this.startIdx), this.callback);
      if (this.currentPage === this.pagesNumber && this.rightArrowBtn) {
        this.deactivateRightButton();
      }
    } else {
      this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
    }
  };

  // создание карточек после чтения query с номером страницы, которая не равна 1
  private showNotFirstPage(): void {
    this.activateLeftButton();
    if (this.currentPage === this.pagesNumber && this.rightArrowBtn) {
      this.deactivateRightButton();
    } else {
      this.activateRightButton();
    }
    this.startIdx = this.currentPage * this.itemsPerPage - this.itemsPerPage;
    this.endIdx = this.startIdx + this.itemsPerPage;
    this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
  }

  // колбэк для левой стрелки (пагинация)
  private leftBtnCallback = (e: Event): void => {
    e.preventDefault();
    this.slideBack = true;
    // меняем номер страницы
    this.currentPage -= 1;
    setQueryParams('page', `${this.currentPage}`);
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
    this.createItemsCards(this.addedItems.slice(this.startIdx, this.endIdx), this.callback);
    if (this.currentPage === 1) {
      if (this.leftArrowBtn) {
        this.deactivateLeftButton();
      }
    }
  };

  // колбэк для смены количества айтемов на странице
  private itemsNumberInputCallback = (e: Event): void => {
    e.preventDefault();
    if (this.itemsPerPageElement && e.target instanceof HTMLInputElement && e.target.value !== '0') {
      // проверка, нужно ли реактивировать кнопки
      this.activateBothButtons();
      this.itemsPerPageElement.textContent = e.target.value;
      this.itemsPerPage = Number(e.target.value);
      this.updatePaginationAfterChange();
      // проверить, единственная ли у нас страница
      // eslint-disable-next-line max-len
      if (this.itemsPerPage === this.addedItems.length || Number(e.target.value) > this.addedItems.length) {
        this.currentPage = 1;
        this.deactivateBothButtons();
        setQueryParams('page', `${this.currentPage}`);
      }
      setQueryParams('limit', `${this.itemsPerPage}`);
    }
  };

  // колбэк для ввода промокода
  private promocodeInputCallback = (e: Event): void => {
    e.preventDefault();
    if (this.currentPromosElement && e.target instanceof HTMLInputElement) {
      const { value } = e.target;
      this.currentPromoName = value;
      if (this.promoApplyWrapper) {
        this.deletePromoApplyBlock();
      }
      if (value === PromoInputs.behappy || value === PromoInputs.smile) {
        const key: number = this.choosePromoValue(value);
        this.createApplyBlock(value, key);
      }
    }
  };

  // выбрать нужное значение промокода
  private choosePromoValue(value: string): number {
    let result: number;
    if (value === PromoInputs.behappy) {
      this.currentPromoValue = PromoValues.behappy;
      result = this.currentPromoValue;
    } else {
      this.currentPromoValue = PromoValues.smile;
      result = this.currentPromoValue;
    }
    return result;
  }

  // подвешивание блок apply, с кнопкой и без
  private createApplyBlock(value: string, key: number): void {
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
  private applyPromoCallback = (e: Event): void => {
    e.preventDefault();
    this.deletePromoApplyBlock();
    // данные для создания блока с drop
    const value: string | null = this.currentPromoName ? this.currentPromoName : '';
    const key: number | null = value ? this.choosePromoValue(value) : null;
    // сохраняем инфо о премененном коде
    this.appliedPromos.push(value);
    setDataToLocalStorage(this.appliedPromos, 'appliedPromo');
    // оставляем описание промо под input, но без кнопки
    if (value && key) {
      this.createApplyBlock(value, key);
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
  private dropPromoCallback = (e: Event): void => {
    e.preventDefault();
    // удаляем промо из массива с примененными промо
    if (e.target instanceof HTMLButtonElement) {
      const promo: string | null = e.target.hasAttribute('name') ? e.target.getAttribute('name') : '';
      if (promo) {
        const idx: number = this.appliedPromos.indexOf(promo);
        this.appliedPromos.splice(idx, 1);
        setDataToLocalStorage(this.appliedPromos, 'appliedPromo');
      }
      // пересчитываем цену и удаляем блок с экрана
      if (this.appliedPromos.length !== 0) {
        this.afterPromoPrice = this.calculateNewPrice();
        if (this.newPriceElement) {
          this.newPriceElement.textContent = `$ ${this.afterPromoPrice.toLocaleString('en-US')}`;
        }
        const elementToRemove: ParentNode | null = e.target.parentNode;
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
          this.createApplyBlock(promo, key);
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
  private calculateNewPrice(): number {
    const promoValues: number[] = [];
    let result: number = 0;
    if (this.appliedPromos.length !== 0) {
      this.appliedPromos.forEach((promo) => {
        const value: number = this.choosePromoValue(promo);
        promoValues.push(value);
      });
      const temp: number = promoValues.reduce((a, v) => a + v, 0);
      result = this.totalPrice - (this.totalPrice * temp) / 100;
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
      this.deactivateLeftButton();
      if (this.pagesNumber === 1) {
        this.deactivateRightButton();
      }
    } else if (this.currentPage === this.pagesNumber) {
      this.createItemsCards(this.addedItems.slice(this.startIdx), this.callback);
      this.deactivateRightButton();
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
  public update(subject: ObservedSubject, e?: Event): void {
    if (subject instanceof CartCard) {
      if (subject.plus === true && subject.itemAmount <= subject.stock) {
        this.totalPrice += subject.price;
        this.cartItems += 1;
        this.updateSummaryContent();
        this.updatePromoPrice();
        for (let i: number = 0; i < this.addedItems.length; i += 1) {
          if (this.addedItems[i].id === subject.id) {
            this.addedItems[i].quantity += 1;
          }
        }
        setDataToLocalStorage(this.addedItems, 'addedPosters');
      } else if (subject.minus === true && subject.itemAmount >= 0) {
        this.totalPrice -= subject.price;
        this.cartItems -= 1;
        this.updateSummaryContent();
        this.updatePromoPrice();
        for (let i: number = 0; i < this.addedItems.length; i += 1) {
          if (this.addedItems[i].id === subject.id) {
            this.addedItems[i].quantity -= 1;
          }
        }
        setDataToLocalStorage(this.addedItems, 'addedPosters'); // обновляю инфу о добавленных в корзину
        this.checkIfZero(subject);
      }
    }
    if (subject instanceof ModalWindow) {
      if (e) {
        this.showThankYouMessage(e);
      }
      this.cartContainer?.remove();
      this.summaryContainer?.remove();
      localStorage.removeItem('addedPosters');
    }
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

  private showThankYouMessage(e: Event): void {
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
        window.history.pushState({}, '', '/');
        this.callback(e);
      }
    }, 1000);
  }

  /* проверить, является ли количество одного продукта нулевым
  и последующее удаление */
  private checkIfZero(subject: ObservedSubject): void {
    if (subject instanceof CartCard && subject.itemAmount === 0) {
      const index = this.addedItems.findIndex((i) => i.id === subject.id);
      this.addedItems.splice(index, 1);
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

    rendered('img', this.element, 'cart__empty_img', '', {
      src: 'assets/images/empty-cart.png',
    });
    rendered('span', this.element, 'cart__empty_title', 'Your cart is empty!');
    rendered('span', this.element, 'cart__empty_text', 'Looks like you have not added anything to your cart yet.');
  }
}
