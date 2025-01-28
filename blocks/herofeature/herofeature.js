export default function decorate(block) {
  // Select the child elements
  const element1 = block.children[0];
  const element2 = block.children[1];
  const element3 = block.children[2];

  // Create a new div with class "left" for element 1 and element 2
  const leftWrapper = document.createElement('div');
  leftWrapper.className = 'hero-left';
  leftWrapper.appendChild(element1);
  leftWrapper.appendChild(element2);

  // Create a new div with class "right" for element 3
  const rightWrapper = document.createElement('div');
  rightWrapper.className = 'hero-right';
  rightWrapper.appendChild(element3);

  // Clear the original wrapper and append the new wrappers
  block.innerHTML = '';
  block.appendChild(leftWrapper);
  block.appendChild(rightWrapper);
}
