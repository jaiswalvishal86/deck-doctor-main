import { Flip } from 'gsap/Flip';
// import { SplitText } from 'gsap/SplitText';
import SplitType from 'split-type';
import { treatmentAccordions } from 'src/components/treatment-accordions';
import { breakpointMediaQueries } from 'src/utils';

// TODO — confirm with Paras why I have to register this again to use in home.ts
// gsap.registerPlugin(SplitText);
gsap.registerPlugin(Flip);

gsap.defaults({
  ease: 'power3.out',
  duration: 0.45,
});

window.Webflow?.push(() => {
  // treatmentAccordions();
  // onHomeSectionScroll();

  // Hero intro animation
  const hero = document.querySelector('.home-hero_wrapper')!;
  const heroTitle = hero.querySelector('h1')!;
  const heroSubtitle = hero.querySelector('.home-hero_h1-subtext')!;
  const heroScrollComponent = hero.querySelector('.home-hero_scroll-component')!;
  const heroMedia = hero.querySelector('.home-hero_media')!;
  const animateHero = gsap.timeline({ paused: true });

  const splitText = new SplitType(heroTitle);
  gsap.set(splitText.lines, { overflow: 'hidden' });

  animateHero.fromTo(
    splitText.chars,
    {
      y: '110%',
    },
    {
      y: '0%',
      duration: 0.85,
      stagger: 0.015,
      // delay: 0.01,
      ease: 'power3.out',
    },
    'start'
  );

  animateHero.fromTo(
    heroSubtitle,
    {
      opacity: 0,
    },
    { opacity: 1, duration: 1 },
    'start+=30%'
  );

  animateHero.fromTo(
    heroMedia,
    {
      opacity: 0,
      // opacity: 0.5,
      y: '2rem',
      scale: 0.95,
    },
    {
      // opacity: 1,
      opacity: 1,
      y: '0%',
      scale: 1,
      duration: 1,
    },
    'start+=55%'
  );

  animateHero.fromTo(
    heroScrollComponent,
    {
      opacity: 0,
    },
    { opacity: 1, duration: 1 },
    'start+=95%'
  );

  animateHero.to(
    '.home_nav',
    {
      autoAlpha: 1,
      duration: 1,
    },
    'start+=99%'
  );

  // Remove opacity on parent so we can animate the children
  gsap.set(hero, {
    autoAlpha: 1,
    onComplete: () => {
      animateHero.play();
    },
  });

  // Door — play when in view
  const doorVideo = document.querySelector('video.is-door') as HTMLVideoElement;

  const playDoorVideo = async () => {
    try {
      await doorVideo.play();
      doorPlayButton.style.opacity = '0';
    } catch (err) {
      console.warn(`Video failed to play when door entered view. Falling back to play button...`);
      doorPlayButton.style.opacity = '1';
    }
  };

  const doorPlayButton = document.querySelector(`.door_wrapper .button.is-play`) as HTMLElement;
  doorPlayButton.addEventListener('click', async () => {
    await playDoorVideo();
  });

  // Play with speed
  doorVideo.playbackRate = 1.5;

  gsap.to(doorVideo, {
    scrollTrigger: {
      trigger: '.door_wrapper',
      start: 'top bottom',
      end: 'bottom top',
      onLeave: () => {
        doorVideo.pause();
        doorVideo.currentTime = 0;
      },
      onLeaveBack: () => {
        doorVideo.pause();
        doorVideo.currentTime = 0;
      },
      onEnter: async () => {
        await playDoorVideo();
      },
      onEnterBack: async () => {
        await playDoorVideo();
      },
    },
  });

  // Treatment expandables

  const treatments = Array.from(document.querySelectorAll<HTMLDivElement>('.treatments_col:has(.treatments_wrapper)'));
  const details = Array.from(document.querySelectorAll<HTMLDetailsElement>('.treatments_col details'));
  const initialTreatmentAspectRatios = treatments.map((treatment) => window.getComputedStyle(treatment).aspectRatio);

  // Variables that are impacted by resizing
  let initialTreatmentHeights: number[], initialDetailsHeights: number[];
  function setInitialStates() {
    // Store whether it's already open or not so we can restore it — we can tell by whether height is already auto
    // TBD this doesn't work
    // const openStates = treatments.map((treatment) => treatment.clientHeight === treatment.scrollHeight);

    // Restore aspect ratio and auto height so we can measure the initial height
    treatments.forEach((treatment, i) => {
      treatment.style.boxSizing = 'content-box';
      treatment.style.height = 'auto';
      treatment.style.aspectRatio = initialTreatmentAspectRatios[i];
    });

    initialTreatmentHeights = treatments.map((treatment) => treatment.clientHeight);
    initialDetailsHeights = details.map((details) => details.clientHeight);

    // Set height manually and remove aspect ratio
    treatments.forEach((treatment, i) => {
      treatment.style.boxSizing = 'content-box';
      treatment.style.aspectRatio = 'auto';
      treatment.style.height = `${initialTreatmentHeights[i]}px`;
    });
  }

  let prevWidth = window.innerWidth;
  window.onresize = () => {
    if (window.innerWidth !== prevWidth) {
      setInitialStates();
    }
    prevWidth = window.innerWidth;
  };

  setInitialStates();

  // Initially, prevent pointer events on the sublists
  gsap.set('.treatments_wrapper', { pointerEvents: 'none' });

  treatments.forEach((treatment, i) => {
    const scrim = treatment.querySelector('.treatments_scrim')!;
    const handle = treatment.querySelector('.treatments_handle')!;

    // const initialHeight = treatment.clientHeight;
    // // Set the height manually and remove the aspect ratio
    // treatment.style.boxSizing = 'content-box';
    // treatment.style.height = `${initialHeight}px`;

    // treatment.style.aspectRatio = 'auto';

    // Flirt the handle position and scale when hovering to indicate it's expandable
    treatment.addEventListener('mouseenter', () => {
      gsap.to(handle, {
        scale: 1.1,
        y: '-0.25rem',
        duration: 0.3,
      });
    });

    treatment.addEventListener('mouseleave', () => {
      gsap.to(handle, {
        scale: 1,
        y: '0rem',
        duration: 0.3,
      });
    });

    treatment.addEventListener('click', () => {
      const initialHeight = initialTreatmentHeights[i];
      const isOpening = treatment.clientHeight === initialHeight;

      const duration = isOpening ? 0.6 : 0.4;

      gsap.to(treatment, {
        height: isOpening ? 'auto' : initialHeight,
        duration,
        ease: 'power2.out',
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });

      // Toggle scrim and handle visibility
      gsap.to([scrim, handle], {
        opacity: isOpening ? 0 : 1,
        duration,
      });

      // If opening, enable pointer events halfway through
      // Otherwise, disable them immediately
      gsap.to('.treatments_wrapper', {
        pointerEvents: isOpening ? 'all' : 'none',
        delay: isOpening ? duration / 2 : 0,
      });

      // If opening and none of the child <details> are already open, open the first
      if (isOpening) {
        const details = treatment.querySelector('details')! as HTMLDetailsElement;
        if (!details.open) {
          details.open = true;
        }
      } else {
        // Close all the <details> elements
        treatment.querySelectorAll<HTMLDetailsElement>('details').forEach((details) => {
          details.open = false;
        });
      }
    });
  });

  details.forEach((details, i) => {
    details.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 0);
    });
  });

  // Deckster character animations
  const media = document.querySelector('.home-hero_media') as HTMLElement;
  const video = media.querySelector('video') as HTMLVideoElement;

  const playbackRate = 4;
  video.playbackRate = playbackRate;
  // When you hover the book appointment button, wink
  const contactButton = document.querySelector('.nav_button') as HTMLElement;

  // When you hover, play to 1.47 seconds, the top of the wink
  contactButton.addEventListener('mouseenter', () => {
    video.play();
  });
  // When you leave, rewind to the beginning
  contactButton.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });

  // Patients animation — show the associated cover when the title is hovered
  // Set the initial state of the covers
  gsap.matchMedia().add(breakpointMediaQueries, (context) => {
    const { isDesktop } = context.conditions!;

    if (isDesktop) {
      const deckInitialState = { opacity: 0.2 };
      const coverInitialState = { opacity: 0, scale: 0.98, y: '0.25rem' };

      document.querySelectorAll('img[data-slug]').forEach((cover, i) => {
        if (i !== 0) {
          gsap.set(cover, { ...coverInitialState });
        }
      });

      // Share function between hover and scroll
      const toggleActiveDeck = (slug: string, additionalTweenVars: gsap.TweenVars = {}) => {
        // Reset all other decks

        const inactiveDecks = document.querySelectorAll(`.deck_component[data-slug]:not([data-slug="${slug}"])`);
        const inactiveCovers = document.querySelectorAll(`img[data-slug]:not([data-slug="${slug}"])`);

        gsap.to(inactiveDecks, { ...deckInitialState, duration: 0.3 });
        gsap.to(inactiveCovers, { ...coverInitialState, duration: 0.3 });

        const activeDeck = document.querySelector(`.deck_component[data-slug="${slug}"]`)!;
        const activeCover = document.querySelector(`img[data-slug="${slug}"]`)!;

        // Show the active cover and set full opacity to its title
        gsap.to(activeDeck, { duration: 0.3, opacity: 1, ...additionalTweenVars });
        gsap.to(activeCover, { duration: 0.3, opacity: 1, scale: 1, y: '0rem', ...additionalTweenVars });
      };

      // Set the first deck as active
      toggleActiveDeck(document.querySelector('.deck_component')!.getAttribute('data-slug')!);

      // Translate deck titles to the left while scrolling in view
      const translateDeckTitles = gsap.timeline({
        scrollTrigger: {
          trigger: '.decks_titles',
          start: 'top bottom',
          // Todo — decide when we want this to stop so you can see the full list of projects
          end: 'bottom top+=25%',
          scrub: 1,
          // As this progresses, show the corresponding deck (but allow it to be overwritten by the deck hover animation)
          onUpdate: () => setActiveDeckBasedOnProgress(),
        },
      });

      translateDeckTitles.to('.decks_titles-layout', {
        x: () => {
          const availableWidth = document.querySelector('.decks_titles')!.clientWidth;
          const totalWidth = document.querySelector('.decks_titles')!.scrollWidth;
          const leftPadding = parseFloat(
            window.getComputedStyle(document.querySelector('.decks_titles-layout')!).paddingLeft
          );
          // console.log(`availableWidth: ${availableWidth}, totalWidth: ${totalWidth}, leftPadding: ${leftPadding}`);
          return -(totalWidth - availableWidth + leftPadding);
        },
        ease: 'power1.inOut',
      });

      const setActiveDeckBasedOnProgress = () => {
        // Todo — not sure why after resizing, scrollTrigger is undefined (it still works, it's like referencing an old one as well. It multiplies as many times as you toggle window sizes
        const progress = translateDeckTitles.scrollTrigger!.progress;
        const decks = document.querySelectorAll('.deck_component');
        const activeDeck = decks[Math.floor(gsap.utils.mapRange(0, 1, 0, decks.length - 1, progress))];
        const slug = activeDeck.getAttribute('data-slug')!;
        toggleActiveDeck(slug);
      };

      const deckComponents = document.querySelectorAll('.deck_component');
      const arrowInitialState = { autoAlpha: 0, y: '0.125rem', x: '-0.125rem' };

      deckComponents.forEach((deck) => {
        // Use slug to match titles to their corresponding covers
        const slug = deck.getAttribute('data-slug')!;
        const cover = document.querySelector(`img[data-slug="${slug}"]`)!;
        const arrow = deck!.querySelector('.deck_arrow')!;

        let timeout: number;

        const coverWrapper = cover.parentElement!;
        const slides = document
          .querySelector(`.track_slides[data-slug="${slug}"]`)!
          .querySelectorAll('.track_cover-image');

        const slideTransitionDuration = 0.2;
        const slideDuration = 1;

        // Set any initial states
        gsap.set(arrow, { ...arrowInitialState });

        const playSlides = gsap.timeline({
          repeat: -1,
          paused: true,
        });

        if (slides.length > 0) {
          // Fade-out the cover, using the wrapper to avoid conflicts
          playSlides.to(
            coverWrapper,
            { autoAlpha: 0, duration: slideTransitionDuration, ease: 'linear' },
            `>${slideDuration}`
          );
          // Cycle through the slides. cross-fade
          slides.forEach((slide) => {
            // Fade in
            playSlides.to(slide, { autoAlpha: 1, duration: slideTransitionDuration, ease: 'linear' }, '<');
            // Fade out
            playSlides.to(
              slide,
              { autoAlpha: 0, duration: slideTransitionDuration, ease: 'linear' },
              `>${slideDuration}`
            );
          });

          playSlides.to(coverWrapper, { autoAlpha: 1, duration: slideTransitionDuration, ease: 'linear' }, '<');
        }

        // slides.forEach((slide, index) => {
        //   playSlides.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "none", repeat: 1, yoyo: true, repeatDelay: cycleDuration }, "-=" + 0.8)
        // })

        context.add(
          'mouseEnter',
          () => {
            // Show the active cover
            toggleActiveDeck(slug);
            // Show the arrow indicating external link
            gsap.to(arrow, { autoAlpha: 1, y: 0, x: 0, duration: 0.3 });
            // Once they've hovered for more than 500ms, if there are other slides, cycle through them
            if (slides.length > 0) {
              timeout = window.setTimeout(() => {
                playSlides.play();
              }, slideDuration);
            }
          },
          deck
        );

        deck.addEventListener('mouseenter', context.mouseEnter);

        context.add(
          'mouseLeave',
          () => {
            // Stop the cycling
            clearTimeout(timeout);
            playSlides.pause();
            playSlides.progress(0);
            // Hide the arrow
            gsap.to(arrow, { ...arrowInitialState, duration: 0.2, overwrite: true });
            // Reset the cover
            gsap.to(cover, { ...coverInitialState, duration: 0.1 });

            setActiveDeckBasedOnProgress();
          },
          deck
        );

        deck.addEventListener('mouseleave', context.mouseLeave);
      });

      return () => {
        deckComponents.forEach((deck, i) => {
          deck.removeEventListener('mouseenter', context.mouseEnter);
          deck.removeEventListener('mouseleave', context.mouseLeave);
        });
      };
    } else {
      // Manually restore all decks to full opacity, normal scale and y position
      // I didn't think we should have to do this, it should reset all tweens when the media query changes
      // Might have to do with all the { overwrite: true } we're doing
      gsap.set('.deck_component', { opacity: 1, overwrite: true });
      gsap.set('img[data-slug]', { opacity: 1, scale: 1, y: '0rem', overwrite: true });
    }
  });

  // NOTES — Parallax and rotation while scrolling in view

  gsap.matchMedia().add(breakpointMediaQueries, (context) => {
    const { isDesktop } = context.conditions!;

    if (isDesktop) {
      document.querySelectorAll('.notes_row').forEach((row) => {
        const notes = row.querySelectorAll('.notes_item');
        notes.forEach((note, i) => {
          // As notes scroll into view, animate them from this randomized position to their normal position
          const notesTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: note,
              start: 'top bottom',
              end: 'top 33%',
              scrub: gsap.utils.random(0.5, 1.5),
              markers: window.IS_DEBUG_MODE,
            },
          });

          // const rotate = [gsap.utils.random(-12, -5), gsap.utils.random(5, 12)][];
          // Notes on the left should start with a negative rotation, notes on the right should start with a positive rotation
          // If there are three notes, the middle one can be randomized left or right
          let rotate = 0;
          if (i === 0) {
            rotate = gsap.utils.random(5, 12);
          } else if (i === notes.length - 1) {
            rotate = gsap.utils.random(-12, -5);
          } else {
            rotate = gsap.utils.random(-12, 12);
          }

          notesTimeline.fromTo(
            note,
            {
              y: `${gsap.utils.random(-3, -1)}rem`,
              rotate: `${rotate}deg`,
            },
            {
              y: `${gsap.utils.random(-10, -2.5)}rem`,
              rotate: `${(rotate / 4) * -1}deg`,
            }
          );
        });
      });
    } else {
      // On tablet and below, the notes are a single vertical column
      // The notes stack on top of eachother as you scroll, but have to ensure that there's enough room to show the bottom one

      // This timeline simply pins the note to the top of the screen for the duration of the section
      const notes = Array.from(document.querySelectorAll('.notes_item')).filter((note) => note.clientHeight > 0);

      const noteWithMaxHeight = Array.from(notes).reduce((prev, current) => {
        return prev.clientHeight > current.clientHeight ? prev : current;
      }, notes[0]);

      const noteWithMaxHeightIndex = Array.from(notes).findIndex((note) => note === noteWithMaxHeight);
      const noteWithMaxHeightOffset = noteWithMaxHeightIndex * 4;
      const totalHeightOfMaxNote = noteWithMaxHeight.clientHeight + noteWithMaxHeightOffset;
      const topForMaxNote = (window.innerHeight - totalHeightOfMaxNote) / 2;

      notes.forEach((note, index) => {
        // Animate the inner note so it doesn't conflict with the pin
        const noteComponent = note.querySelector('.note_component')!;

        // Rotation
        const notesTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: noteComponent,
            start: 'top bottom',
            end: `top top`,
            // pin: true,
            markers: window.IS_DEBUG_MODE,
            scrub: 1,
          },
        });

        // Every other — slightly left with a positive rotation to negative, slightly right with a negative rotation to positive
        const rotate = index % 2 === 0 ? gsap.utils.random(5, 12) : gsap.utils.random(-12, -5);
        const x = index % 2 === 0 ? gsap.utils.random(-2, -1) : gsap.utils.random(1, 2);

        notesTimeline.fromTo(
          noteComponent,
          {
            rotate: `${rotate}deg`,
            x: `${x}rem`,
          },
          {
            rotate: `${(rotate / 4) * -1}deg`,
            x: `${x / 2}rem`,
          }
        );

        // Pin notes at top
        gsap.timeline({
          scrollTrigger: {
            trigger: note,
            // endTrigger: '.notes_layout',
            // Stop at the last note
            endTrigger: notes[notes.length - 1],
            // Todo don't hardcode nav cta height
            start: `top top+=${topForMaxNote + index * 4}`,
            // end: 'bottom bottom-=25%',
            // end: `top top+=${16 + index - 1 * 4}`,
            pin: true,
            markers: window.IS_DEBUG_MODE,
          },
        });
      });
    }
  });

  // Flip the badge across the z-axis when it scrolls into view
  const badge = document.querySelector('.notes_badge')!;
  gsap.fromTo(
    badge,
    {
      rotateY: 0,
      y: '0.5rem',
    },
    {
      rotateY: 180 * 3,
      y: '0rem',
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: badge,
        start: 'top bottom',
        markers: window.IS_DEBUG_MODE,
        // Repeat everytime it scrolls into view
        toggleActions: 'restart none none none',
      },
    }
  );

  // Use a similar split text animation on this section title but different toggleActions because of the stickiness
  document.querySelectorAll('.section_notes h2').forEach((el, index) => {
    const splitText = new SplitType(el);
    gsap.set(splitText.lines, { overflow: 'hidden' });
    gsap.fromTo(
      splitText.chars,
      {
        y: '100%',
      },
      {
        y: '0%',
        duration: 0.8,
        stagger: 0.01,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.section_notes',
          start: 'top bottom-=10%',
          // Repeat the animation if the section is scrolled out of view and back in
          toggleActions: 'play reset play reset',
        },
      }
    );
  });
});
