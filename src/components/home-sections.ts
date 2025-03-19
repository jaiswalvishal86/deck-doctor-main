const SECTION_SELECTOR = '.section-layout_component';
// const SECTION_SHRUNK_WIDTH = '97%';
const SECTION_SHRUNK_SCALE_X = 0.97;

window.Webflow?.push(() => {
  // to fix any font load section position inconsistencies
  ScrollTrigger.refresh();
});

export function onHomeSectionScroll() {
  const sectionsList = document.querySelectorAll(SECTION_SELECTOR);
  if (sectionsList.length === 0) {
    return;
  }

  sectionsList.forEach((sectionEl) => {
    const previousSectionEl = sectionEl.parentElement?.previousElementSibling;
    const hasPreviousSection = previousSectionEl && previousSectionEl.nodeName === 'SECTION' ? true : false;

    gsap.set(sectionEl, {
      // width: SECTION_SHRUNK_WIDTH,
      scaleX: SECTION_SHRUNK_SCALE_X,
    });

    const scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 50%',
        end: 'top top',
        scrub: true,
        markers: window.IS_DEBUG_MODE ? true : false,
        id: 'section-scroll',

      },
    });

    scrollTimeline.fromTo(
      sectionEl,
      {
        borderTopLeftRadius: '3.5rem',
        borderTopRightRadius: '3.5rem',
        // width: SECTION_SHRUNK_WIDTH,
        scaleX: SECTION_SHRUNK_SCALE_X,
      },
      {
        borderTopLeftRadius: '0rem',
        borderTopRightRadius: '0rem',
        // width: '100%',
        scaleX: 1,
        ease: 'none',
      }
    );

    if (hasPreviousSection) {
      const sectionParallaxTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top 75%',
          end: 'top top',
          scrub: true,
          markers: window.IS_DEBUG_MODE ? true : false,
          id: 'section-parallax',
        },
      });

      sectionParallaxTimeline.to(
        previousSectionEl as HTMLElement,
        {
          yPercent: 25,
          ease: 'none',
        },
        '<'
      );
    }
  });
}
