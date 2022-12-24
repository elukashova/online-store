import './main.cart.styles.css';
import Page from '../page-component';
import rendered from '../../../utils/render/render';
import Cart from '../../shopping-cart/shopping-cart';
import Header from '../../header/header';

export default class MainCart extends Page {
  private readonly cart: Cart = new Cart(this.header);

  constructor(id: string, public readonly header: Header) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    container.append(this.cart.element);
  }
}
