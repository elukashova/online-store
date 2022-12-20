import './main.cart.styles.css';
import Page from '../page-component';
import rendered from '../../../utils/render/render';
import Cart from '../../shopping-cart/shopping-cart';
import cardsData from '../../../assets/json/data';
import { DataType } from '../../card/card.types';

export default class MainCart extends Page {
  private readonly cart: Cart = new Cart();

  private readonly data: DataType = cardsData.products[0];

  constructor(id: string) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    container.append(this.cart.element);
    this.cart.render(this.data);
  }
}
