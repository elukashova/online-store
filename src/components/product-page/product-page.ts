import rendered from '../../utils/render';
import BaseComponent from '../base-component/base-component';
import cardsData from '../../assets/json/data';
import './product-page.styles.css';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { PosterStorageType } from '../../utils/localStorage.types';
import { Observer } from '../card/card.types';
import { Callback } from '../shopping-cart/shopping-cart.types';

export default class ProductPage extends BaseComponent {
  private observers: Observer[] = [];

  private readonly storageInfo: PosterStorageType[] | null = checkDataInLocalStorage('addedPosters');

  private addedItems: PosterStorageType[] = [];

  private id: number = 0;

  private title: string = '';

  private category: string = '';

  private rating: number = 0;

  private stock: number = 0;

  public price: number = 0;

  private discount: number = 0;

  private description: string = '';

  private size: string = '';

  private images: string[] = [];

  public totalAmount: number = 0;

  public totalPrice: number = 0;

  private storeAnchorElement: HTMLElement | null = null;

  private chosenImg: HTMLElement | null = null;

  private imgWithListener: HTMLElement[] = [];

  private mainImage: HTMLElement | null = null;

  private addToCartBtn: HTMLElement | null = null;

  private buyNowBtn: HTMLElement | null = null;

  public isAdded: boolean = false;

  public isCheckout: boolean = false;

  constructor(id: number, private callback: Callback) {
    super('div', 'product__container product');
    cardsData.products.forEach((item) => {
      if (item.id === id) {
        this.id = item.id;
        this.title = item.title;
        this.category = item.category;
        this.rating = item.rating;
        this.stock = item.stock;
        this.price = item.price;
        this.size = item.size;
        this.discount = item.discountPercentage;
        this.description = item.description;
        this.images = item.images.slice();
      }
    });
    this.checkLocalStorage();
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // левая часть
    const imagesCrumbsContainer: HTMLElement = rendered('div', this.element, 'product__images-and-crumbs-container');
    const breadCrumbsContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__breadcrumbs breadcrump');
    this.storeAnchorElement = rendered('a', breadCrumbsContainer, 'breadcrump__store', 'Store', {
      href: '/',
    });
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__category', `${this.category}`);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__size', `${this.size}`);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__title', `${this.title}`);

    const imagesContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__imgs-container');
    const miniImagesWrapper: HTMLElement = rendered('div', imagesContainer, 'product__mini-imgs-wrapper product-img');
    this.chosenImg = rendered('img', miniImagesWrapper, 'product-img__mini chosen', '', {
      src: `../${this.images[0]}`,
    });
    for (let i: number = 1; i < this.images.length; i += 1) {
      const img: HTMLElement = rendered('img', miniImagesWrapper, 'product-img__mini not-chosen', '', {
        src: `../${this.images[i]}`,
      });
      img.addEventListener('click', this.changeCurrentImgCallback);
    }

    const mainImgContainer: HTMLElement = rendered('div', imagesContainer, 'product__main-img-container');
    this.mainImage = rendered('img', mainImgContainer, 'product-img__main-img', '', {
      src: `../${this.images[0]}`,
    });

