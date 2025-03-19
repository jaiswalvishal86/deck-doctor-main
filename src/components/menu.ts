import { breakpointMediaQueries } from 'src/utils';
import { vitalsHeartbeatAnimationInit } from './button-vitals';

export const NAV_TRIGGER_BUTTON_SELECTOR = '.nav_menu-button';
const NAV_ICON_LINE_TOP_SELECTOR = '.nav_menu-icon-line.is-top';
const NAV_ICON_LINE_BOTTOM_SELECTOR = '.nav_menu-icon-line.is-bottom';
const NAV_MENU_WRAPPER_SELECTOR = '.nav_menu-wrapper';
const NAV_MENU_LINK_SELECTOR = '.nav_menu-wrapper .nav_link';
const NAV_MENU_BUTTON_SELECTOR = '.nav_menu-wrapper .button';
const menuItemsList = gsap.utils.toArray([NAV_MENU_LINK_SELECTOR, NAV_MENU_BUTTON_SELECTOR]);

const VITALS_MENU_WRAPPER_SELECTOR = '.nav_activity-wrapper';
export const VITALS_TRIGGER_BUTTON_SELECTOR = '.nav_activity-btn';
export const VITALS_BUTTON_ICON_HEARTBEAT_SELECTOR = '.vitals_icon.is-heartbeat';
const VITALS_BUTTON_ICON_CLOSE_SELECTOR = '.vitals_icon.is-x';
const VITALS_MENU_ITEM_SELECTOR = '.nav_vitals-item';

const NAV_OVERLAY_SELECTOR = '.nav_overlay';
const overlayEl = document.querySelector(NAV_OVERLAY_SELECTOR);

const MENU_OPEN_COMBO_CLASS = 'is-menu-open';

const MENU_MOVE_Y = 6;
const MENU_ITEMS_STAGGER_DELAY = 0.05;

let OVERLAY_ANIMATION_TIMELINE: gsap.core.Timeline;

type MenuType = 'nav' | 'vitals';

interface MenuState {
  isOpen: boolean;
  openMenuType: MenuType | null;
  action: 'swap' | 'new';
}

interface MenuProxyHandler {
  changes: Array<{ property: keyof MenuState; value: any }>;
  set: (target: MenuState, property: keyof MenuState, value: any) => boolean;
  processChanges: () => void;
}

let state: MenuState;
let menuHandler: MenuProxyHandler;
let proxiedState: MenuState;

const navTriggerButtonEl = document.querySelector(NAV_TRIGGER_BUTTON_SELECTOR);
const navMenuEl = document.querySelector(NAV_MENU_WRAPPER_SELECTOR);
const vitalsTriggerButtonEl = document.querySelector(VITALS_TRIGGER_BUTTON_SELECTOR);
const vitalsMenuEl = document.querySelector(VITALS_MENU_WRAPPER_SELECTOR);

type MenuFunction<T> = T extends (...args: any[]) => void ? T : () => void;
const menuList: {
  menu: MenuType;
  triggerEl: HTMLElement;
  menuEl: HTMLElement;
  openFunction: MenuFunction<typeof openNavMenu | typeof openVitalsMenu>;
  closeFunction: MenuFunction<typeof closeNavMenu | typeof closeVitalsMenu>;
  animationTimeline: gsap.core.Timeline;
}[] = [
    {
      menu: 'nav',
      triggerEl: navTriggerButtonEl as HTMLElement,
      menuEl: navMenuEl as HTMLElement,
      openFunction: openNavMenu,
      closeFunction: closeNavMenu,
      animationTimeline: gsap.timeline(),
    },
    {
      menu: 'vitals',
      triggerEl: vitalsTriggerButtonEl as HTMLElement,
      menuEl: vitalsMenuEl as HTMLElement,
      openFunction: openVitalsMenu,
      closeFunction: closeVitalsMenu,
      animationTimeline: gsap.timeline(),
    },
  ];

type MenuListCacheIndex = {
  [key in MenuType]: number;
};
const menuListIndexCache: MenuListCacheIndex = {};

