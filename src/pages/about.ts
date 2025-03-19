
// gsap.registerPlugin(GSDevTools);
// GSDevTools.create();

window.Webflow?.push(() => {

  // Deckster character animations

  // Wen you start scrolling, play the video (which spins the character)
  const stickyWrapper = document.querySelector('.about-hero_sticky')!;
  const top = getComputedStyle(stickyWrapper).top;
  const video = stickyWrapper.querySelector('video')! as HTMLVideoElement;
  video.playbackRate = 1.25;

  gsap.timeline({
    scrollTrigger: {
      // Trigger based on the sibling of the sticky element
      trigger: '.about-hero_heading',
      start: `top top+=${top}`,
      // markers: true,
      onEnter: () => {
        video.play();
      },
      onEnterBack: () => {

        video.play();
      },
      onLeave: () => {
        video.currentTime = 0;
      },
    }
  });

  // Spin the expertise image as it scrolls in view
  const expertise = document.querySelector('.expertise_wrapper img')!;
  gsap.fromTo(expertise, { scale: 0.8 }, { scale: 1, opacity: 1, scrollTrigger: { trigger: '.expertise_wrapper', start: 'top bottom', toggleActions: 'play reverse play reverse' } });
  gsap.fromTo(expertise, { rotate: 0 }, { rotate: 241, ease: 'linear', scrollTrigger: { trigger: '.expertise_wrapper', start: 'bottom bottom', end: 'center top+=33%', scrub: 2, } });
  gsap.to('.expertise_wrapper', {
    scrollTrigger: {
      start: 'top bottom',
      pin: true
    }
  });

  // The docs 3D carousel component
  // TODO — not sure this is going to work, the layout requires like 12+ items and we don't have that many

  // const carouselWrapper = document.querySelector('.carousel_wrapper')!;
  // const carouselList = document.querySelector('.carousel_list')!;
  // const items = document.querySelectorAll('.carousel_item');
  // const itemWidth = getComputedStyle(items[0]).width;
  // // Gap should make it so that there's about 3.5 items visible at a time
  // const itemGap = '20vw';

  // console.log(`itemWidth: ${itemWidth}, itemGap: ${itemGap}`);

  // let rotateAmount = 360 / items.length;
  // let zTranslate = 2 * Math.tan((rotateAmount / 2) * (Math.PI / 180));
  // let negTranslate = `calc(${itemWidth} / -${zTranslate} - ${itemGap})`;
  // let posTranslate = `calc(${itemWidth} / ${zTranslate} + ${itemGap})`;

  // // Set wrapper perspective and initial variables
  // gsap.set(carouselWrapper, { perspective: posTranslate });
  // // Set list transform
  // gsap.set(carouselList, { transformStyle: 'preserve-3d', transform: `translate3d(0, 0, ${negTranslate}) rotateY(5deg)` });

  // // Set initial item positions
  // items.forEach((item, index) => {
  //   // gsap.set(item, { translateZ: `${zTranslate}rem`, rotateY: `${rotateAmount * index}deg` });
  //   gsap.set(item, { transform: `rotateY(${rotateAmount * index}deg) translate3d(0, 0, ${posTranslate})` });
  // });

  // Person cards hover and flip
  const docs = document.querySelector('.docs_component')!;
  const docsScrollContainer = docs.querySelector('.docs_list')!;

  // Prevent pointer events on the card while scrolling
  let timeout: number;
  docsScrollContainer.addEventListener('scroll', () => {
    clearTimeout(timeout);
    docs.style.pointerEvents = 'none';
    timeout = setTimeout(() => {
      docs.style.pointerEvents = 'all';
    }, 50);
  });

  const flipButtonInitialState: gsap.TweenVars = {
    opacity: 0,
    scale: 0.2,
    y: '0.25rem',
    rotate: '45deg',
  };

  docs.querySelectorAll('.doc_component').forEach((card, index) => {
    const layout = card.querySelector('.doc_layout')!;

    const front = card.querySelector('.doc_front')!;
    const back = card.querySelector('.doc_back')!;
    const flipButtons = card.querySelectorAll('.doc_flip');

    // While scrolling the list, disable pointer events on the card

    // When you hover in or out, show both flip buttons
    // Wait to show it for 150ms
    let timeout: number;
    gsap.set(flipButtons, { ...flipButtonInitialState });
    card.addEventListener('mouseenter', () => {
      timeout = setTimeout(() => { gsap.to(flipButtons, { duration: 0.3, opacity: 1, scale: 1, y: '0rem', rotate: '0deg' }) }, 0);
    });
    card.addEventListener('mouseleave', () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      gsap.to(flipButtons, { duration: 0.1, ...flipButtonInitialState, overwrite: true });
    });

    card.addEventListener('mousedown', (e: MouseEvent) => {
      // Calculating the tilt based on mouse position within the card
      const rect = card.getBoundingClientRect();
      // A value between -1 and 1 representing which side of the card the mouse is on
      const xStrength = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const yStrength = -1 * ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));

      // Visually, rotateX is actually tilting "vertically" (up and down), and rotateY is tilting "horizontally" (left and right)
      let rotateY = -10 * xStrength;
      const rotateZ = gsap.utils.mapRange(-1, 1, -2, 2, xStrength);

      // Now, use the current rotateY to apply the tilt so we don't jump whether we're flipped or not
      rotateY = card.getAttribute('data-is-flipped') === 'true' ? 180 + rotateY : rotateY;

      // gsap.to(card, { scale: 0.98, });
      gsap.to(layout, {
        rotateY, scale: 0.99, rotateZ, duration: 0.2
      })
    })

    card.addEventListener('mouseup', () => {
      // gsap.to(card, { scale: 1, duration: 0.2, delay: 0.2 });
      // We don't need to reset rotateY here, that's handled in the click event
      const rotateY = card.getAttribute('data-is-flipped') === 'true' ? 180 : 0;
      gsap.to(layout, {
        scale: 1, duration: 0.2, rotateZ: 0, delay: 0.2
      });
      // card.setAttribute('data-is-flipped', rotateY === 180 ? 'true' : 'false');
    })




    // When you click the layout, flip the card
    gsap.set(layout, {
      transformStyle: 'preserve-3d',
    });

    card.addEventListener('click', (e: MouseEvent) => {
      const isFlipped = card.getAttribute('data-is-flipped') === 'true';

      // const sharedVars: gsap.TweenVars = {
      //   onStart: () => {
      //     card.style.pointerEvents = 'none';
      //   },
      //   onComplete: () => {
      //     card.style.pointerEvents = 'auto';
      //   }
      // }

      if (isFlipped) {
        gsap.to(layout, {
          duration: 0.9,
          rotateY: 0,
          ease: 'power2.out',
          // ...sharedVars
          onStart: () => {
            card.setAttribute('data-is-flipped', 'false');
          }
        });

      } else {
        gsap.to(layout, {
          duration: 0.9,
          rotateY: 180,
          ease: 'power2.out',
          onStart: () => {
            card.setAttribute('data-is-flipped', 'true');
          }
        });

      }

      // Hide the flip button until they hover again
      gsap.to(flipButtons, { duration: 0.2, ...flipButtonInitialState });
    });
  });
});
