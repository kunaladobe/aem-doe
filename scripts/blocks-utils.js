let searchCb = {};
const BV_STARS = '★★★★★';
const BV_CARDS_RATING_KEY = 'bv-cards-rating-url';
const BV_OVERVIEW_RATING_KEY = 'bv-overview-rating-url';
const BV_OVERVIEW_RATING_COMMENT_KEY = 'bv-overview-rating-comment-url';

/**
 * Create new DOM element with tag name and class name.
 * @param tagName tag name
 * @param className class name
 * @returns created element
 */
function createElement(tagName, className) {
  const element = document.createElement(tagName);
  if (className) {
    element.classList.add(className);
  }
  return element;
}

/**
 * Open Search Bar
 * @param cb callback function to be called when search bar is closed
 * @returns {Promise<void>}
 */
function openSearchBar(cb, arg) {
  const searchBlock = document.querySelector('.search.block');
  if (searchBlock) {
    const searchSection = searchBlock.closest('.section');
    document.querySelector('main').prepend(searchSection);
    searchBlock.style.display = 'block';
    searchBlock.querySelector('input')?.focus();
    searchCb = { cb, arg };
  }
}

function closeSearchBar() {
  const search = document.querySelector('.search.block');
  search.style.display = 'none';
  searchCb.cb(searchCb.arg);
}

/**
 * Generate BV review stars markup.
 * @param aHref the link of star
 */
function generateBvStarMarkup(aHref) {
  const bvRatingStars = createElement('div', 'ts-bv-rating-star');
  const emptyStars = createElement('div', 'ts-bv-empty-star');
  const filledStars = createElement('div', 'ts-bv-filled-star');
  if (aHref) {
    const starLink = createElement('a', '');
    starLink.href = aHref;
    starLink.textContent = BV_STARS;
    const starColorLink = starLink.cloneNode(true);
    emptyStars.append(starLink);
    filledStars.append(starColorLink);
  } else {
    emptyStars.textContent = BV_STARS;
    filledStars.textContent = BV_STARS;
  }
  bvRatingStars.append(emptyStars);
  bvRatingStars.append(filledStars);
  return bvRatingStars;
}

/**
 * Utility method to call BV api.
 * @param apiUrl API url
 * @param prefix object name which is used to construct window's data
 */
