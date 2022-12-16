import './main.cart.styles.css';
import MainComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';

export default class MainCart extends MainComponent {
  constructor(id: string) {
    super('main', 'main', id);
  }

  public render(): HTMLElement {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    rendered('p', container, 'main__text', ' CART MAIN PAGE');
    return this.element;
  }
}
