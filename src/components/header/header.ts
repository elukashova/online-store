import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';

export default class Header extends BaseComponent {
  constructor() {
    super('header', 'header');
  }

  public render(): void {
    const container: HTMLElement = rendered('div', this.element, 'header__container');
    const logoLink: HTMLElement = rendered('a', container, 'header__logo logo', '', { href: './index.html' });
    rendered('img', logoLink, 'logo__img', '', {
      src: '../../../assets/icons/logo-placeholder.svg',
    });
    const menu: HTMLElement = rendered('ul', container, 'header__menu menu');
    rendered('il', menu, 'menu__item menu__item_current', 'Store');
    rendered('il', menu, 'menu__item', 'About us');
    const totalPrice: HTMLElement = rendered('il', menu, 'menu__item total-price', 'Total:');
    const priceWrapper: HTMLElement = rendered('div', totalPrice, 'total-price__container');
    rendered('span', priceWrapper, 'total-price__currency', '$');
    rendered('span', priceWrapper, 'total-price__sum', '150');
    const shoppingCart: HTMLElement = rendered('il', menu, 'menu__item cart');
    rendered('img', shoppingCart, 'cart__icon', '', {
      src: '../../../assets/icons/cart-placeholder.png',
    });
    rendered('span', shoppingCart, 'cart__items-number', '0');
  }
}
