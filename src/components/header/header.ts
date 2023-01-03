import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import { ObservedSubject } from '../card/card.types';
import Card from '../card/card';
import { setDataToLocalStorage, checkHeaderDataInLocalStorage } from '../../utils/localStorage';
import { HeaderInfoType } from './header.types';
import { JsonObj } from '../../utils/localStorage.types';
import CartCard from '../shopping-cart/card-cart';
import ProductPage from '../product-page/product-page';

export default class Header extends BaseComponent {
  public totalPriceElement: HTMLElement | null = null;

  public cartItemsElement: HTMLElement | null = null;

  private readonly storageInfo: JsonObj | null = checkHeaderDataInLocalStorage('headerInfo');

  public headerInfo: HeaderInfoType = {
    cartItems: 0,
    totalPrice: 0,
  };

  private anchorElements: HTMLElement[] = [];

  constructor(private callback: (event: Event) => void) {
    super('header', 'header', 'header');
    this.checkLocalStorage();
    this.render();
  }

  public render(): void {
    const container: HTMLElement = rendered('div', this.element, 'header__container');
    const logoLink: HTMLElement = rendered('a', container, 'header__logo logo', '', { href: '/' });
    rendered('img', logoLink, 'logo__img', '', {
      src: 'assets/icons/logo-placeholder.svg',
    });
    const menu: HTMLElement = rendered('ul', container, 'header__menu menu');
    const storePage: HTMLElement = rendered('li', menu, 'menu__item menu__item_current');
    const aboutPage: HTMLElement = rendered('li', menu, 'menu__item');
    const storeLink: HTMLElement = rendered('a', storePage, 'menu__link store-link', 'Store', { href: '/' });
    const aboutLink: HTMLElement = rendered('a', aboutPage, 'menu__link about-link', 'About us', { href: '/about' });
    const totalPrice: HTMLElement = rendered('li', menu, 'menu__item total-price', 'Total:');
    const priceWrapper: HTMLElement = rendered('div', totalPrice, 'total-price__container');
    rendered('span', priceWrapper, 'total-price__currency', '$');
    this.totalPriceElement = rendered(
      'span',
      priceWrapper,
      'total-price__sum',
      `${this.headerInfo.totalPrice.toLocaleString('en-US')}`,
    );
    const shoppingCart: HTMLElement = rendered('li', menu, 'menu__item cart');
    const shoppingCartLink: HTMLElement = rendered('a', shoppingCart, 'cart__link', '', { href: '/cart' });
    rendered('img', shoppingCartLink, 'cart__icon', '', {
      src: 'assets/icons/cart.svg',
    });
    this.cartItemsElement = rendered('span', shoppingCart, 'cart__items-number', `${this.headerInfo.cartItems}`);
    this.anchorElements.push(logoLink, storeLink, aboutLink, shoppingCartLink);
    this.anchorElements.forEach((link) => {
      link.addEventListener('click', this.navLinkCallback);
    });
  }

  // колбэк для рутинга
  private navLinkCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
    }
  };

  // метод для обсервера
  public update(subject: ObservedSubject): void {
    // если это ново-добавленный элемент, добавляю его цену к тотал и увеличиваю кол-во в корзине
    if (subject instanceof Card) {
      if (subject.element.classList.contains('added')) {
        this.increaseNumbers(subject.price);
      } else if (!subject.element.classList.contains('added')) {
        // если нет, наоборот
        if (subject.totalPrice !== 0) {
          this.decreaseNumbers(subject.totalPrice, subject.itemQuantity);
        } else {
          this.decreaseNumbers(subject.price, 1);
        }
      }
      setDataToLocalStorage(this.headerInfo, 'headerInfo');
    }

    // обсервер на увеличение количество отдельных товаров в корзине
    if (subject instanceof CartCard) {
      if (subject.plus === true && subject.itemAmount <= subject.stock) {
        this.increaseNumbers(subject.price);
      } else if (subject.minus === true && subject.itemAmount >= 0) {
        this.decreaseNumbers(subject.price, 1);
      }
      setDataToLocalStorage(this.headerInfo, 'headerInfo');
    }

    // обсервер на увеличение количество отдельных товаров в корзине
    if (subject instanceof ProductPage) {
      if (subject.isAdded === true) {
        this.increaseNumbers(subject.price);
      } else if (subject.isAdded === false) {
        this.decreaseNumbers(subject.totalPrice, subject.totalAmount);
      }
      setDataToLocalStorage(this.headerInfo, 'headerInfo');
    }

    // обновляю информацию в хедере
    this.updateInfoInHeader();
  }

  private increaseNumbers(price: number): void {
    this.headerInfo.totalPrice += price;
    this.headerInfo.cartItems += 1;
  }

  private decreaseNumbers(price: number, count?: number): void {
    this.headerInfo.totalPrice -= price;
    if (count) {
      this.headerInfo.cartItems -= count;
    }
  }

  private checkLocalStorage(): void {
    if (this.storageInfo !== null) {
      this.headerInfo.cartItems = this.storageInfo.cartItems;
      this.headerInfo.totalPrice = this.storageInfo.totalPrice;
    }
  }

  private updateInfoInHeader(): void {
    if (this.totalPriceElement && this.cartItemsElement) {
      this.totalPriceElement.textContent = `${this.headerInfo.totalPrice.toLocaleString('en-US')}`;
      this.cartItemsElement.textContent = `${this.headerInfo.cartItems}`;
    }
  }
}
