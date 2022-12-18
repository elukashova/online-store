import './main.cart.styles.css';
import Page from '../page-component';
import rendered from '../../../utils/render/render';

export default class MainCart extends Page {
  constructor(id: string) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    rendered('p', container, 'main__text', ' CART MAIN PAGE');
  }
}
