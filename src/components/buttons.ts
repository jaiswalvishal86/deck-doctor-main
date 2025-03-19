/**
 * Adds animations to all `.buttons` and `[data-button-animate]`
 * Selects `.button-icon` or child `img` as button icons for separate scaling
 */

export const BUTTON_SPRING_EASING_NAME = 'buttonSpring';

gsap.registerEase(
  BUTTON_SPRING_EASING_NAME,
  CustomEase.create(BUTTON_SPRING_EASING_NAME, 'M0,0 C0.131,0.382 0.382,1.286 0.787,1.117 0.911,1.064 0.758,0.852 1,1')
);

const BUTTON_PRESS_SCALE = 0.98;
const BUTTON_HOVER_SCALE = 1.02;

export function initButtonAnimations(): void {
  const BUTTON_SELECTORS_LIST = ['.button', '[data-button-animate]'];
  const BUTTON_ICON_SELECTORS_LIST = ['.button-icon', '.icon-1d5', 'img'];

  BUTTON_SELECTORS_LIST.forEach((BUTTON_SELECTOR) => {
    const buttons = document.querySelectorAll(BUTTON_SELECTOR);
    buttons.forEach((button) => {
      let buttonIcon: HTMLElement | false = false;
      const pressAnimationTimeline: gsap.core.Timeline = gsap.timeline();
      BUTTON_ICON_SELECTORS_LIST.some((BUTTON_ICON_SELECTOR) => {
        const buttonIconEl = button.querySelector(BUTTON_ICON_SELECTOR);
        if (buttonIconEl) {
          buttonIcon = buttonIconEl;
          return true;
        }
      });

      button.addEventListener('mouseenter', () => {
        onButtonHoverIn(button, buttonIcon);
      });
      button.addEventListener('mouseleave', () => {
        onButtonHoverOut(button, buttonIcon);
      });
      button.addEventListener('mousedown', () => {
        onButtonPress(pressAnimationTimeline, button, buttonIcon);

        button.addEventListener(
          'mouseup',
          () => {
            onButtonRelease(pressAnimationTimeline, button);
          },
          { once: true }
        );
      });
    });
  });
}

function onButtonHoverIn(button: HTMLElement, icon: HTMLElement | false = false) {
  gsap.to(button, {
    scale: BUTTON_HOVER_SCALE,
    duration: 0.3,
    ease: BUTTON_SPRING_EASING_NAME,
  });

  if (icon) {
    gsap.to(icon, {
      scale: 1.1,
      duration: 0.3,
      ease: 'power1.out',
    });
  }
}

function onButtonHoverOut(button: HTMLElement, icon: HTMLElement | false = false) {
  gsap.to(button, {
    scale: 1,
    duration: 0.25,
    ease: BUTTON_SPRING_EASING_NAME,
  });

  if (icon) {
    gsap.to(icon, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
  }
}

function onButtonPress(
  pressAnimationTimeline: gsap.core.Timeline,
  button: HTMLElement,
  icon: HTMLElement | false = false
) {
  pressAnimationTimeline.add(
    gsap.to(button, {
      scale: BUTTON_PRESS_SCALE,
      duration: 0.2,
      ease: 'power2.out',
    })
  );
  if (icon) {
    pressAnimationTimeline.add(
      gsap.to(icon, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      }),
      '<'
    );
  }
}

function onButtonRelease(pressAnimationTimeline: gsap.core.Timeline, button: HTMLElement) {
  const releaseAnimationTimeline = gsap.timeline({
    onComplete: () => {
      pressAnimationTimeline.clear(true);
    },
  });

  releaseAnimationTimeline.to(button, {
    scale: 1,
    duration: 0.15,
    ease: 'power2.out',
  });

  pressAnimationTimeline.add(releaseAnimationTimeline);
}
