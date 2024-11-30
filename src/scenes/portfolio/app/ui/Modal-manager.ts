import { Content } from "./Modal-content-provider";

export default class ModalManager {
  private modal: HTMLElement;
  private close: HTMLElement;
  private titleElem: HTMLElement;
  private descElem: HTMLElement;
  private linkElem: HTMLAnchorElement;

  constructor() {
    this.modal = document.getElementById("myModal")!;
    this.titleElem = document.getElementById("modalTitle")!;
    this.descElem = document.getElementById("modalDescription")!;
    this.linkElem = document.getElementById("modalLink")! as HTMLAnchorElement;

    this.close = document.getElementsByClassName("close")[0]! as HTMLElement;
    this.close.onclick = () => {
      this.closeModal();
    };
  }

  openModal(content: Content) {
    const { titleElem, descElem, linkElem } = this;
    const { title } = content;
    titleElem.innerHTML = title;

    const description = content.description;
    if (description) {
      descElem.style.display = "block";
      descElem.innerHTML = description;
    }

    const link = content.link || "";
    if (link) {
      const { href, text } = link;
      linkElem.href = href;
      linkElem.innerHTML = text;
      linkElem.style.display = "block";
    }

    const { modal } = this;
    modal.style.display = "block";
    modal.classList.remove("fadeOut");
    modal.classList.add("fadeIn");
  }

  closeModal() {
    const { modal, titleElem, descElem, linkElem } = this;
    modal.classList.remove("fadeIn");
    modal.classList.add("fadeOut");

    setTimeout(() => {
      modal.style.display = "none";
      descElem.style.display = "none";
      linkElem.style.display = "none";
      titleElem.innerHTML = "";
      descElem.innerHTML = "";
      linkElem.href = "";
      linkElem.innerHTML = "";
    }, 600);
  }
}
