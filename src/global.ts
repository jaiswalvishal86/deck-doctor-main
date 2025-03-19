import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';

import { initButtonAnimations } from './components/buttons';
import { initMenus } from './components/menu';
import { initSectionBackgrounds } from './components/section-backgrounds';
import { breakpointMediaQueries } from './utils';

gsap.registerPlugin(DrawSVGPlugin);
gsap.registerPlugin(SplitText);

window.Webflow?.push(() => {

  // Other page intro animations
  // Hero intro animation
  const introHero = document.querySelector('[data-animate-intro]') as HTMLElement;
  if (introHero) {
    const title = introHero.querySelector('h1');
    const subtitle = introHero.querySelector('[data-intro-subtitle]');
    const media = introHero.querySelector('[data-intro-media]');
    const animateHero = gsap.timeline({ paused: true });

    const splitText = new SplitText(title);
    gsap.set(splitText.lines, { overflow: 'hidden' });

    animateHero.fromTo(splitText.chars, {
      y: '110%',
    }, {
      y: '0%',
      duration: 0.85,
      stagger: 0.015,
      // delay: 0.01,
      ease: 'power3.out',
    }, "start");

    animateHero.fromTo(title, {
      opacity: 0,
    }, { opacity: 1, duration: 1 }, "start+=30%");

    animateHero.fromTo(subtitle, {
      opacity: 0,
    }, { opacity: 1, duration: 1 }, "start+=30%");


    animateHero.fromTo(media, {
      autoAlpha: 0,
      y: '2rem',
      scale: 0.95
    }, {
      autoAlpha: 1,
      y: '0%',
      scale: 1,
      duration: 1,
    }, "start+=55%");

    // Remove opacity on parent so we can animate the children
    gsap.set(introHero, {
      autoAlpha: 1, onComplete: () => {
        animateHero.play();
      }
    });

  }





  initButtonAnimations();
  initMenus();
  initSectionBackgrounds();


  // Split text animation on anything tagged data-animate-text
  document.querySelectorAll('[data-animate-text]').forEach((el) => {
    const splitText = new SplitText(el);
    gsap.set(splitText.lines, { overflow: 'hidden' });
    gsap.fromTo(
      splitText.chars,
      {
        y: '100%',
      },
      {
        y: '0%',
        duration: 0.6,
        stagger: 0.01,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom-=10%',
          // Only play once
          toggleActions: 'play none none none',
        },
        onStart: () => {
          gsap.set(el, { autoAlpha: 1 });
        }
      }
    );
  });


  // Internal links — fade out contents of every section, then navigate to the new page
  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      gsap.to(['.main-wrapper section > *', '.footer_wrapper > *'], {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          window.location.href = href!;
        },
      });
    });
  });

  // Additional menu animations
  // Todo — maybe move these to menu.ts

  // Show live time (down to the second) in the vitals menu text
  const timeText = document.querySelector('[data-current-time]') as HTMLElement;
  const updateTime = () => {
    timeText.textContent = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  updateTime();
  setInterval(updateTime, 1000);

  // Increment the numbers in the vitals menu using gsap snap
  const vitalsNumbers = document.querySelectorAll('.nav_act-num') as NodeListOf<HTMLElement>;
  // Set them to 0, store the target value, animate to it when vitals menu is opened
  vitalsNumbers.forEach((num) => {
    num.dataset.target = num.innerText;
    num.textContent = `${Math.floor(parseInt(num.innerText) * 0.92)}`;
  });

  let isVitalsMenuOpen = false;
  const vitalsMenuTrigger = document.querySelector('.nav_activity-btn') as HTMLElement;

  // Instead of linking this to the click, let's use a MutationObserver to watch the display property of the vitals menu
  // This way, it doesn't matter how the menu is opened or closed (click, overlay, escape key, etc.)
  const vitalsMenu = document.querySelector('.nav_activity-wrapper') as HTMLElement;
  let previousVitalsMenuDisplay = vitalsMenu.style.display;
  const vitalsMenuObserver = new MutationObserver(() => {
    if (vitalsMenu.style.display !== previousVitalsMenuDisplay) {
      if (vitalsMenu.style.display === 'none') {
        vitalsNumbers.forEach((num) => {
          num.textContent = `${Math.floor(parseInt(num.dataset.target!) * 0.92)}`;
        });
      } else {
        vitalsNumbers.forEach((num, i) => {
          gsap.to(num, {
            innerText: num.dataset.target,
            snap: { innerText: 1 },
            duration: 0.6 + i * 0.08,
            ease: 'power2.out',
            delay: 0.15 + 0.05 * i,
          });
        });
      }
    }
    previousVitalsMenuDisplay = vitalsMenu.style.display;
  });
  vitalsMenuObserver.observe(vitalsMenu, { attributes: true, attributeFilter: ['style'] });

  // Deckster character animations
  // Assume all external videos are deckster heads and add the bob and click-to-play behavior

  const bobEffect: gsap.TweenVars = {
    y: '0.25rem',
    repeat: -1,
    yoyo: true,
    duration: 1,
    ease: 'power1.inOut',
  };

  gsap.to('[data-animate-bob]', {
    ...bobEffect,
  });

  document.querySelectorAll<HTMLVideoElement>('.external-video_component:not(.is-door)').forEach((video) => {
    // Bob up and down
    gsap.to(video, {
      ...bobEffect,
    });

    // Play on click
    video.addEventListener('click', () => {
      video.play();
    });
  });

  gsap.matchMedia().add(breakpointMediaQueries, (context) => {
    const { isDesktop, isTablet } = context.conditions!;

    if (isDesktop || isTablet) {
      // Nav — when you scroll down, hide the nav by translating it up
      // When you scroll up, show the nav by translating it down
      const navbar = document.querySelector('.nav_wrapper') as HTMLElement;
      const navHeight = document.querySelector('nav')!.clientHeight;
      let hasMounted = false;
      ScrollTrigger.create({
        onUpdate: (self: ScrollTrigger & { prevDirection?: number }) => {
          // This avoids hiding the nav when the page first loads
          if (hasMounted) {
            if (self.prevDirection !== self.direction) {
              if (self.direction === -1) {
                gsap.to(navbar, { y: 0, ease: 'power2.out', duration: 0.28 });
              } else {
                gsap.to(navbar, { y: -1 * navHeight - 2, duration: 0.28, ease: 'power2.out' });
              }
            }
            self.prevDirection = self.direction;
          }
          hasMounted = true;
        },
      });
    }
  });

  // Scroll snap slider arrow navs
  // TODO — I think this will break if window is resized
  document.querySelectorAll('.slider-nav').forEach((sliderNav) => {
    // @ts-expect-error it's fine if we querySelect null
    const scrollContainer = document.querySelector(sliderNav.getAttribute('data-nav-for'));
    if (scrollContainer) {
      // Assume first child is standard width item
      const itemWidth = scrollContainer.firstElementChild!.clientWidth;
      const itemGap = getComputedStyle(scrollContainer).gap;
      const handleNavClick = (direction: 'left' | 'right') => {
        const scrollLeft = Math.floor(scrollContainer.scrollLeft);
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

        const scrollAmount = itemWidth + parseInt(itemGap);

        if (direction === 'left') {
          scrollContainer.scrollTo({
            left: Math.max(scrollLeft - scrollAmount, 0),
            behavior: 'smooth',
          });
        } else {
          scrollContainer.scrollTo({
            left: Math.min(scrollLeft + scrollAmount, maxScrollLeft),
            behavior: 'smooth',
          });
        }
      };

      const prevArrow = sliderNav.querySelector('.slider-btn.is--prev')!;
      const nextArrow = sliderNav.querySelector('.slider-btn.is--next')!;
      prevArrow.addEventListener('click', () => handleNavClick('left'));
      nextArrow.addEventListener('click', () => handleNavClick('right'));
    }
  });

  // const handleNavClick = (direction: "left" | "right") => {
  //   const container = scrollContainerRef.current!;
  //   const scrollLeft = Math.floor(container.scrollLeft);
  //   const maxScrollLeft = container.scrollWidth - container.clientWidth;

  //   const scrollAmount = itemWidth! + 20;

  //   if (direction === "left") {
  //     container.scrollTo({
  //       left: Math.max(scrollLeft - scrollAmount, 0),
  //       behavior: "smooth",
  //     });
  //   } else {
  //     container.scrollTo({
  //       left: Math.min(scrollLeft + scrollAmount, maxScrollLeft),
  //       behavior: "smooth",
  //     });
  //   }
  // };
});
