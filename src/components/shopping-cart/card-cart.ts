import rendered from '../../utils/render/render';
import { CardDataType, Observer } from '../card/card.types';
import BaseComponent from '../base-component/base-component';
import { checkDataInLocalStorage } from '../../utils/localStorage';
import { PosterStorageType } from '../../utils/localStorage.types';

export default class CartCard extends BaseComponent {
  private storageInfo: PosterStorageType[] | null = checkDataInLocalStorage('addedPosters');

  private addedItems: PosterStorageType[] | null = [];

  public id: number;

  public title: string;

  public category: string;

  public size: string;

  public rating: number;

  public images: string[];

  public description: string;

  public stock: number;

  public price: number;

  public totalPrice: number = 0;

  public discount: number;

  public minusBtn: HTMLElement | null = null;

  public plusBtn: HTMLElement | null = null;

  public priceForItemElement: HTMLElement | null = null;

  public itemAmountElement: HTMLElement | null = null;

  private observers: Observer[] = [];

  public itemAmount: number = 0;

  public itemInfo: PosterStorageType | null = null;

  // эти два указателя мне нужны для обсервера на клик на + и -
  public minus: boolean = false;

  public plus: boolean = false;

  // eslint-disable-next-line max-len
  constructor(private data: CardDataType, private itemOrder: number, private callback: (event: Event) => void) {
    super('div', 'cart-items__item cart-item');
    this.id = this.data.id;
    this.title = this.data.title;
    this.category = this.data.category;
    this.rating = this.data.rating;
    this.size = this.data.size;
    this.images = this.data.images.slice();
    this.description = this.data.description;
    this.stock = this.data.stock;
    this.price = this.data.price;
    this.discount = this.data.discountPercentage;
    if (this.storageInfo !== null) {
      this.addedItems = this.storageInfo.slice();
      const idx = this.addedItems.findIndex((i) => i.id === this.id);
      this.itemInfo = this.storageInfo[idx];
      this.itemAmount = this.itemInfo.quantity;
      this.totalPrice = this.itemAmount * this.price;
    }
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // правая карточка
    const itemCard = rendered('div', this.element, 'cart-item__card', '', {
      id: `crd${this.id}`,
    });
    itemCard.addEventListener('click', this.productPageCallback);
    rendered('span', itemCard, 'cart-item__order', `${this.itemOrder}`);
    rendered('img', itemCard, 'cart-item__img', '', {
      src: this.images[0],
    });
    const firstItemDescr: HTMLElement = rendered('div', itemCard, 'cart-item__description');
    rendered('span', firstItemDescr, 'cart-item__description_title', this.title);
    rendered('span', firstItemDescr, 'cart-item__description_category', this.category);
    rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${this.size}`);
    rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${this.rating}`);
    rendered('span', firstItemDescr, 'cart-item__description_price', `Price: $ ${this.price}`);
    rendered('span', firstItemDescr, 'cart-item__description_discount', `Discount: ${this.discount}`);
    rendered('p', firstItemDescr, 'cart-item__description_text', this.description);

    // правая часть с возможностью поменять количество
    const amountContainer = rendered('div', this.element, 'cart-item__amount_container');
    const itemAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__change-container');
    const changeAmountContainer: HTMLElement = rendered('div', itemAmountContainer, 'cart-amount__change-container');
    this.minusBtn = rendered('img', changeAmountContainer, 'cart-amount__btn-minus', '', {
      src: 'assets/icons/cart-btn__minus.svg',
    });
    this.minusBtn.addEventListener('click', this.minusBtnCallback);
    this.itemAmountElement = rendered('span', changeAmountContainer, 'cart-amount__amount', `${this.itemAmount}`);
    this.plusBtn = rendered('img', changeAmountContainer, 'cart-amount__btn-plus', '', {
      src: 'assets/icons/cart-btn__plus.svg',
    });
    this.plusBtn.addEventListener('click', this.plusBtnCallback);
    const stockAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__stock-container');
    rendered('span', stockAmountContainer, 'cart-amount__stock-text', 'Stock:');
    rendered('span', stockAmountContainer, 'cart-amount__stock-num', `${this.stock}`);

    const itemPriceContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__price-container');
    rendered('span', itemPriceContainer, 'cart-amount__price-text', '$');
    this.priceForItemElement = rendered(
      'span',
      itemPriceContainer,
      'cart-amount__price-num',
      `${this.totalPrice.toLocaleString('en-US')}`,
    );
  }

  private productPageCallback = (e: Event): void => {
    e.preventDefault();
    window.history.pushState({}, '', `${this.id}`);
    this.callback(e);
  };

  private minusBtnCallback = (): void => {
    this.minus = true;
    this.plus = false;
    if (this.itemAmount > 0) {
      this.totalPrice -= this.price;
      this.itemAmount -= 1;
      if (this.priceForItemElement && this.itemAmountElement) {
        this.priceForItemElement.textContent = `${this.totalPrice.toLocaleString('en-US')}`;
        this.itemAmountElement.textContent = `${this.itemAmount}`;
      }
      this.notifyObserver();
    }
  };

  private plusBtnCallback = (): void => {
    this.plus = true;
    this.minus = false;
    // невозможность добавить больше, чем есть на стоке
    if (this.itemAmount < this.stock) {
      this.totalPrice += this.price;
      this.itemAmount += 1;
      if (this.priceForItemElement && this.itemAmountElement) {
        this.priceForItemElement.textContent = `${this.totalPrice.toLocaleString('en-US')}`;
        this.itemAmountElement.textContent = `${this.itemAmount}`;
      }
      this.notifyObserver();
    }
  };

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Subject: Observer has been attached already.');
    }
    // console.log('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  public notifyObserver(): void {
    // console.log('Subject: Notifying observers...');
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }
}
