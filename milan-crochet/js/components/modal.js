class Modal {
  constructor() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.content = document.createElement('div');
    this.content.className = 'modal';
    this.backdrop.appendChild(this.content);
    document.body.appendChild(this.backdrop);
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });
  }
  setContent(html) {
    this.content.innerHTML = html;
  }
  open() {
    this.backdrop.classList.add('open');
  }
  close() {
    this.backdrop.classList.remove('open');
  }
}

export const modal = new Modal();
