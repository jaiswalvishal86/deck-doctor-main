import Macy from 'macy';
import { FOOTER_BACKGROUND_COLOR_SELECTOR } from 'src/global-selectors';

const COLLECTION_LIST_SELECTOR = '.lobby_collection-list';

const LOBBY_BG_IMAGE_SELECTOR = '.lobby_bg-image';
const LOBBY_BG_IMAGE_ACTIVE_CLASSNAME = 'is-active';
const LOBBY_BG_IMAGE_ATTRIBUTE_NAME = 'data-filter-image';
const LOBBY_BG_COLOR_ATTRIBUTE_NAME = 'data-bg-color';

const FILTER_FORM_SELECTOR = '[data-filter-form]';

let MACY_INSTANCE: Macy;

// Sound
// The width animation is a bit hacky, but it looks nice to grow/shrink width as the sound waves appear between muted and unmuted states
window.Webflow?.push(() => {
  initLobbyFilterFormListener();

  const soundButton = document.querySelector('.button.is-sound')! as HTMLDivElement;
  const soundButtonText = soundButton.querySelector('.nav_sound-button-text')!;
  const audio = document.querySelector('audio')! as HTMLAudioElement;
  const soundWaveSmall = soundButton.querySelector<SVGPathElement>('svg path:nth-child(1)')!;
  const soundWaveBig = soundButton.querySelector<SVGPathElement>('svg path:nth-child(2)')!;

  const soundWaveInitialState: gsap.TweenVars = { opacity: 0, scale: 0.5, x: -2 };
  gsap.set([soundWaveSmall, soundWaveBig], { ...soundWaveInitialState, transformOrigin: 'center left' });
  const mutedIconOffset = 8;
  const soundButtonInitialState: gsap.TweenVars = { width: soundButton.clientWidth - mutedIconOffset };
  gsap.set(soundButton, { ...soundButtonInitialState });

  audio.muted = true;
  soundButton.addEventListener('click', () => {
    if (audio.muted) {
      audio.muted = false;
      audio.play();
      soundButtonText.innerHTML = 'On';
      gsap.to([soundWaveSmall, soundWaveBig], { opacity: 1, scale: 1, duration: 0.2, x: 0, stagger: 0.1 });
      gsap.to(soundButton, { width: (soundButtonInitialState.width! as number) + mutedIconOffset, duration: 0.2 });
    } else {
      audio.pause();
      audio.muted = true;
      soundButtonText.innerHTML = 'Off';
      gsap.to([soundWaveSmall, soundWaveBig], { ...soundWaveInitialState, duration: 0.2, stagger: 0.1 });
      gsap.to(soundButton, { ...soundButtonInitialState, duration: 0.2 });
    }
  });
});

/**
 * Masonry layout
 */
gsap.set(COLLECTION_LIST_SELECTOR, { opacity: 0 });

window.Webflow?.push(() => {
  MACY_INSTANCE = Macy({
    container: COLLECTION_LIST_SELECTOR,
    columns: 2,
    // waitForImages: true,
    margin: {
      x: 24,
      y: 24,
    },
    breakAt: {
      991: {
        columns: 1,
        margin: {
          x: 24,
          y: 24,
        },
      },
      767: {
        columns: 1,
      },
    },
  });

  MACY_INSTANCE.runOnImageLoad(function () {
    recalculateMacy();
  });
});

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  (filterInstances) => {
    window.DEBUG('CMS Filter loaded on page');
    recalculateMacy();

    gsap.to(COLLECTION_LIST_SELECTOR, { opacity: 1, duration: 0.3 });

    const [filterInstance] = filterInstances;

    filterInstance.listInstance.on('renderitems', (renderedItems) => {
      window.DEBUG(`CMS Filter renderitems`);

      if (!MACY_INSTANCE) {
        window.DEBUG(`Macy instance not found`);
        return;
      }

      // Push the layout calculation to the end of heap stack to allow CMS Filter loading to complete
      setTimeout(() => {
        recalculateMacy();
        window.DEBUG(`Finishing filter interval...`);
      }, 0);
    });
  },
]);

function recalculateMacy() {
  if (!MACY_INSTANCE) {
    window.DEBUG('Macy instance not found');
    return;
  }
  MACY_INSTANCE.recalculate(true);
  ScrollTrigger.refresh();
  window.DEBUG('Macy recalculated');
}

let initialLobbyBackgroundColor: string;
let initialLobbyBackgroundImage: HTMLImageElement;

function initLobbyFilterFormListener() {
  // Set up event listener on form radio elements
  document.querySelectorAll(`${FILTER_FORM_SELECTOR} input[type="radio"]`).forEach((radioEl) => {
    radioEl.addEventListener('change', updateLobbyBG);
  });

  // Store initial color so client doesn't need to set this attribute on the non-CMS "all" filter
  initialLobbyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;
  // First image is default
  initialLobbyBackgroundImage = document.querySelector(`.lobby_bg-image-element`) as HTMLImageElement;
}

/**
 * Updates background color and image according to the required one on filter change
 */
function updateLobbyBG(changeEvent: Event) {
  const radioEl = changeEvent.target as HTMLInputElement;
  const slug = radioEl.getAttribute('data-slug');
  // const imageName = radioEl.getAttribute(LOBBY_BG_IMAGE_ATTRIBUTE_NAME);

  // Background color is stored in a sibling embed with a hidden input
  // Fallback to initial color if not found
  const image = document.querySelector(`.lobby_bg-image-element[data-slug="${slug}"]`) || initialLobbyBackgroundImage;
  const bgColor = radioEl.parentElement?.querySelector<HTMLInputElement>(`input[type="hidden"]`)?.value || initialLobbyBackgroundColor;

  // if (!imageName || !bgColor) {
  //   window.DEBUG('Lobby image or background color not found on the current active filter');
  //   return;
  // }

  // const currentActiveImageEl = document.querySelector(`${LOBBY_BG_IMAGE_SELECTOR}.${LOBBY_BG_IMAGE_ACTIVE_CLASSNAME}`);
  // currentActiveImageEl?.classList.remove(LOBBY_BG_IMAGE_ACTIVE_CLASSNAME);

  // const newActiveImageEl = document.querySelector(
  //   `${LOBBY_BG_IMAGE_SELECTOR}[${LOBBY_BG_IMAGE_ATTRIBUTE_NAME}="${imageName}"]`
  // );
  // newActiveImageEl?.classList.add(LOBBY_BG_IMAGE_ACTIVE_CLASSNAME);


  // Cross-fade images
  gsap.to('.lobby_bg-image-element', { opacity: 0, duration: 0.1 });
  gsap.to(image, { opacity: 1, duration: 0.1, overwrite: true });
  gsap.to('body', { backgroundColor: bgColor, duration: 0.45, ease: 'power2.out' });
}