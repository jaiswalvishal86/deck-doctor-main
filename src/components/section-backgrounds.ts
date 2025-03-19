export function initSectionBackgrounds() {
  document.querySelectorAll('.section-background_component').forEach((sectionBackground) => {
    gsap.set(sectionBackground, { scale: 0.98, y: '0rem', borderRadius: '3.5rem' });

    const sectionBackgroundTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionBackground,
        start: 'top 66%',
        end: 'top top',
        scrub: 0.75,
        markers: window.IS_DEBUG_MODE ? true : false,
      },
    });

    sectionBackgroundTimeline.to(sectionBackground, { scale: 1, y: '0rem', borderRadius: '0rem' });
  });
}
