export default function decorate(block) {
  const imgSrc = block.querySelector('picture img').src;
  const imgAlt = block.querySelector('picture img').alt;
  const heading = block.querySelector('h1').textContent;
  const paragraph = block.querySelector('p').textContent;
  const buttons = [...block.querySelectorAll('p a')].map((a) => ({
    text: a.textContent,
    href: a.href,
  }));

  block.innerHTML = `
    <div class="customimages-content">
      <img src="${imgSrc}" alt="${imgAlt}" class="customimages-image">
      <div class="customimages-text">
        <h2>${heading}</h2>
        <p>${paragraph}</p>
        <button class="customimages-button">${buttons[0].text}</button>
        ${buttons.slice(1).map((button) => `
          <a href="${button.href}" class="customimages-link">${button.text} <span class="customimages-arrow">&rarr;</span></a>
        `).join('')}
      </div>
    </div>
  `;
}
