import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';

export default class Header extends BaseComponent {
  constructor() {
    super('header', 'header', 'header');
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
    rendered('a', storePage, 'menu__link store-link', 'Store', { href: '/' });
    rendered('a', aboutPage, 'menu__link about-link', 'About us', { href: '#about' });
    const totalPrice: HTMLElement = rendered('li', menu, 'menu__item total-price', 'Total:');
    const priceWrapper: HTMLElement = rendered('div', totalPrice, 'total-price__container');
    rendered('span', priceWrapper, 'total-price__currency', '$');
    rendered('span', priceWrapper, 'total-price__sum', '150');
    const shoppingCart: HTMLElement = rendered('li', menu, 'menu__item cart');
    const shoppingCartLink: HTMLElement = rendered('a', shoppingCart, 'menu__item cart', '', { href: '#cart' });
    rendered('img', shoppingCartLink, 'cart__icon', '', {
      src: '../../../assets/icons/cart-placeholder.png',
    });
    rendered('span', shoppingCartLink, 'cart__items-number', '0');
  }
}
