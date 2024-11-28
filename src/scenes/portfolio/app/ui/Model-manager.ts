export default class ModalManager {
  private modal: HTMLElement;
  private close: HTMLElement;

  constructor() {
    this.modal = document.getElementById("myModal")!;
    this.close = document.getElementsByClassName("close")[0]! as HTMLElement;
    this.close.onclick = () => {
      this.closeModal();
    };
  }

  openModal(title: string, description: string) {
    const titleElem = document.getElementById("modalTitle")!;
    const descElem = document.getElementById("modalDescription")!;
    titleElem.innerHTML = title;
    descElem.innerHTML = description;

    const { modal } = this;
    modal.style.display = "block";
    modal.classList.remove("fadeOut");
    modal.classList.add("fadeIn");
  }

  closeModal() {
    const { modal } = this;
    modal.classList.remove("fadeIn");
    modal.classList.add("fadeOut");
    setTimeout(() => {
      modal.style.display = "none";
    }, 600);
  }
}
