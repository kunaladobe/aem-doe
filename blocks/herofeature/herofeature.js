export default function decorate(block) {
  // Create wrappers with classes
  const leftWrapper = document.createElement('div');
  const rightWrapper = document.createElement('div');
  leftWrapper.className = 'hero-left';
  rightWrapper.className = 'hero-right';

  // Move the first two elements to the left wrapper and the third to the right wrapper
  leftWrapper.append(block.children[0], block.children[1]);
  rightWrapper.appendChild(block.children[0]); // Remaining child (element3)

  // Replace block's content with the new structure
  block.replaceChildren(leftWrapper, rightWrapper);
}
