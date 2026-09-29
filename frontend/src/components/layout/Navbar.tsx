import { Menu, X } from 'lucide-react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, type Variants } from 'motion/react'
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
} from 'react'
import { useAppReady } from '../../context/AppReady'
import { sections, site, footer } from '../../data/content'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { DUR, NAV_SPRING, tween } from '../../lib/motion'
import { scrollToSection } from '../../lib/scrollTo'
import { Logo } from '../brand/Logo'
import { Button } from '../ui/Button'
import { Magnetic } from '../ui/Magnetic'
import { MobileMenu } from './MobileMenu'
import { layoutCopy } from './layoutCopy'
import './Navbar.css'

// 'top' first so no link is active while the hero is in view.
const SPY_IDS: readonly string[] = ['top', ...sections.map((s) => s.id)]
// Two thresholds so the height transition does not restart while a trackpad hovers around one value.
const COMPACT_AFTER = 24
const COMPACT_RELEASE = 8
// Set in px through `style` because motion only scale-corrects numeric radii during a layout animation.
const PILL_RADIUS = 18
// An inset shadow instead of a border, which would thicken while the pill stretches.
const PILL_OUTLINE = 'inset 0 0 0 1px var(--primary-display)'

// The preloader uncovers the top of the page last, so the bar waits for it.
const ENTER_DELAY = 0.7
const BAR_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: tween(DUR.slow, ENTER_DELAY) },
}

const PROGRESS_SPRING = { stiffness: 140, damping: 26, restDelta: 0.001 }

// Hide-on-scroll below 900px, in px.
const AWAY_AFTER = 160
const AWAY_TRAVEL = 32
const RETURN_TRAVEL = 10

const isScrolledPastCompact = () => typeof window !== 'undefined' && window.scrollY > COMPACT_AFTER

function goTo(e: MouseEvent<HTMLAnchorElement>, id: string) {
  if (!document.getElementById(id)) return
  e.preventDefault()
  scrollToSection(id)
}

const wordmarkWords = site.wordmark.split(' ')
const wordmarkHead = wordmarkWords.slice(0, -1).join(' ')
const wordmarkTail = wordmarkWords[wordmarkWords.length - 1]

