import './main.store.styles.css';
import MainComponent from '../base-component/main-component';
import rendered from '../../utils/render/render';

export default class MainStore extends MainComponent {
  constructor(id: string) {
    super('main', 'main', id);
  }

  public render(): HTMLElement {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    rendered('p', container, 'main__text', ' STORE MAIN PAGE');
    return this.element;
  }
}
