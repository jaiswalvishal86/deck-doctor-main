const ACCORDION_SELECTOR = 'details.treatments_accordion-component';
const ACCORDION_TOGGLE_SELECTOR = 'summary';
const ACCORDION_CONTENT_SELECTOR = '.treatments_accordion-content-wrapper';

export function treatmentAccordions() {
  const accordionsList = document.querySelectorAll<HTMLDetailsElement>(ACCORDION_SELECTOR);
  accordionsList.forEach((accordion) => {
    const accordionToggleEl = accordion.querySelector(ACCORDION_TOGGLE_SELECTOR);
    const accordionContentEl = accordion.querySelector(ACCORDION_CONTENT_SELECTOR);

    if (!accordionToggleEl || !accordionContentEl) {
      window.DEBUG('Accordion toggle or content not found', { accordionToggleEl }, { accordionContentEl });
      return;
    }

    let SHOULD_CLOSE_ACCORDION = false;

    gsap.set(accordionContentEl, {
      height: 0,
    });

    const animationTimeline = gsap.timeline({
      onComplete: () => {
        if (SHOULD_CLOSE_ACCORDION && accordion.open) {
          window.DEBUG('accordion close');
          accordion.open = false;
        }
      },
    });

    accordionToggleEl.addEventListener('click', (clickEv) => {
      clickEv.preventDefault();
      clickEv.stopPropagation();

      SHOULD_CLOSE_ACCORDION = true;
      let height: number | string = 0;

      if (!accordion.open) {
        window.DEBUG('accordion open');
        accordion.open = true;
        height = 'auto';
        SHOULD_CLOSE_ACCORDION = false;
      } else {
        height = 0;
      }

      animationTimeline.to(accordionContentEl, {
        height: height,
        duration: 0.3,
      });
    });
  });
}