export function initMenus(): void {
  OVERLAY_ANIMATION_TIMELINE = gsap.timeline();

  // vitalsHeartbeatAnimationInit();

  initMenuStateHandler();

  setNavMenuDefaults();
  setVitalsMenuDefaults();
  setMenuOverlayDefaults();
}

function initMenuStateHandler() {
  state = {
    isOpen: false,
    openMenuType: null,
    action: 'new',
  };

  menuHandler = {
    changes: [],

    set(target, property, value) {
      this.changes.push({ property, value });
      target[property] = value;

      return true;
    },

    processChanges() {
      window.DEBUG('Change menu state', state);

      if (!state.isOpen) {
        if (state.openMenuType !== null) {
          const menuItem = menuList.find((item) => item.menu === state.openMenuType);
          menuItem?.closeFunction(true);

          state.openMenuType = null;
        }

        state.action = 'new';
        return;
      }

      if (state.action === 'swap') {
        // close all other open menus
        menuList.forEach((trigger) => {
          if (trigger.menu !== state.openMenuType) {
            trigger.closeFunction(false);
          }
        });
      }

      getMenuItem(state.openMenuType)?.openFunction(true);
    },
  };

  proxiedState = new Proxy(state, menuHandler);

  menuList.forEach((menuItem, menuItemIndex) => {
    if (!menuItem.triggerEl || !menuItem.menuEl) {
      window.DEBUG('Menu trigger button or nav not found', menuItem.triggerEl, menuItem.menuEl);
      return;
    }

    menuListIndexCache[menuItem.menu] = menuItemIndex;

    menuItem.triggerEl.addEventListener('click', () => {
      window.DEBUG('menu trigger click', menuItem);

      if (proxiedState.isOpen) {
        if (proxiedState.openMenuType !== menuItem.menu) {
          proxiedState.action = 'swap';
          proxiedState.openMenuType = menuItem.menu;
        } else {
          proxiedState.isOpen = false;
        }
      } else {
        proxiedState.isOpen = true;
        proxiedState.openMenuType = menuItem.menu;
        proxiedState.action = 'new';
      }

      menuHandler.processChanges();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !state.isOpen) return;

    closeMenus();
  });

  document.addEventListener('click', (ev) => {
    if (!state.isOpen) return;

    const targetEl = ev.target as Node;

    const isTriggerElClick = menuList.some((menuItem) => {
      if ((menuItem.triggerEl.contains(targetEl) || menuItem.menuEl.contains(targetEl)) && targetEl.nodeName !== 'A') {
        return true;
      }
    });

    if (isTriggerElClick) return;

    closeMenus();
  });

  // custom overlay trigger not required since we already have a `document` level click trigger catch and this will bubble up
  // overlayEl?.addEventListener('click', () => {
  //   closeMenus();
  // });
}

function closeMenus() {
  getMenuItem(proxiedState.openMenuType)?.closeFunction(true);
  proxiedState.isOpen = false;
  menuHandler.processChanges();
}

function getMenuItem(menu: MenuType) {
  return menuList.find((item) => item.menu === menu);
}

function setNavMenuDefaults() {
  getMenuAnimationTimeline('nav').clear().eventCallback('onComplete', null);

  gsap.set(navMenuEl, {
    display: 'none',
    opacity: 0,
    y: MENU_MOVE_Y,
  });

  gsap.set(menuItemsList, {
    opacity: 0,
  });
}

function openNavMenu(showOverlay: boolean = true) {
  setNavMenuDefaults();

  const gsapTimeline = getMenuAnimationTimeline('nav');

  let mm = gsap.matchMedia();

  navTriggerButtonEl?.classList.add(MENU_OPEN_COMBO_CLASS);
  animateMenuIcon('open');

  if (showOverlay) {
    showMenuOverlay();
  }

  gsapTimeline.set(navMenuEl, {
    display: 'flex',
    opacity: 1,
  });
  gsapTimeline.to(navMenuEl, {
    y: 0,
    duration: 0.4,
  });


  mm.add(
    breakpointMediaQueries,
    (context) => {
      const { isDesktop, isTablet, } = context.conditions!;
      const isTabletOrAbove = isDesktop || isTablet;
      if (isTabletOrAbove) {
        gsapTimeline.to(
          [NAV_MENU_LINK_SELECTOR, NAV_MENU_BUTTON_SELECTOR],
          {
            opacity: 1,
            stagger: MENU_ITEMS_STAGGER_DELAY,
          },
          '<+0.1'
        );
      } else {
        // reverse on mobile; button is at the top
        gsapTimeline.to(
          [NAV_MENU_BUTTON_SELECTOR, NAV_MENU_LINK_SELECTOR],
          {
            opacity: 1,
            stagger: MENU_ITEMS_STAGGER_DELAY,
          },
          '<+0.1'
        );
      }
    }
  );
}

function closeNavMenu(hideOverlay: boolean = true) {
  const gsapTimeline = getMenuAnimationTimeline('nav');
  gsapTimeline.clear();

  gsapTimeline.eventCallback('onComplete', () => {
    setNavMenuDefaults();
  });

  navTriggerButtonEl?.classList.remove(MENU_OPEN_COMBO_CLASS);
  animateMenuIcon('close');

  gsapTimeline.to(navMenuEl, {
    opacity: 0,
    duration: 0.3,
  });

  if (hideOverlay) {
    hideMenuOverlay();
  }
}

function setVitalsMenuDefaults() {
  getMenuAnimationTimeline('vitals').clear().eventCallback('onComplete', null);

  gsap.set(VITALS_BUTTON_ICON_HEARTBEAT_SELECTOR, {
    opacity: 1,
  });
  gsap.set(VITALS_BUTTON_ICON_CLOSE_SELECTOR, {
    opacity: 0,
  });
  gsap.set(vitalsMenuEl, {
    display: 'none',
    opacity: 0,
    y: MENU_MOVE_Y,
  });
  gsap.set(VITALS_MENU_ITEM_SELECTOR, {
    opacity: 0,
  });
}

const vitalsButtonIcon = document.querySelector(`${VITALS_BUTTON_ICON_HEARTBEAT_SELECTOR} svg path`);
const tweenVitalsButtonIcon = gsap.to(vitalsButtonIcon, {
  duration: 1.5,
  drawSVG: '100% 100%',
  keyframes: [
    {
      drawSVG: '100% 100%',
      duration: 1.5
    },
  ],
  repeat: -1,
  ease: 'power1.inOut',
  yoyo: true,
  paused: true,
});

// Emulate a heartbeat on the button while it's open
// This should be two rapid scale-ups, then a break, then repeat indefinitely
// const heartbeat = 0.1875;
// const pulseVitalsButton = gsap.to(vitalsTriggerButtonEl, {
//   keyframes: [
//     {
//       scale: 1.1,
//       duration: heartbeat
//     },
//     {
//       scale: 1,
//       duration: heartbeat
//     },
//     {
//       scale: 1.1,
//       duration: heartbeat
//     },
//     {
//       scale: 1,
//       duration: heartbeat
//     },
//     {
//       scale: 1,
//       duration: heartbeat * 4
//     },
//   ],
//   repeat: -1,
//   paused: true,
// });

function openVitalsMenu(showOverlay: boolean = true) {
  setVitalsMenuDefaults();

  const gsapTimeline = getMenuAnimationTimeline('vitals');

  vitalsTriggerButtonEl?.classList.add(MENU_OPEN_COMBO_CLASS);

  if (showOverlay) {
    showMenuOverlay();
  }

  gsapTimeline.set(vitalsMenuEl, {
    display: 'grid',
    opacity: 1,
  });
  gsapTimeline.to(vitalsMenuEl, {
    y: 0,
    duration: 0.4,
  });
  gsapTimeline.to(
    VITALS_MENU_ITEM_SELECTOR,
    {
      opacity: 1,
      stagger: MENU_ITEMS_STAGGER_DELAY,
    },
    '<+0.1'
  );

  tweenVitalsButtonIcon.play();


  // gsap.to(VITALS_BUTTON_ICON_HEARTBEAT_SELECTOR, {
  //   opacity: 0,
  //   duration: 0.2,
  // });
  // gsap.to(VITALS_BUTTON_ICON_CLOSE_SELECTOR, {
  //   opacity: 1,
  //   duration: 0.2,
  //   display: 'flex',
  // });
}

function closeVitalsMenu(hideOverlay: boolean = true) {
  const gsapTimeline = getMenuAnimationTimeline('vitals');
  gsapTimeline.clear();

  gsapTimeline.eventCallback('onComplete', () => {
    setVitalsMenuDefaults();
  });

  vitalsTriggerButtonEl?.classList.remove(MENU_OPEN_COMBO_CLASS);

  gsapTimeline.set(VITALS_BUTTON_ICON_CLOSE_SELECTOR, {
    opacity: 0,
    duration: 0,
    display: 'none',
  });
  gsapTimeline.to(vitalsMenuEl, {
    opacity: 0,
    duration: 0.25,
  });

  tweenVitalsButtonIcon.pause();

  gsap.to(vitalsButtonIcon, {
    duration: 0.15,
    drawSVG: '100% 0%',
    onComplete: () => {
      tweenVitalsButtonIcon.progress(0);
    },
  });

  if (hideOverlay) {
    hideMenuOverlay();
  }
}

function setMenuOverlayDefaults() {
  OVERLAY_ANIMATION_TIMELINE.clear().eventCallback('onComplete', null);

  if (!overlayEl) {
    window.DEBUG('Nav overlay element not found', { overlayEl });
    window.DEBUG(`Looking for ${NAV_OVERLAY_SELECTOR}`);
    return;
  }
  gsap.set(overlayEl, {
    display: 'none',
    opacity: 0,
  });
}

function showMenuOverlay() {
  setMenuOverlayDefaults();

  OVERLAY_ANIMATION_TIMELINE.set(overlayEl, {
    display: 'flex',
  });
  OVERLAY_ANIMATION_TIMELINE.to(overlayEl, {
    opacity: 1,
    duration: 0.3,
  });
}

function hideMenuOverlay() {
  OVERLAY_ANIMATION_TIMELINE.clear();

  OVERLAY_ANIMATION_TIMELINE.eventCallback('onComplete', setMenuOverlayDefaults);

  OVERLAY_ANIMATION_TIMELINE.to(overlayEl, {
    opacity: 0,
    duration: 0.2,
  });
}

function animateMenuIcon(mode: 'open' | 'close' = 'open') {
  const iconTopEl = document.querySelector(NAV_ICON_LINE_TOP_SELECTOR);
  const iconBottomEl = document.querySelector(NAV_ICON_LINE_BOTTOM_SELECTOR);

  // The amount by which to shift the menu icon lines
  const iconShiftAmount = 3.5;

  if (!iconTopEl || !iconBottomEl) {
    window.DEBUG('Menu top or bottom icon not found', { iconTopEl }, { iconBottomEl });
    window.DEBUG(`Looking for ${NAV_ICON_LINE_TOP_SELECTOR} and ${NAV_ICON_LINE_BOTTOM_SELECTOR}`);
    return;
  }

  const gsapTimeline = gsap.timeline({
    defaults: {
      duration: 0.3,
      ease: 'power2.inOut',
    },
  });

  if ('open' === mode) {
    gsapTimeline.to(iconTopEl, {
      y: iconShiftAmount,
      rotateZ: 45,
    });
    gsapTimeline.to(
      iconBottomEl,
      {
        y: -1 * iconShiftAmount,
        rotateZ: -45,
      },
      '<'
    );
  } else if ('close' === mode) {
    gsapTimeline.to(iconTopEl, {
      y: 0,
      rotateZ: 0,
    });
    gsapTimeline.to(
      iconBottomEl,
      {
        y: 0,
        rotateZ: 0,
      },
      '<'
    );
  }
}

function getMenuAnimationTimeline(type: MenuType) {
  const index = menuListIndexCache[type];
  return menuList[index].animationTimeline;
}