async function fetchBVData(apiUrl, prefix = 'default') {
  window.tsBVData = window.tsBVData || {};
  if (!window.tsBVData[prefix]) {
    window.tsBVData[prefix] = new Promise((resolve) => {
      fetch(`${apiUrl}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          return {};
        })
        .then((json) => {
          window.tsBVData[prefix] = json;
          resolve(window.tsBVData[prefix]);
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.error('Empty BV API response');
          window.tsBVData[prefix] = {};
          resolve(window.tsBVData[prefix]);
        });
    });
  }
  return window.tsBVData[`${prefix}`];
}

/**
 * Returns the URL for the specified API specific to the environment type.
 */
async function getApiUrl(apiName) {
  const fqdnToEnvType = {
    'terrischeer.com.au': 'prod',
    'www.terrischeer.com.au': 'prod',
    'main--suncorp--aemsites.aem.live': 'prod',
    'main--suncorp--aemsites.hlx.live': 'prod',
  };
  const env = fqdnToEnvType[window.location.hostname] || 'stage';

  const apiUrls = await (await fetch(`${window.hlx.codeBasePath}/${env}-api-urls.json`)).json();
  return apiUrls.data[0][apiName];
}

/**
 * Get BV product rating data by product id.
 * @param apiUrl API url
 */
async function fetchBVProductRating() {
  const apiData = await fetchBVData(await getApiUrl(BV_CARDS_RATING_KEY), 'productBV');
  return apiData.BatchedResults?.q1?.Results;
}

/**
 * Get BV overview rating data by product id.
 * @param apiUrl API url
 */
async function fetchBVOverviewRating(productId) {
  const apiUrl = await getApiUrl(BV_OVERVIEW_RATING_KEY);
  const apiData = await fetchBVData(`${apiUrl}${productId}`, `overrating_${productId}`);
  return apiData.Results[0]?.ProductStatistics?.ReviewStatistics;
}

/**
 * Get BV overview rating comment data by product id.
 * @param apiUrl API url
 */
async function fetchBVOverviewRatingComment(productId) {
  const apiUrl = await getApiUrl(BV_OVERVIEW_RATING_COMMENT_KEY);
  const apiData = await fetchBVData(`${apiUrl}${productId}`, `comment_${productId}`);
  return apiData.Results;
}

/**
 * Updates BV overview rating UI
 * @param main
 */
function updateBazaarVoiceRatingBlock(main) {
  try {
    const block = main.querySelector('.block.bv-overview-rating');
    if (!block) return;

    const productId = block.getAttribute('data-product-id');
    if (!productId) throw new Error('Product ID not found in BV overview rating block.');

    const ratingContent = block.querySelector('.ts-bv-overview-rating');
    if (!ratingContent) throw new Error('Rating content not found in BV overview rating block.');

    fetchBVOverviewRating(productId)
      .then((ratingResults) => {
        if (ratingResults) {
          const overallRating = ratingResults.AverageOverallRating;
          const totalReviewCount = ratingResults.TotalReviewCount;
          const rating = ratingContent.querySelector('.ts-bv-filled-star');
          const starWidth = (overallRating * 100) / 5;
          rating.style.width = `${starWidth}%`;
          const reviews = ratingContent.querySelector('.ts-bv-overview-rating-review-number');
          reviews.textContent = ` ${totalReviewCount} `;
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching or updating BV overview rating:', error);
      });
    fetchBVOverviewRatingComment(productId)
      .then((commentResults) => {
        if (commentResults && commentResults.length > 0) {
          const randomItem = commentResults[Math.floor(Math.random() * commentResults.length)];
          const userComment = randomItem.Title;
          const userName = randomItem.UserNickname;
          const comment = ratingContent.querySelector('.ts-bv-overview-rating-comment');
          comment.textContent = `"${userComment}" ${userName}`;
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching or updating BV overview comments:', error);
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating BV overview rating block:', error);
  }
}

/**
 * Add required script to show BV reviews
 * @param bvReviewsBlocks bazaarvoice-integration block with type = 'BV Reviews'
 */
function addBazaarVoiceReviewsScript(bvReviewsBlocks) {
  if (!bvReviewsBlocks) return;
  bvReviewsBlocks.forEach((block) => {
    const productId = block.getAttribute('data-product-id');
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      $BV.ui('rr', 'show_reviews', {
        productId: '${productId}',
        doShowContent: function() {
          // If the container is hidden (such as behind a tab), put code here to make it visible
        }
      });
    `;
    block.appendChild(script);
  });
}

/**
 * Add required script to show BV submission form
 * @param bvSubmissionFormBlocks bazaarvoice-integration block with type = 'BV Submission Form'
 */
function addBazaarVoiceFormSubmissionScript(bvSubmissionFormBlocks) {
  if (!bvSubmissionFormBlocks) return;
  bvSubmissionFormBlocks.forEach((block) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      $BV.container('global', {});
    `;
    block.appendChild(script);
  });
}

/**
 * Generate super script for richtext block.
 * @param main main content
 */
function generateSuperScripts(main) {
  let count = 1;
  main.querySelectorAll('.rich-text a:has(sup)').forEach((supLink) => {
    if (supLink) {
      const targetLink = supLink.cloneNode(true);
      targetLink.textContent = supLink.textContent;
      const sup = createElement('sup');
      const wrapper = createElement('div');
      wrapper.classList.add('footnote-wrapper');
      wrapper.style.display = 'none';
      const clickableLink = createElement('div', 'footnote-anchor');
      clickableLink.textContent = count;
      sup.appendChild(clickableLink);
      clickableLink.addEventListener('mouseenter', () => {
        wrapper.style.display = 'block';
      });
      document.addEventListener('click', (event) => {
        if (!clickableLink.contains(event.target)) {
          wrapper.style.display = 'none';
        }
      });
      wrapper.appendChild(targetLink);
      sup.appendChild(wrapper);
      supLink.replaceWith(sup);
      count += 1;
    }
  });
}

function enableAdaptiveTooltip(tooltip) {
  ['mouseover', 'focus'].forEach((evt) => {
    tooltip.addEventListener(evt, () => {
      // Reset any previous position adjustment
      tooltip.querySelector(':scope .tooltip-content').style.marginLeft = '';
      tooltip.classList.remove('tooltip-left');
      tooltip.classList.remove('tooltip-bottom');

      const tooltipRect = tooltip.getBoundingClientRect();
      const spaceRight = window.innerWidth - tooltipRect.left + tooltipRect.width;
      const spaceLeft = tooltipRect.left;
      const rightAdjustment = spaceLeft / 20;

      if (spaceRight < 275 && spaceLeft < 275) {
        tooltip.classList.add('tooltip-bottom');
        tooltip.querySelector(':scope .tooltip-content').style.marginLeft = `-${rightAdjustment}rem`;
      } else if (spaceRight < 275) {
        tooltip.classList.add('tooltip-left');
      }
    });
  });
}

export {
  createElement,
  openSearchBar,
  closeSearchBar,
  generateBvStarMarkup,
  fetchBVProductRating,
  getApiUrl,
  updateBazaarVoiceRatingBlock,
  addBazaarVoiceReviewsScript,
  addBazaarVoiceFormSubmissionScript,
  generateSuperScripts,
  enableAdaptiveTooltip,
};
