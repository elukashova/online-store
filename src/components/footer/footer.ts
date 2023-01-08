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
    rendered('img', container, 'footer__image', '', { src: 'assets/images/footer_bg.jpg' });
    rendered('p', contactsContainer, 'contacts-container__title', 'Have some questions?\nContact us');
    const contactsInfo: HTMLElement = rendered('div', contactsContainer, 'contacts-container__info');
    rendered('p', contactsInfo, 'contacts-container__info-office', 'Office ');
    rendered('p', contactsInfo, 'contacts-container__info-address', 'Lisboa, Avenida da Liberdade, 3');
    rendered('p', contactsInfo, 'contacts-container__info-phone', 'Tel. ');
    rendered('p', contactsInfo, 'contacts-container__info-phone-number', '+351-00-000-0000');
    rendered('p', contactsInfo, 'contacts-container__info-email', 'Email ');
    rendered('p', contactsInfo, 'contacts-container__info-email-address', 'art.ificial@gmail.com');
    const contactsSocialMedia: HTMLElement = rendered('div', contactsInfo, 'contacts-container__social-media');
    rendered('span', contactsSocialMedia, 'contacts-container__year', '2022');
    const githubWrapper = rendered('div', contactsSocialMedia, 'contacts-container__github-wrapper');
    rendered('img', githubWrapper, 'contacts-container__github-heart', '', {
      src: 'assets/icons/heart.png',
    });
    const githubIconsWrapper = rendered('div', githubWrapper, 'contacts-container__github-icons-wrapper');
    const socialGithubL: HTMLElement = rendered('a', githubIconsWrapper, 'contacts-container__github-first', '', {
      href: 'https://github.com/elukashova',
    });
    const socialGithubN: HTMLElement = rendered('a', githubIconsWrapper, 'contacts-container__github-second', '', {
      href: 'https://github.com/TrickyPie',
    });
    rendered('img', socialGithubL, 'contacts-container__github-logo', '', {
      src: 'assets/icons/github-left.png',
    });
    rendered('img', socialGithubN, 'contacts-container__github-logo', '', {
      src: 'assets/icons/github-right.png',
    });
    const socialRsschool: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__rsschool', '', {
      href: 'https://rs.school/js/',
    });
    rendered('img', socialRsschool, 'contacts-container__rsschool', 'RS School', {
      src: 'assets/icons/rsschool.png',
    });
  }
}
