export default function decorate(block) {
  const children = Array.from(block.children);
  if (children.length < 3) {
    throw new Error('Block must contain at least 3 child elements');
  }

  const fragment = document.createDocumentFragment();

  const leftWrapper = document.createElement('div');
  leftWrapper.className = 'hero-left';
  leftWrapper.append(children[0], children[1]);

  const rightWrapper = document.createElement('div');
  rightWrapper.className = 'hero-right';
  rightWrapper.appendChild(children[2]);

  fragment.append(leftWrapper, rightWrapper);

  block.replaceChildren(fragment);
}
