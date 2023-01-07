import './footer.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';

export default class Footer extends BaseComponent {
  constructor() {
    super('footer', 'footer');
    this.render();
  }

  public render(): void {
    const container: HTMLElement = rendered('div', this.element, 'footer__container');
    const contactsContainer: HTMLElement = rendered('div', container, 'footer__contacts-container contacts-container');
    rendered('img', container, 'footer__image', '', { src: 'assets/images/footer_bg.png' });
    rendered('p', contactsContainer, 'contacts-container__title', 'Have some questions?\nContact us');
    const contactsInfo: HTMLElement = rendered('div', contactsContainer, 'contacts-container__info');
    rendered('p', contactsInfo, 'contacts-container__info-office', 'Office ');
    rendered('p', contactsInfo, 'contacts-container__info-address', 'Lisboa, Avenida da Liberdade, 3');
    rendered('p', contactsInfo, 'contacts-container__info-phone', 'Tel. ');
    rendered('p', contactsInfo, 'contacts-container__info-phone-number', '+351-01-341-3961');
    rendered('p', contactsInfo, 'contacts-container__info-email', 'Email ');
    rendered('p', contactsInfo, 'contacts-container__info-email-address', 'bestposterever@gmail.com');
    const contactsSocialMedia: HTMLElement = rendered('div', contactsInfo, 'contacts-container__social-media');
    rendered('span', contactsSocialMedia, 'contacts-container__year', '2022');
    const socialGithubL: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__github-first', '', {
      href: 'https://github.com/elukashova',
    });
    const socialGithubN: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__github-second', '', {
      href: 'https://github.com/TrickyPie',
    });
    const socialRsschool: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__rsschool', '', {
      href: 'https://rs.school/js/',
    });
    rendered('img', socialGithubL, 'contacts-container__github-logo', '', {
      src: 'assets/icons/github.png',
    });
    rendered('img', socialGithubN, 'contacts-container__github-logo', '', {
      src: 'assets/icons/github.png',
    });
    rendered('img', socialRsschool, 'contacts-container__rsschool', 'RS School', {
      src: 'assets/icons/rsschool.png',
    });
  }
}
