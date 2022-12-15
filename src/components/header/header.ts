import './header.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';

export default class Header extends BaseComponent {
  constructor() {
    super('header', 'header');
  }

  public render(): void {
    const container: HTMLElement = rendered('div', this.element, 'header__container');
    const logoLink: HTMLElement = rendered('a', container, 'header__logo logo', {
      attribute: 'href',
      content: '#',
    });
    rendered('img', logoLink, 'logo__img', {
      attribute: 'src',
      content: '../../../assets/icons/logo-placeholder.svg',
    });
  }
}
