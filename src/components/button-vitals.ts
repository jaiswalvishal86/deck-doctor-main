import { VITALS_BUTTON_ICON_HEARTBEAT_SELECTOR, VITALS_TRIGGER_BUTTON_SELECTOR } from './menu';

export function vitalsHeartbeatAnimationInit() {
  const vitalsButton = document.querySelector(VITALS_TRIGGER_BUTTON_SELECTOR);
  const vitalsButtonIcon = document.querySelector(`${VITALS_BUTTON_ICON_HEARTBEAT_SELECTOR} svg path`);

  if (!vitalsButton || !vitalsButtonIcon) {
    window.DEBUG('vitalsButton or vitalsButtonIcon not found', { vitalsButton }, { vitalsButtonIcon });
    return;
  }

  ['mouseenter', 'focusin'].forEach((eventName) => {
    // Draw from left to right infinitely, taking 1 second each time
    // Oddly this SVG is drawn from right to left, so we're using reverse values to make it left to right
    vitalsButton.addEventListener(eventName, () => {
      window.DEBUG('vitalsButton', eventName);
      gsap.to(
        vitalsButtonIcon,
        // { drawSVG: '100% 100%' },
        { duration: 1.5, drawSVG: '100% 100%', repeat: -1, ease: 'power1.inOut', yoyo: true }
      );
    });
  });

  ['mouseleave', 'focusout'].forEach((eventName) => {
    vitalsButton.addEventListener(eventName, () => {
      // Quickly reset the animation when the mouse leaves
      gsap.to(vitalsButtonIcon, { duration: 0.15, drawSVG: '100% 0%', overwrite: true });
    });
  });
}