export function Navbar() {
  const reduced = useReducedMotion() ?? false
  const ready = useAppReady()
  const active = useScrollSpy(SPY_IDS)
  const isWide = useMediaQuery('(min-width: 900px)')
  const { scrollY, scrollYProgress } = useScroll()
  const sprung = useSpring(scrollYProgress, PROGRESS_SPRING)
  const progress = reduced ? scrollYProgress : sprung

  // Seeded from the restored scroll position after a reload or hash link.
  const [compact, setCompact] = useState(isScrolledPastCompact)

  // `turn` is where the current scroll direction began.
  const [away, setAway] = useState(false)
  const lastY = useRef(0)
  const turn = useRef(0)
  const heading = useRef<1 | -1>(1)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setCompact((prev) => (prev ? y > COMPACT_RELEASE : y > COMPACT_AFTER))

    const prev = lastY.current
    lastY.current = y
    if (y === prev) return
    const dir = y > prev ? 1 : -1
    if (dir !== heading.current) {
      heading.current = dir
      turn.current = prev
    }
    if (y < AWAY_AFTER) setAway(false)
    else if (dir === 1 && y - turn.current > AWAY_TRAVEL) setAway(true)
    else if (dir === -1 && turn.current - y > RETURN_TRAVEL) setAway(false)
  })

  // Only keyboard focus keeps the bar in view; a tap or focus returned from the sheet should not.
  const [focusInside, setFocusInside] = useState(false)
  const onBarFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target.matches(':focus-visible')) setFocusInside(true)
  }
  const onBarBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocusInside(false)
  }

  // The pill follows section state and keyboard focus, not pointer movement.
  const [focused, setFocused] = useState<string | null>(null)
  const pillId = focused ?? (active !== 'top' ? active : null)

  const [open, setOpen] = useState(false)
  const [scrollbar, setScrollbar] = useState(0)
  const close = useCallback(() => setOpen(false), [])
  const toggle = () => {
    // Measure before the body lock hides the scrollbar so the bar does not shift.
    setScrollbar(Math.max(0, window.innerWidth - document.documentElement.clientWidth))
    setOpen((o) => !o)
  }
  // Close the sheet when the viewport grows past the breakpoint.
  const [prevWide, setPrevWide] = useState(isWide)
  if (prevWide !== isWide) {
    setPrevWide(isWide)
    if (isWide && open) setOpen(false)
  }

  const isAway = away && !isWide && !open && !focusInside && !reduced

  const style = open ? ({ '--nav-sb': `${scrollbar}px` } as CSSProperties) : undefined
  const inertWhileOpen = open || undefined

  return (
    <>
      {/*
       * `layoutScroll` makes motion measure the pill in viewport space, so it does not jump when the
       * scroll spy moves it mid-scroll. Hide-on-scroll uses CSS `translate` so it does not fight the
       * entrance transform.
       */}
      <motion.header
        className="nav"
        data-compact={compact ? '' : undefined}
        data-open={open ? '' : undefined}
        data-away={isAway ? '' : undefined}
        style={style}
        layoutScroll
        variants={BAR_VARIANTS}
        initial={reduced ? false : 'hidden'}
        animate={reduced || ready ? 'show' : 'hidden'}
        onFocus={onBarFocus}
        onBlur={onBarBlur}
      >
        <div className="container nav__inner">
          <a href="#top" className="nav__brand" onClick={(e) => goTo(e, 'top')} inert={inertWhileOpen}>
            <Logo size={22} title="" className="nav__logo" />
            <span className="nav__wordmark">
              {wordmarkHead}
              <span className="nav__wordmark-tail"> {wordmarkTail}</span>
            </span>
          </a>

          <nav aria-label={footer.sectionsLabel} className="nav__links">
            <ul className="nav__list">
              {sections.map((s) => {
                const isActive = active === s.id
                return (
                  <li key={s.id} className="nav__item">
                    {pillId === s.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="nav__pill"
                        aria-hidden="true"
                        style={{ borderRadius: PILL_RADIUS, boxShadow: PILL_OUTLINE }}
                        transition={reduced ? { duration: 0 } : NAV_SPRING}
                      />
                    )}
                    <a
                      href={`#${s.id}`}
                      className="nav__link"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={(e) => goTo(e, s.id)}
                      onFocus={(e) => {
                        if (e.currentTarget.matches(':focus-visible')) setFocused(s.id)
                      }}
                      onBlur={() => setFocused((f) => (f === s.id ? null : f))}
                    >
                      <span className="nav__num">{s.index}</span>
                      <span className="nav__label">{s.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="nav__actions">
            {/* Hidden below 480px; Magnetic sets an inline display, so the wrapper is hidden instead. */}
            <span className="nav__cta-slot">
              <Magnetic strength={0.2} className="nav__cta-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  href="#join"
                  className="nav__cta"
                  onClick={(e) => goTo(e, 'join')}
                  inert={inertWhileOpen}
                >
                  {layoutCopy.joinShort}
                </Button>
              </Magnetic>
            </span>
            {/* Not inert while the sheet is open so focus can return to it on close. */}
            <Button
              variant="icon"
              className="nav__menu"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? layoutCopy.closeMenu : layoutCopy.openMenu}
              onClick={toggle}
              iconStart={
                <span className="nav__menu-icon" aria-hidden="true">
                  <Menu size={20} strokeWidth={1.75} className="nav__menu-glyph nav__menu-glyph--menu" />
                  <X size={20} strokeWidth={1.75} className="nav__menu-glyph nav__menu-glyph--close" />
                </span>
              }
            />
          </div>
        </div>

        <span className="nav__track" aria-hidden="true">
          <motion.span className="nav__progress" style={{ scaleX: progress }} />
        </span>
      </motion.header>

      <MobileMenu open={open} onClose={close} activeId={active} compact={compact} scrollbarWidth={scrollbar} />
    </>
  )
}
