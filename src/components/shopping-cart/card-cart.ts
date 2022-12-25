import rendered from '../../utils/render/render';
import { CardDataType, Observer } from '../card/card.types';
import BaseComponent from '../base-component/base-component';
import { ItemInfoType } from './shopping-cart.types';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';

export default class CartCard extends BaseComponent {
  private readonly storageInfo: JsonObj | null;

  public id: number;

  public title: string;

  public category: string;

  public size: string;

  public rating: number;

  public images: string[];

  public description: string;

  public stock: number;

  public price: number;

  public discount: number;

  public minusBtn: HTMLElement | null = null;

  public plusBtn: HTMLElement | null = null;

  public priceForItemElement: HTMLElement | null = null;

  public itemAmountElement: HTMLElement | null = null;

  private observers: Observer[] = [];

  public cartItemInfo: ItemInfoType = {
    itemOrder: 0,
    itemAmount: 0,
    itemTotalPrice: 0,
  };

  constructor(private data: CardDataType, private itemsOrder: number) {
    super('div', 'cart-items__item cart-item');
    this.id = this.data.id;
    this.storageInfo = checkDataInLocalStorage(`${this.id}`);
    this.title = this.data.title;
    this.category = this.data.category;
    this.rating = this.data.rating;
    this.size = this.data.size;
    this.images = this.data.images.slice();
    this.description = this.data.description;
    this.stock = this.data.stock;
    this.price = this.data.price;
    this.discount = this.data.discountPercentage;
    if (this.storageInfo === null) {
      this.cartItemInfo.itemTotalPrice = this.price;
      this.cartItemInfo.itemOrder = this.itemsOrder;
      this.cartItemInfo.itemAmount = 1;
    } else {
      this.cartItemInfo.itemTotalPrice = this.storageInfo.itemTotalPrice;
      this.cartItemInfo.itemOrder = this.storageInfo.itemOrder;
      this.cartItemInfo.itemAmount = this.storageInfo.itemAmount;
    }
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // правая карточка
    const itemCard = rendered('div', this.element, 'cart-item__card');
    rendered('span', itemCard, 'cart-item__order', `${this.cartItemInfo.itemOrder}`);
    rendered('img', itemCard, 'cart-item__img', '', {
      src: this.images[0],
    });
    const firstItemDescr: HTMLElement = rendered('div', itemCard, 'cart-item__description');
    rendered('span', firstItemDescr, 'cart-item__description_title', this.title);
    rendered('span', firstItemDescr, 'cart-item__description_category', this.category);
    rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${this.size}`);
    rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${this.rating}`);
    rendered('span', firstItemDescr, 'cart-item__description_price', `Price: ${this.price}`);
    rendered('span', firstItemDescr, 'cart-item__description_discount', `Discount: ${this.discount}`);
    rendered('p', firstItemDescr, 'cart-item__description_text', this.description);

    // правая часть с возможностью поменять количество
    const amountContainer = rendered('div', this.element, 'cart-item__amount_container');
    const itemAmountContainer: HTMLElement = rendered('div', amountContainer, 'cart-amount__change-container');
    const changeAmountContainer: HTMLElement = rendered('div', itemAmountContainer, 'cart-amount__change-container');
    this.minusBtn = rendered('img', changeAmountContainer, 'cart-amount__btn-minus', '', {
      src: '../../assets/icons/cart-icon__minus.svg',
    });
    this.itemAmountElement = rendered(
      'span',
      changeAmountContainer,
      'cart-amount__amount',
      `${this.cartItemInfo.itemAmount}`,
    );
    this.plusBtn = rendered('img', changeAmountContainer, 'cart-amount__btn-plus', '', {
      src: '../../assets/icons/cart-icon__plus.svg',
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
      `${this.cartItemInfo.itemTotalPrice}`,
    );
  }

  private minusBtnCallback = (): void => {};

  private plusBtnCallback = (): void => {
    // невозможность добавить больше, чем есть на стоке
    if (this.cartItemInfo.itemAmount < this.stock) {
      this.cartItemInfo.itemTotalPrice += this.price;
      this.cartItemInfo.itemAmount += 1;
      if (this.priceForItemElement && this.itemAmountElement) {
        this.priceForItemElement.textContent = `${this.cartItemInfo.itemTotalPrice}`;
        this.itemAmountElement.textContent = `${this.cartItemInfo.itemAmount}`;
      }
      setDataToLocalStorage(this.cartItemInfo, `${this.id}`);
    }
    this.notifyObserver();
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
