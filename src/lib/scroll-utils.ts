// Scroll utilities for consistent scroll-to-top behavior

const getScroller = () => {
  // Debug logging to identify the real scroll container
  console.log('=== SCROLL DEBUG ===');
  console.log('window.scrollY:', window.scrollY);
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && 
        el instanceof HTMLElement && 
        el.scrollHeight > el.clientHeight) {
      console.log('FOUND SCROLLER:', el, 'scrollTop=', (el as HTMLElement).scrollTop);
    }
  });
  
  // Priority order for scroll container detection
  const scroller = 
    (document.querySelector('[data-scroll-container="true"]') as HTMLElement) ||
    (document.querySelector('main') as HTMLElement) ||
    (document.querySelector('#root') as HTMLElement) ||
    document.documentElement;
    
  console.log('SELECTED SCROLLER:', scroller, 'scrollTop=', scroller.scrollTop);
  return scroller;
};

export const scrollToTop = () => {
  console.log('scrollToTop called');
  
  // First try window scroll (most reliable)
  const currentWindowScroll = window.scrollY || window.pageYOffset;
  console.log('Current window scroll:', currentWindowScroll);
  
  if (currentWindowScroll > 0) {
    // Primary: Use window.scrollTo
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    console.log('Scrolled window to top');
    return;
  }
  
  // Fallback: Try common scroll containers
  const scroller = 
    (document.querySelector('[data-scroll-container="true"]') as HTMLElement) ||
    (document.querySelector('main') as HTMLElement) ||
    (document.querySelector('#root') as HTMLElement);
    
  if (scroller && scroller.scrollTop > 0) {
    console.log('Scrolling container to top:', scroller);
    scroller.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    scroller.scrollTop = 0;
    return;
  }
  
  console.log('Already at top, nothing to scroll');
};