import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import { ObservedSubject } from '../card/card.types';
import Card from '../card/card';
import { setDataToLocalStorage, checkHeaderDataInLocalStorage } from '../../utils/localStorage';
import { HeaderType } from './header.types';
import { JsonObj } from '../../utils/localStorage.types';
import CartCard from '../shopping-cart/card-cart';
import ProductPage from '../product-page/product-page';

export default class Header extends BaseComponent {
  public totalPriceElement: HTMLElement | null = null;

  public cartItemsElement: HTMLElement | null = null;

  private readonly storageInfo: JsonObj | null = checkHeaderDataInLocalStorage('headerInfo');

  public headerInfo: HeaderType = {
    cartItems: 0,
    totalPrice: 0,
  };

  private storeLink: HTMLElement | null = null;

  private aboutLink: HTMLElement | null = null;

  private shoppingCartLink: HTMLElement | null = null;

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
    this.storeLink = rendered('a', storePage, 'menu__link store-link', 'Store', { href: '/' });
    this.storeLink.classList.add('active-link');
    this.aboutLink = rendered('a', aboutPage, 'menu__link about-link', 'About us', { href: '/about' });
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
    this.shoppingCartLink = rendered('a', shoppingCart, 'cart__link', '', { href: '/cart' });
    rendered('img', this.shoppingCartLink, 'cart__icon', '', {
      src: 'assets/icons/cart.svg',
    });
    this.cartItemsElement = rendered(
      'span',
      this.shoppingCartLink,
      'cart__items-number',
      `${this.headerInfo.cartItems}`,
    );
    this.storeLink.addEventListener('click', this.navLinkCallback);
    this.aboutLink.addEventListener('click', this.navLinkCallback);
    logoLink.addEventListener('click', this.imageLinkCallback);
    this.shoppingCartLink.addEventListener('click', this.navLinkCallback);
    this.cartItemsElement.addEventListener('click', this.imageLinkCallback);

    this.updateInfoInHeader();
  }

  // колбэк для рутинга
  private navLinkCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
      if (this.storeLink && this.aboutLink && this.shoppingCartLink) {
        this.deleteClass(this.storeLink);
        this.deleteClass(this.aboutLink);
        this.deleteClass(this.shoppingCartLink);
      }
      target.classList.add('active-link');
    }
  };

  private imageLinkCallback = (e: Event): void => {
    e.preventDefault();
    const { target } = e;
    if (target && target instanceof HTMLAnchorElement) {
      this.callback(e);
    }
    if (target && target instanceof HTMLSpanElement) {
      this.activateCartLink();
      window.history.pushState({}, '', '/cart');
      this.callback(e);
    }
  };

  private deleteClass(element: HTMLElement): void {
    if (element.classList.contains('active-link')) {
      element.classList.remove('active-link');
    }
  }

  private activateCartLink(): void {
    if (this.storeLink && this.aboutLink) {
      this.deleteClass(this.storeLink);
      this.deleteClass(this.aboutLink);
    }
    if (this.shoppingCartLink) {
      this.shoppingCartLink.classList.add('active-link');
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
      if (subject.isCheckout === true) {
        this.activateCartLink();
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

  private checkSize(): void {
    if (this.headerInfo.cartItems > 99 && this.cartItemsElement) {
      this.cartItemsElement.style.width = '1.6rem';
    }
  }

  private updateInfoInHeader(): void {
    if (this.totalPriceElement && this.cartItemsElement) {
      this.totalPriceElement.textContent = `${this.headerInfo.totalPrice.toLocaleString('en-US')}`;
      this.cartItemsElement.textContent = `${this.headerInfo.cartItems}`;
      this.checkSize();
    }
  }
}
