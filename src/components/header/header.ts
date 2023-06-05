import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';
import { ObservedSubject } from '../card/card.types';
import Card from '../card/card';
import { setDataToLocalStorage, checkDataInLocalStorage } from '../../utils/localStorage';
import { HeaderInfo } from './header.types';
import CartCard from '../shopping-cart/card-cart';
import ProductPage from '../product-page/product-page';
import ModalWindow from '../modal-window/modal-window';
import { Callback } from '../shopping-cart/shopping-cart.types';
import Routes from '../app/routes.types';

export default class Header extends BaseComponent {
  public totalPriceElement: HTMLElement | null = null;

  public cartItemsElement: HTMLElement | null = null;

  public headerInfo: HeaderInfo = {
    cartItems: 0,
    totalPrice: 0,
  };

  public storeLink: HTMLAnchorElement | null = null;

  public aboutLink: HTMLAnchorElement | null = null;

  public shoppingCartLink: HTMLAnchorElement | null = null;

  private menuLinks: HTMLAnchorElement[] = [];

  constructor(private callback: Callback) {
    super('header', 'header', 'header');
    this.checkLocalStorage();
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  private render(): void {
    const container: HTMLElement = rendered('div', this.element, 'header__container');
    const logoLink: HTMLAnchorElement = rendered('a', container, 'header__logo logo', '', { href: Routes.Home });
    rendered('img', logoLink, 'logo__img', '', {
      src: '../assets/images/logo6.png',
      alt: 'atrificial poster shop logotype',
    });
    const menu: HTMLElement = rendered('div', container, 'header__menu menu');
    this.storeLink = rendered('a', menu, 'menu__link store-link', 'Store', { href: Routes.Home });
    this.storeLink.classList.add('active-link');
    this.aboutLink = rendered('a', menu, 'menu__link about-link', 'About us', { href: Routes.About });
    const priceContainer: HTMLElement = rendered('div', menu, 'total-price__container');
    rendered('span', priceContainer, 'total-price', 'Total:');
    const priceNumber: HTMLElement = rendered('div', priceContainer, 'total-price__text');
    this.totalPriceElement = rendered(
      'span',
      priceNumber,
      'total-price__sum',
      `$ ${this.headerInfo.totalPrice ? this.headerInfo.totalPrice.toLocaleString('en-US') : '0'}`,
    );
    const shoppingCart: HTMLElement = rendered('div', menu, 'menu__item cart');
    this.shoppingCartLink = rendered('a', shoppingCart, 'cart__link cart-hover', '', { href: Routes.Cart });
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
    this.menuLinks.forEach((link: HTMLAnchorElement): void => {
      link.addEventListener('click', () => this.navLinkCallback(link.href));
    });
    logoLink.addEventListener('click', () => this.imageLinkCallback(logoLink.href));
    this.cartItemsElement.addEventListener('click', () => this.imageLinkCallback);

    this.updateInfoInHeader();
  }

  // колбэк для рутинга
  private navLinkCallback = (url: string): void => {
    this.changeRoute(url);
  };

  private imageLinkCallback = (url?: string): void => {
    if (url) {
      this.changeRoute(url);
    } else {
      this.activateLink(this.shoppingCartLink);
      this.changeRoute(Routes.Cart);
    }
  };

  private changeRoute(href: string): void {
    window.history.pushState({}, '', href);
    this.callback();
  }

  private deleteActiveLinkClass(element: HTMLElement): void {
    element.classList.remove('active-link');
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
          this.deleteActiveLinkClass(this.menuLinks[i]);
        }
      }
    }
  }

  public deleteAllActiveClasses(): void {
    if (this.storeLink && this.aboutLink && this.shoppingCartLink) {
      this.menuLinks.forEach((link: HTMLAnchorElement) => this.deleteActiveLinkClass(link));
      this.shoppingCartLink.classList.add('cart-hover');
    }
  }

  // метод для обсервера
  // eslint-disable-next-line max-lines-per-function
  public update(subject: ObservedSubject): void {
    // если это ново-добавленный элемент, добавляю его цену к тотал и увеличиваю кол-во в корзине
    if (subject instanceof Card) {
      if (subject.element.classList.contains('added')) {
        this.increaseNumbers(subject.products.price);
      } else if (!subject.element.classList.contains('added')) {
        // если нет, наоборот
        if (subject.totalPriceInCart !== 0) {
          this.decreaseNumbers(subject.totalPriceInCart, subject.itemQuantityInCart);
        } else {
          this.decreaseNumbers(subject.products.price, 1);
        }
      }
    }
    // обсервер на увеличение количество отдельных товаров в корзине
    if (subject instanceof CartCard) {
      if (subject.plus === true && subject.itemAmount <= subject.stock) {
        this.increaseNumbers(subject.price);
      } else if (subject.minus === true && subject.itemAmount >= 0) {
        this.decreaseNumbers(subject.price, 1);
      }
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
    }

    // обсервер на закрытие модалки
    if (subject instanceof ModalWindow) {
      this.headerInfo.totalPrice = 0;
      this.headerInfo.cartItems = 0;
    }

    setDataToLocalStorage(this.headerInfo, 'headerInfo');
    this.updateInfoInHeader();
  }

  private increaseNumbers(price: number): void {
    this.headerInfo.totalPrice += price;
    this.headerInfo.cartItems += 1;
  }

  public decreaseNumbers(price: number, count?: number): void {
    this.headerInfo.totalPrice -= price;
    if (count) {
      this.headerInfo.cartItems -= count;
    }
  }

  private checkLocalStorage(): void {
    const storageInfo: HeaderInfo | null = <HeaderInfo>checkDataInLocalStorage('headerInfo');
    if (storageInfo) {
      this.headerInfo.cartItems = storageInfo.cartItems;
      this.headerInfo.totalPrice = storageInfo.totalPrice;
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
      const totalPrice = `$ ${this.headerInfo.totalPrice ? this.headerInfo.totalPrice.toLocaleString('en-US') : '0'}`;
      this.totalPriceElement.textContent = totalPrice;
      this.cartItemsElement.textContent = `${this.headerInfo.cartItems}`;
      this.checkSize();
    }
  }
}
