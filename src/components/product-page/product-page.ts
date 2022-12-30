import rendered from '../../utils/render/render';
import BaseComponent from '../base-component/base-component';
import cardsData from '../../assets/json/data';
import './product-page.styles.css';
// import { BreadcrumbProps } from './product-page.types';
// import { CardDataType } from '../card/card.types';

export default class ProductPage extends BaseComponent {
  // private productID: number;

  private productId: number = 0;

  private productTitle: string = '';

  private productCategory: string = '';

  private productRating: number = 0;

  private productStock: number = 0;

  private productPrice: number = 0;

  private productDiscount: number = 0;

  private productDescription: string = '';

  private productSize: string = '';

  private productImages: string[] = [];

  // private breadcrumpsProps: string[] = [];

  private storeAnchorElement: HTMLElement | null = null;

  // TODO: сюда надо будет передать данные из локал сторадж о том, добавлен ли товар в корзину
  constructor(id: number, private callback: (event: Event) => void) {
    super('div', 'product__container product');
    cardsData.products.forEach((item) => {
      if (item.id === id) {
        this.productId = item.id;
        this.productTitle = item.title;
        this.productCategory = item.category;
        this.productRating = item.rating;
        this.productStock = item.stock;
        this.productPrice = item.price;
        this.productSize = item.size;
        this.productDiscount = item.discountPercentage;
        this.productDescription = item.description;
        this.productImages = item.images.slice();
      }
    });
    /* this.breadcrumpsProps.push('Store', this.productCategory,
    this.productSize, this.productTitle); */
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
    this.storeAnchorElement.addEventListener('click', this.backToStoreCallback);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__category', `${this.productCategory}`);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__size', `${this.productSize}`);
    rendered('span', breadCrumbsContainer, 'breadcrump__breadcrumps', '>>');
    rendered('span', breadCrumbsContainer, 'breadcrump__title', `${this.productTitle}`);
    // this.createBreadCrumps(breadCrumbsContainer, this.breadcrumpsProps);

    const imagesContainer: HTMLElement = rendered('div', imagesCrumbsContainer, 'product__imgs-container');
    const miniImagesWrapper: HTMLElement = rendered('div', imagesContainer, 'product__mini-imgs-wrapper product-img');
    this.productImages.forEach((img) => {
      rendered('img', miniImagesWrapper, 'product-img__mini', '', {
        src: img,
      });
    });
    const zoomImgWrapper: HTMLElement = rendered('div', imagesContainer, 'product__zoom-img-container');
    rendered('img', zoomImgWrapper, 'product-img__zoomed', '', {
      src: this.productImages[0],
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
    rendered('span', productDescr, 'product-info__title', this.productTitle);
    rendered('span', productDescr, 'product-info__category', this.productCategory);
    rendered('span', productDescr, 'product-info__size', `Size ${this.productSize}`);
    rendered('span', productDescr, 'product-info__rating', `Rating: ${this.productRating}`);
    rendered('span', productDescr, 'product-info__stock', `Stock: ${this.productStock}`);
    rendered('p', productDescr, 'product-info__text', this.productDescription);
    rendered('div', productDescr, 'product-info__line');
    rendered('p', productDescr, 'product-info__price', `$ ${this.productPrice}`);
    rendered('p', productDescr, 'product-info__discount', `Sale ${this.productDiscount} %`);
    rendered('button', productInfoContainer, 'product-info__add-to-cart-btn', 'add to cart');
    rendered('button', productInfoContainer, 'product-info__buy-now-btn', 'buy it now');
  }

  // возврат на главную страницу
  private backToStoreCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
    }
  };
}
