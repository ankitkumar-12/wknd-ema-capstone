import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// path (relative to the site root) of the searchable index
const SEARCH_INDEX_PATH = '/us/en/search-index.json';

/**
 * Loads the search index, preferring the EDS-generated query-index.json and
 * falling back to the committed static index. Cached after first load.
 * @returns {Promise<Array>} array of { path, title, description }
 */
let searchIndexPromise;
async function loadSearchIndex() {
  if (searchIndexPromise) return searchIndexPromise;
  searchIndexPromise = (async () => {
    const sources = ['/query-index.json', SEARCH_INDEX_PATH];
    for (let i = 0; i < sources.length; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const resp = await fetch(sources[i]);
        if (!resp.ok) continue; // eslint-disable-line no-continue
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        if (json && Array.isArray(json.data) && json.data.length) return json.data;
      } catch (e) { /* try next source */ }
    }
    return [];
  })();
  return searchIndexPromise;
}

/**
 * Renders search results into the results container.
 * @param {Element} results The results list container
 * @param {Array} matches Matching index entries
 * @param {string} query The current query
 */
function renderResults(results, matches, query) {
  results.textContent = '';
  if (!query) {
    results.hidden = true;
    return;
  }
  results.hidden = false;
  if (!matches.length) {
    const li = document.createElement('li');
    li.className = 'nav-search-empty';
    li.textContent = 'No results';
    results.append(li);
    return;
  }
  matches.slice(0, 8).forEach((entry) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = entry.path;
    a.textContent = entry.title || entry.path;
    li.append(a);
    results.append(li);
  });
}

/**
 * Wires up the header search: injects a search input + results list into the
 * nav tools area and filters the index by title/description as the user types.
 * @param {Element} navTools The nav tools container
 */
function setupSearch(navTools) {
  if (!navTools) return;

  const search = document.createElement('div');
  search.className = 'nav-search';
  search.innerHTML = `
    <span class="nav-search-icon" aria-hidden="true"></span>
    <input type="search" class="nav-search-input" placeholder="SEARCH" aria-label="Search" autocomplete="off" />
    <ul class="nav-search-results" role="listbox" hidden></ul>`;
  // place search before any existing tools (e.g. Sign In)
  navTools.prepend(search);

  const input = search.querySelector('.nav-search-input');
  const results = search.querySelector('.nav-search-results');

  const runSearch = async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) { renderResults(results, [], ''); return; }
    const data = await loadSearchIndex();
    const matches = data.filter((entry) => {
      const haystack = `${entry.title || ''} ${entry.description || ''}`.toLowerCase();
      return haystack.includes(query);
    });
    renderResults(results, matches, query);
  };

  input.addEventListener('input', runSearch);
  // navigate to the first result on Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = results.querySelector('a');
      if (first) window.location.assign(first.href);
    }
  });
  // close results when focus leaves the search
  search.addEventListener('focusout', (e) => {
    if (!search.contains(e.relatedTarget)) { results.hidden = true; }
  });
  input.addEventListener('focus', () => { if (input.value.trim()) runSearch(); });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand && navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    const brandContainer = brandLink.closest('.button-container');
    if (brandContainer) brandContainer.className = '';
  }

  // move the utility links (Sign In, language) into a black top bar and wire
  // up search in the tools area
  const navTools = nav.querySelector('.nav-tools');
  let utilityBar;
  if (navTools) {
    // any .button promotion from decorateButtons is undone — utility links are
    // plain text in the original WKND header
    navTools.querySelectorAll('a.button').forEach((a) => {
      a.className = '';
      const wrapper = a.closest('.button-container');
      if (wrapper) wrapper.className = '';
    });
    // lift the authored utility links (Sign In / language) out of tools into
    // a dedicated utility bar rendered above the main nav row
    const utilityLinks = [...navTools.querySelectorAll('p > a')];
    if (utilityLinks.length) {
      utilityBar = document.createElement('div');
      utilityBar.className = 'nav-utility';
      utilityLinks.forEach((a) => {
        a.closest('p').remove();
        // prefix the language link with a US flag icon
        if (a.getAttribute('href') === '#language') {
          a.classList.add('nav-utility-lang');
          const flag = document.createElement('span');
          flag.className = 'nav-utility-flag';
          flag.setAttribute('aria-hidden', 'true');
          a.prepend(flag);
        }
        utilityBar.append(a);
      });
    }
  }
  setupSearch(navTools);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (utilityBar) navWrapper.append(utilityBar);
  navWrapper.append(nav);
  block.append(navWrapper);
}
