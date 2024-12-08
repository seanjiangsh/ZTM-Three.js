export type Content = {
  title: string;
  description?: string;
  link?: { href: string; text: string };
};

export default class ModalContentProvider {
  private modalContents: {
    aboutMe: Content;
    projects: Content;
    contactMe: Content;
  };

  constructor() {
    this.modalContents = {
      aboutMe: {
        title: "About me",
        description: "Hello! I am Sean, a web developer.",
      },
      projects: {
        title: "This project",
        link: {
          href: "https://github.com/seanjiangsh/ZTM-Three.js",
          text: "See the source code of this project",
        },
      },
      contactMe: {
        title: "Let's connect",
        link: { href: "https://sean-j.dev", text: "My Site" },
      },
    };
  }

  getModalInfo(portalName: keyof ModalContentProvider["modalContents"]) {
    return this.modalContents[portalName];
  }
}
