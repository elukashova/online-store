import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';
import { ObservedSubject } from '../card/card.types';
import Card from '../card/card';
import { setDataToLocalStorage, checkDataInLocalStorage } from '../../utils/localStorage';
import { HeaderType } from './header.types';
import { JsonObj } from '../../utils/localStorage.types';
import CartCard from '../shopping-cart/card-cart';
import ProductPage from '../product-page/product-page';
import ModalWindow from '../modal-window/modal-window';
import { Callback } from '../shopping-cart/shopping-cart.types';

export default class Header extends BaseComponent {
  public totalPriceElement: HTMLElement | null = null;

  public cartItemsElement: HTMLElement | null = null;

  private readonly storageInfo: JsonObj | null = checkDataInLocalStorage('headerInfo');

  public headerInfo: HeaderType = {
    cartItems: 0,
    totalPrice: 0,
  };

  public storeLink: HTMLElement | null = null;

  public aboutLink: HTMLElement | null = null;

  public shoppingCartLink: HTMLElement | null = null;

  private menuLinks: HTMLElement[] = [];

  constructor(private callback: Callback) {
    super('header', 'header', 'header');
    this.checkLocalStorage();
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  private render(): void {
    const container: HTMLElement = rendered('div', this.element, 'header__container');
    const logoLink: HTMLElement = rendered('a', container, 'header__logo logo', '', { href: '/' });
    rendered('img', logoLink, 'logo__img', '', {
      src: '../assets/images/logo6.png',
      alt: 'atrificial poster shop logotype',
    });
    const menu: HTMLElement = rendered('div', container, 'header__menu menu');
    this.storeLink = rendered('a', menu, 'menu__link store-link', 'Store', { href: '/' });
    this.storeLink.classList.add('active-link');
    this.aboutLink = rendered('a', menu, 'menu__link about-link', 'About us', { href: '/about' });
    const priceContainer: HTMLElement = rendered('div', menu, 'total-price__container');
    rendered('span', priceContainer, 'total-price', 'Total:');
    const priceNumber: HTMLElement = rendered('div', priceContainer, 'total-price__text');
    this.totalPriceElement = rendered(
      'span',
      priceNumber,
      'total-price__sum',
      `$ ${this.headerInfo.totalPrice.toLocaleString('en-US')}`,
    );
    const shoppingCart: HTMLElement = rendered('div', menu, 'menu__item cart');
    this.shoppingCartLink = rendered('a', shoppingCart, 'cart__link cart-hover', '', { href: '/cart' });
    rendered('img', this.shoppingCartLink, 'cart__icon', '', {
      src: '../assets/icons/cart.svg',
      alt: 'cart icon',
    });
    this.cartItemsElement = rendered(
      'span',
      this.shoppingCartLink,
      'cart__items-number',
      `${this.headerInfo.cartItems}`,
    );
    this.menuLinks.push(this.storeLink, this.aboutLink, this.shoppingCartLink);
    this.menuLinks.forEach((link) => {
      link.addEventListener('click', this.navLinkCallback);
    });
    logoLink.addEventListener('click', this.imageLinkCallback);
    this.cartItemsElement.addEventListener('click', this.imageLinkCallback);

    this.updateInfoInHeader();
  }

  // колбэк для рутинга
  private navLinkCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
    }
  };

  private imageLinkCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
    }
    if (target && target instanceof HTMLSpanElement && this.shoppingCartLink) {
      this.activateLink(this.shoppingCartLink);
      window.history.pushState({}, '', '/cart');
      this.callback(e);
    }
  };

  private deleteClass(element: HTMLElement): void {
    if (element.classList.contains('active-link')) {
      element.classList.remove('active-link');
    }
  }

  public activateLink(link: HTMLElement | null): void {
    if (link !== null) {
      for (let i: number = 0; i < this.menuLinks.length; i += 1) {
        if (this.menuLinks[i] === link) {
          link.classList.add('active-link');
          if (link === this.shoppingCartLink) {
            link.classList.remove('cart-hover');
          } else {
            this.shoppingCartLink?.classList.add('cart-hover');
          }
        } else {
          this.deleteClass(this.menuLinks[i]);
        }
      }
    }
  }

  public deleteActiveClass(): void {
    if (this.storeLink && this.aboutLink && this.shoppingCartLink) {
      this.deleteClass(this.storeLink);
      this.deleteClass(this.aboutLink);
      this.deleteClass(this.shoppingCartLink);
      this.shoppingCartLink.classList.add('cart-hover');
    }
  }

  // метод для обсервера
  // eslint-disable-next-line max-lines-per-function
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
      if (subject.isCheckout === true && this.shoppingCartLink) {
        this.activateLink(this.shoppingCartLink);
      }
      setDataToLocalStorage(this.headerInfo, 'headerInfo');
    }

    // обсервер на закрытие модалки
    if (subject instanceof ModalWindow) {
      this.headerInfo.totalPrice = 0;
      this.headerInfo.cartItems = 0;

      setDataToLocalStorage(this.headerInfo, 'headerInfo');
    }
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

  private checkSize(): void {
    if (this.headerInfo.cartItems > 99 && this.cartItemsElement) {
      this.cartItemsElement.style.width = '1.6rem';
    }
    if (this.headerInfo.cartItems > 999 && this.cartItemsElement) {
      this.cartItemsElement.style.width = '2rem';
    }
  }

  private updateInfoInHeader(): void {
    if (this.totalPriceElement && this.cartItemsElement) {
      this.totalPriceElement.textContent = `$ ${this.headerInfo.totalPrice.toLocaleString('en-US')}`;
      this.cartItemsElement.textContent = `${this.headerInfo.cartItems}`;
      this.checkSize();
    }
  }
}
