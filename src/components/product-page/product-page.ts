import rendered from '../../utils/render';
import BaseComponent from '../base-component/base-component';
import cardsData from '../../assets/json/data';
import './product-page.styles.css';
import { checkDataInLocalStorage, setDataToLocalStorage } from '../../utils/localStorage';
import { PosterStorageInfo } from '../../utils/localStorage.types';
import { Observer } from '../card/card.types';
import { Callback } from '../shopping-cart/shopping-cart.types';
import Routes from '../app/routes.types';

export default class ProductPage extends BaseComponent {
  private observers: Observer[] = [];

  private readonly storageInfo: PosterStorageInfo[] | null = checkDataInLocalStorage('addedPosters');

  private addedItems: PosterStorageInfo[] = [];

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

  constructor(id: number, private routingCallback: Callback) {
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

  public render(): void {
    // левая часть
    const imagesCrumbsContainer: HTMLElement = rendered('div', this.element, 'product__images-and-crumbs-container');
    const breadCrumbsContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__breadcrumbs breadcrump');
    this.storeAnchorElement = rendered('a', breadCrumbsContainer, 'breadcrump__store', 'Store', {
      href: Routes.Home,
    });
    this.createBreadcrumbs(breadCrumbsContainer);

    const imagesContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__imgs-container');
    const miniImagesWrapper: HTMLElement = rendered('div', imagesContainer, 'product__mini-imgs-wrapper product-img');
    this.chosenImg = rendered('img', miniImagesWrapper, 'product-img__mini chosen', '', {
      src: `../${this.images[0]}`,
    });
    for (let i: number = 1; i < this.images.length; i += 1) {
      const img: HTMLElement = rendered('img', miniImagesWrapper, 'product-img__mini not-chosen', '', {
        src: `../${this.images[i]}`,
      });
      img.addEventListener('click', () => this.changeCurrentImgCallback(img));
    }

    const mainImgContainer: HTMLElement = rendered('div', imagesContainer, 'product__main-img-container');
    this.mainImage = rendered('img', mainImgContainer, 'product-img__main-img', '', {
      src: `../${this.images[0]}`,
    });

    // правая часть
    const productInfoContainer: HTMLElement = rendered('div', this.element, 'product__info-container product-info');
    const productDescr: HTMLElement = rendered('div', productInfoContainer, 'product-info__description-block');
    this.fillCardInfo(productDescr);
    this.createAddToCartBtn(productInfoContainer);
    this.addToCartBtn?.addEventListener('click', this.addToCartBtnCallback);
    this.buyNowBtn = rendered('button', productInfoContainer, 'product-info__buy-now-btn', 'buy it now');
    this.buyNowBtn.addEventListener('click', this.buyNowCallback);
  }

  private createBreadcrumbs(parent: HTMLElement): void {
    const fields = [
      { label: 'breadcrumps', value: '>>' },
      { label: 'category', value: `${this.category}` },
      { label: 'breadcrumps', value: '>>' },
      { label: 'size', value: `${this.size}` },
      { label: 'breadcrumps', value: '>>' },
      { label: 'title', value: `${this.title}` },
    ];

    fields.forEach((field) => {
      rendered('span', parent, `breadcrump__${field.label}`, `${field.value}`);
    });
  }

  private fillCardInfo(cardInfoWrapper: HTMLElement): void {
    const fields = [
      { label: 'Title', value: this.title },
      { label: 'Category', value: this.category },
      { label: 'Size', value: `Size ${this.size}` },
      { label: 'Rating', value: `Rating: ${this.rating}` },
      { label: 'Stock', value: `Stock: ${this.stock}` },
      { label: 'Text', value: this.description },
      { label: 'Line', value: '' },
      { label: 'Price', value: `Price: $ ${this.price}` },
      { label: 'Discount', value: `Discount: ${this.discount}` },
    ];

    fields.forEach((field) => {
      if (field.label !== 'Line') {
        rendered('span', cardInfoWrapper, `product-info__${field.label.toLowerCase()}`, `${field.value}`);
      } else {
        rendered('div', cardInfoWrapper, `product-info__${field.label.toLowerCase()}`);
      }
    });
  }

  // создаем кнопку добавления в корзину, в зависимости от того, добавлен ли уже постер
  private createAddToCartBtn(container: HTMLElement): void {
    // проверяем local storage, добавлена ли этот товар в корзину
    let buttonLabel: string = '';
    this.addToCartBtn = rendered('button', container, 'product-info__add-to-cart-btn');
    if (this.addedItems.length !== 0 && this.addedItems.find((i) => i.id === this.id)) {
      buttonLabel = 'remove item';
      this.addToCartBtn.classList.add('in-cart');
      this.isAdded = true;
    } else {
      buttonLabel = 'add to cart';
    }

    this.addToCartBtn.textContent = buttonLabel;
  }

  private addToCartBtnCallback = (): void => {
    if (this.addToCartBtn && this.addToCartBtn.classList.contains('in-cart')) {
      this.addToCartBtn.classList.remove('in-cart');
      this.addToCartBtn.textContent = 'add to cart';
      this.isAdded = false;
      this.removeItemFromLocalStorage();
    } else if (this.addToCartBtn) {
      this.addToCartBtn.classList.add('in-cart');
      this.addToCartBtn.textContent = 'remove item';
      this.totalPrice = this.price;
      this.totalAmount = 1;
      this.isAdded = true;
      this.addItemToLocalStorage();
      setDataToLocalStorage(this.addedItems, 'addedPosters');
    }
    this.notifyObserver();
  };

  // колбэк быстрой покупки
  private buyNowCallback = (): void => {
    this.isCheckout = true;
    // добавление в корзину и local storage, если товар до этого не был добавлен в козину
    if (!this.addedItems.find((i) => i.id === this.id)) {
      this.isAdded = true;
      this.addItemToLocalStorage();
      this.notifyObserver();
    }
    // переход в корзину
    window.history.pushState({}, '', Routes.Cart);
    this.routingCallback(this.isCheckout);
    this.isCheckout = false;
  };

  // колбэк для клика на новую картинку
  private changeCurrentImgCallback = (img: HTMLElement): void => {
    let targetImg = img;
    if (this.chosenImg) {
      targetImg.classList.remove('not-chosen');
      targetImg.classList.add('chosen');
      this.chosenImg.classList.remove('chosen');
      this.chosenImg.classList.add('not-chosen');
      const temp: HTMLElement = this.chosenImg;
      this.chosenImg = targetImg;
      targetImg = temp;
      targetImg.addEventListener('click', () => this.changeCurrentImgCallback(targetImg));
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
    const info: PosterStorageInfo = {
      id: this.id,
      quantity: 1,
    };
    this.addedItems.push(info);
    setDataToLocalStorage(this.addedItems, 'addedPosters');
  }

  private removeItemFromLocalStorage(): void {
    this.addedItems = this.addedItems.filter((item) => item.id !== this.id);
    if (this.addedItems.length > 0) {
      setDataToLocalStorage(this.addedItems, 'addedPosters');
    } else {
      localStorage.removeItem('addedPosters');
    }
  }

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex: number = this.observers.indexOf(observer);
    this.observers.splice(observerIndex, 1);
  }

  public notifyObserver(): void {
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this);
    }
  }
}
