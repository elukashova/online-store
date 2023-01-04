import rendered from '../../utils/render/render';
import BaseComponent from '../base-component/base-component';
import './404.styles.css';

export default class Page404 extends BaseComponent {
  constructor(private callback: (event: Event) => void) {
    super('div', 'page-not-found__container page-not-found');
    this.render();
  }

  private render(): void {
    rendered('img', this.element, 'page-not-found__background', '', {
      src: 'assets/images/404-background-left.png',
    });
    const textWrapper: HTMLElement = rendered('div', this.element, 'page-not-found__text-wrapper');
    rendered('h2', textWrapper, 'page-not-found__title', 'Ooops...');
    rendered('span', textWrapper, 'page-not-found__text', 'Page not found');
    rendered('img', this.element, 'page-not-found__background', '', {
      src: 'assets/images/404-background-right.png',
    });
    // rendered('span', textWrapper, 'page-not-found__title', 'Ooops...');
    // rendered('span', textWrapper, 'page-not-found__text', 'Page not found');
    // rendered('img', contentWrapper, 'page-not-found__background', '', {
    //   src: 'assets/images/404-background.png',
    // });
  }
}
