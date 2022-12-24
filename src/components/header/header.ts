import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import { ObservedSubject } from '../card/card.types';
import Card from '../card/card';

export default class Header extends BaseComponent {
  public totalPriceElement: HTMLElement | null = null;

  public cartItemsElement: HTMLElement | null = null;

  public cartItems: number = 0;

  public totalPrice: number = 0;

  constructor() {
    super('header', 'header', 'header');
    this.render();
  }

  public render(): void {
    const container: HTMLElement = rendered('div', this.element, 'header__container');
    const logoLink: HTMLElement = rendered('a', container, 'header__logo logo', '', { href: '/' });
    rendered('img', logoLink, 'logo__img', '', {
      src: '../../../assets/icons/logo-placeholder.svg',
    });
    const menu: HTMLElement = rendered('ul', container, 'header__menu menu');
    const storePage: HTMLElement = rendered('li', menu, 'menu__item menu__item_current');
    const aboutPage: HTMLElement = rendered('li', menu, 'menu__item');
    rendered('a', storePage, 'menu__link store-link', 'Store', { href: '#' });
    rendered('a', aboutPage, 'menu__link about-link', 'About us', { href: '#about' });
    const totalPrice: HTMLElement = rendered('li', menu, 'menu__item total-price', 'Total:');
    const priceWrapper: HTMLElement = rendered('div', totalPrice, 'total-price__container');
    rendered('span', priceWrapper, 'total-price__currency', '$');
    this.totalPriceElement = rendered('span', priceWrapper, 'total-price__sum', `${this.totalPrice}`);
    const shoppingCart: HTMLElement = rendered('li', menu, 'menu__item cart');
    const shoppingCartLink: HTMLElement = rendered('a', shoppingCart, 'menu__item cart', '', { href: '#cart' });
    rendered('img', shoppingCartLink, 'cart__icon', '', {
      src: '../../../assets/icons/cart.svg',
    });
    this.cartItemsElement = rendered('span', shoppingCart, 'cart__items-number', `${this.cartItems}`);
    // this.updateInfo(this.totalPrice, this.cartItems);
  }

  public update(subject: ObservedSubject): void {
    // если это ново-добавленный элемент, добавляю его цену к тотал и увеличиваю кол-во в корзине
    if (subject instanceof Card && subject.element.classList.contains('added')) {
      this.totalPrice += subject.price;
      this.cartItems += 1;
    }

    // если нет, наоборот
    if (subject instanceof Card && !subject.element.classList.contains('added')) {
      this.totalPrice -= subject.price;
      this.cartItems -= 1;
    }

    // обновляю информацию в хедере
    if (this.totalPriceElement && this.cartItemsElement) {
      this.totalPriceElement.textContent = `${this.totalPrice}`;
      this.cartItemsElement.textContent = `${this.cartItems}`;
    }
  }
}
