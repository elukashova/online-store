import rendered from '../../utils/render/render';
import BaseComponent from '../base-component/base-component';
import cardsData from '../../assets/json/data';
import './product-page.styles.css';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { JsonObj } from '../../utils/localStorage.types';
// import Header from '../header/header';
import { Observer } from '../card/card.types';
// import { BreadcrumbProps } from './product-page.types';
// import { CardDataType } from '../card/card.types';

export default class ProductPage extends BaseComponent {
  private observers: Observer[] = [];

  private readonly storageInfo: JsonObj | null = checkDataInLocalStorage('addedPosters');

  private addedItems: number[] = []; // для сохранения id добавленных товаров в local storage

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

  private storeAnchorElement: HTMLElement | null = null;

  private chosenImg: HTMLElement | null = null;

  private notChosenImg: HTMLElement | null = null;

  private mainImage: HTMLElement | null = null;

  private addToCartBtn: HTMLElement | null = null;

  private buyNowBtn: HTMLElement | null = null;

  private addToCartBtnIcon: HTMLElement | null = null;

  public isAdded: boolean = false;

  // TODO: сюда надо будет передать данные из локал сторадж о том, добавлен ли товар в корзину
  constructor(id: number, private callback: (event: Event) => void) {
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
    /* this.breadcrumpsProps.push('Store', this.category,
    this.size, this.title); */
    this.render();
    this.checkLocalStorage();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    // левая часть
    const imagesCrumbsContainer: HTMLElement = rendered('div', this.element, 'product__images-and-crumbs-container');
    const breadCrumbsContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__breadcrumbs breadcrump');
    this.storeAnchorElement = rendered('a', breadCrumbsContainer, 'breadcrump__store', 'Store', {
      href: '/',
    });
    this.storeAnchorElement.addEventListener('click', this.backToStoreCallback);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__category', `${this.category}`);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__size', `${this.size}`);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__title', `${this.title}`);
    // this.createBreadCrumps(breadCrumbsContainer, this.breadcrumpsProps);

    const imagesContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__imgs-container');
    const miniImagesWrapper: HTMLElement = rendered('div', imagesContainer, 'product__mini-imgs-wrapper product-img');
    this.chosenImg = rendered('img', miniImagesWrapper, 'product-img__mini chosen', '', {
      src: this.images[0],
    });
    this.notChosenImg = rendered('img', miniImagesWrapper, 'product-img__mini not-chosen', '', {
      src: this.images[1],
    });
    this.notChosenImg.addEventListener('click', this.changeCurrentImgCallback);

    const mainImgContainer: HTMLElement = rendered('div', imagesContainer, 'product__main-img-container');
    this.mainImage = rendered('img', mainImgContainer, 'product-img__main-img', '', {
      src: this.images[0],
    });

    // правая часть
    const productInfoContainer: HTMLElement = rendered('div', this.element, 'product__info-container product-info');
    const backBtnAnchor: HTMLElement = rendered('a', productInfoContainer, 'product-info__back-btn-link', '', {
      href: '/',
    });
    rendered('img', backBtnAnchor, 'product-info__back-btn', '', {
      src: 'assets/icons/btn-back.svg',
    });
    rendered('span', backBtnAnchor, 'product-info__back-btn_text', 'back');
    backBtnAnchor.addEventListener('click', this.backToStoreCallback);
    const productDescr: HTMLElement = rendered('div', productInfoContainer, 'product-info__description-block');
    rendered('span', productDescr, 'product-info__title', this.title);
    rendered('span', productDescr, 'product-info__category', this.category);
    rendered('span', productDescr, 'product-info__size', `Size ${this.size}`);
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
    let values: number[] = [];
    if (this.storageInfo !== null) {
      values = Object.values(this.storageInfo);
    }

    if (values.length !== 0 && values.includes(this.id)) {
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
      const child: ChildNode | null = e.target.firstChild;
      if (child) {
        e.target.removeChild(child);
      }
      e.target.textContent = 'add to cart';
      this.isAdded = false;
      const index = this.addedItems.indexOf(this.id);
      this.addedItems.splice(index, 1);
      setDataToLocalStorage(this.addedItems);
    } else if (e.target instanceof HTMLButtonElement && !e.target.classList.contains('in-cart')) {
      e.target.classList.add('in-cart');
      e.target.textContent = 'remove item';
      this.isAdded = true;
      this.addedItems.push(this.id);
      setDataToLocalStorage(this.addedItems);
    }
    this.notifyObserver();
  };

  // колбэк быстрой покупки
  private buyNowCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target instanceof HTMLButtonElement) {
      // добавление в корзину и local storage, если товар до этого не был добавлен в козину
      if (!this.addedItems.includes(this.id)) {
        this.isAdded = true;
        this.addedItems.push(this.id);
        setDataToLocalStorage(this.addedItems);
        this.notifyObserver();
      }
    }
  };

  // возврат на главную страницу
  private backToStoreCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
    }
  };

  // колбэк для клика на новую картинку
  private changeCurrentImgCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target instanceof HTMLImageElement && this.chosenImg && this.notChosenImg) {
      target.classList.remove('not-chosen');
      target.classList.add('chosen');
      this.chosenImg.classList.remove('chosen');
      this.chosenImg.classList.add('not-chosen');
      const temp: HTMLElement = this.chosenImg;
      this.chosenImg = target;
      this.notChosenImg = temp;
      this.notChosenImg.addEventListener('click', this.changeCurrentImgCallback);
    }
    if (this.mainImage && this.mainImage instanceof HTMLImageElement) {
      if (this.chosenImg && this.chosenImg instanceof HTMLImageElement) {
        this.mainImage.src = this.chosenImg.src;
      }
    }
  };

  private checkLocalStorage(): void {
    if (this.storageInfo !== null) {
      const values: number[] = Object.values(this.storageInfo);
      this.addedItems = values.slice();
    }
  }

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
