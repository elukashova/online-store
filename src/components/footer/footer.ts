import './footer.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render';
import contactData from '../../assets/json/consts';

export default class Footer extends BaseComponent {
  constructor() {
    super('footer', 'footer');
    this.render();
  }

  // eslint-disable-next-line max-lines-per-function
  public render(): void {
    const lang = 'en';
    const container: HTMLElement = rendered('div', this.element, 'footer__container');
    const contactsContainer: HTMLElement = rendered('div', container, 'footer__contacts-container contacts-container');
    rendered('img', container, 'footer__image', '', { src: '../assets/images/footer_bg.jpg', alt: '' });
    rendered('p', contactsContainer, 'contacts-container__title', contactData[lang].contactsTitle);
    const contactsInfo: HTMLElement = rendered('div', contactsContainer, 'contacts-container__info');
    rendered('p', contactsInfo, 'contacts-container__info-office', contactData[lang].office);
    rendered('p', contactsInfo, 'contacts-container__info-address', contactData[lang].address);
    rendered('p', contactsInfo, 'contacts-container__info-phone', contactData[lang].tel);
    rendered('p', contactsInfo, 'contacts-container__info-phone-number', contactData[lang].phoneNumber);
    rendered('p', contactsInfo, 'contacts-container__info-email', contactData[lang].email);
    rendered('p', contactsInfo, 'contacts-container__info-email-address', contactData[lang].emailAddress);
    const contactsSocialMedia: HTMLElement = rendered('div', contactsInfo, 'contacts-container__social-media');
    rendered('span', contactsSocialMedia, 'contacts-container__year', '2023');
    const githubWrapper: HTMLElement = rendered('div', contactsSocialMedia, 'contacts-container__github-wrapper');
    rendered('img', githubWrapper, 'contacts-container__github-heart', '', {
      src: '../assets/icons/heart.png',
      alt: '',
    });
    const githubIconsWrapper: HTMLElement = rendered('div', githubWrapper, 'contacts-container__github-icons-wrapper');
    const socialGithubL: HTMLElement = rendered('a', githubIconsWrapper, 'contacts-container__github-first', '', {
      href: 'https://github.com/elukashova',
    });
    const socialGithubN: HTMLElement = rendered('a', githubIconsWrapper, 'contacts-container__github-second', '', {
      href: 'https://github.com/TrickyPie',
    });
    rendered('img', socialGithubL, 'contacts-container__github-logo', '', {
      src: '../assets/icons/github-left.png',
      alt: "Lena's github",
    });
    rendered('img', socialGithubN, 'contacts-container__github-logo', '', {
      src: '../assets/icons/github-right.png',
      alt: "Nastya's github",
    });
    const socialRsschool: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__rsschool', '', {
      href: 'https://rs.school/js/',
    });
    rendered('img', socialRsschool, 'contacts-container__rsschool', 'RS School', {
      src: '../assets/icons/rsschool.png',
      alt: "RS School logotype. It's free-of-charge and community-based education program",
    });
  }
}
