import './main.styles.css';

// import rendered from '../../utils/render/render';
import BaseComponent from '../base-component/base-component';

export default class Page extends BaseComponent {
  constructor() {
    super('main', 'main');
    this.render();
  }

  public render(): HTMLElement {
    return this.element;
  }

  public setContent(component: Element): void {
    this.element.append(component);
  }
}
