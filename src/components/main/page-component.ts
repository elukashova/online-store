import './main.styles.css';

import rendered from '../../utils/render/render';
import BaseComponent from '../base-component/base-component';

export default class Page extends BaseComponent {
  constructor() {
    super('main', 'main');
  }

  public render(): HTMLElement {
    return this.element;
  }

  public setContent(): void {
    rendered('div', this.element, 'main__container');
  }
}
