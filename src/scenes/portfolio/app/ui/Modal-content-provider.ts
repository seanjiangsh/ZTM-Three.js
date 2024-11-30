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
        title: "Projects",
        link: {
          href: "https://sean-j.dev/projects",
          text: "Check out my projects",
        },
      },
      contactMe: {
        title: "Let's connect",
        link: { href: "https://github.com/seanjiangsh", text: "Github" },
      },
    };
  }

  getModalInfo(portalName: keyof ModalContentProvider["modalContents"]) {
    return this.modalContents[portalName];
  }
}