    // правая часть
    const productInfoContainer: HTMLElement = rendered('div', this.element, 'product__info-container product-info');
    const productDescr: HTMLElement = rendered('div', productInfoContainer, 'product-info__description-block');
    rendered('span', productDescr, 'product-info__title', this.title);
    rendered('span', productDescr, 'product-info__category', this.category);
    rendered('span', productDescr, 'product-info__size', `Size: ${this.size}`);
    rendered('span', productDescr, 'product-info__rating', `Rating: ${this.rating}`);
    rendered('span', productDescr, 'product-info__stock', `Stock: ${this.stock}`);
    rendered('p', productDescr, 'product-info__text', this.description);
    rendered('div', productDescr, 'product-info__line');
    rendered('p', productDescr, 'product-info__price', `$ ${this.price}`);
    rendered('p', productDescr, 'product-info__discount', `Sale ${this.discount} %`);
    this.createAddToCartBtn(productInfoContainer);
    this.addToCartBtn?.addEventListener('click', this.addToCartBtnCallback);
    this.buyNowBtn = rendered('button', productInfoContainer, 'product-info__buy-now-btn', 'buy it now');
    this.buyNowBtn.addEventListener('click', this.buyNowCallback);
  }

  // создаем кнопку добавления в корзину, в зависимости от того, добавлен ли уже постер
  private createAddToCartBtn(container: HTMLElement): void {
    // проверяем local storage, добавлена ли этот товар в корзину
    if (this.addedItems.length !== 0 && this.addedItems.find((i) => i.id === this.id)) {
      this.addToCartBtn = rendered('button', container, 'product-info__add-to-cart-btn', 'remove item');
      this.addToCartBtn.classList.add('in-cart');
      this.isAdded = true;
    } else {
      this.addToCartBtn = rendered('button', container, 'product-info__add-to-cart-btn', 'add to cart');
    }
  }

  private addToCartBtnCallback = (e: Event): void => {
    e.preventDefault();
    if (e.target instanceof HTMLButtonElement && e.target.classList.contains('in-cart')) {
      e.target.classList.remove('in-cart');
      e.target.textContent = 'add to cart';
      this.isAdded = false;
      this.removeItemFromLocalStorage();
    } else if (e.target instanceof HTMLButtonElement && !e.target.classList.contains('in-cart')) {
      e.target.classList.add('in-cart');
      e.target.textContent = 'remove item';
      this.totalPrice = this.price;
      this.totalAmount = 1;
      this.isAdded = true;
      this.addItemToLocalStorage();
      setDataToLocalStorage(this.addedItems, 'addedPosters');
    }
    this.notifyObserver();
  };

  // колбэк быстрой покупки
  private buyNowCallback = (e: Event): void => {
    e.preventDefault();

    const { target } = e;
    if (target instanceof HTMLButtonElement) {
      this.isCheckout = true;
      // добавление в корзину и local storage, если товар до этого не был добавлен в козину
      if (!this.addedItems.find((i) => i.id === this.id)) {
        this.isAdded = true;
        this.addItemToLocalStorage();
        this.notifyObserver();
      }
      // переход в корзину
      window.history.pushState({}, '', '/cart');
      this.callback(e, this.isCheckout);
    }
    this.isCheckout = false;
  };

  // колбэк для клика на новую картинку
  private changeCurrentImgCallback = (e: Event): void => {
    e.preventDefault();
    let { target } = e;
    if (target instanceof HTMLImageElement && this.chosenImg) {
      target.classList.remove('not-chosen');
      target.classList.add('chosen');
      this.chosenImg.classList.remove('chosen');
      this.chosenImg.classList.add('not-chosen');
      const temp: HTMLElement = this.chosenImg;
      this.chosenImg = target;
      target = temp;
      target.addEventListener('click', this.changeCurrentImgCallback);
    }
    if (this.mainImage && this.mainImage instanceof HTMLImageElement) {
      if (this.chosenImg && this.chosenImg instanceof HTMLImageElement) {
        this.mainImage.src = this.chosenImg.src;
      }
    }
  };

  private checkLocalStorage(): void {
    if (this.storageInfo !== null) {
      this.addedItems = this.storageInfo.slice();
      for (let i: number = 0; i < this.addedItems.length; i += 1) {
        if (this.addedItems[i].id === this.id) {
          this.totalAmount = this.addedItems[i].quantity;
          this.totalPrice = this.totalAmount * this.price;
        }
      }
    }
  }

  private addItemToLocalStorage(): void {
    const info: PosterStorageType = {
      id: this.id,
      quantity: 1,
    };
    this.addedItems.push(info);
    setDataToLocalStorage(this.addedItems, 'addedPosters');
  }

  private removeItemFromLocalStorage(): void {
    const index = this.addedItems.findIndex((i) => i.id === this.id);
    this.addedItems.splice(index, 1);
    if (this.addedItems.length > 0) {
      setDataToLocalStorage(this.addedItems, 'addedPosters');
    } else {
      localStorage.removeItem('addedPosters');
    }
  }

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Subject: Observer has been attached already.');
    }
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
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }
}
