import { X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import { footer, hero, join, sections, site } from '../../data/content'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useEventState } from '../../hooks/useEventState'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { formatIstDay, formatIstMonth, formatIstTime } from '../../lib/dates'
import { DUR, EASE_IN_OUT, tween } from '../../lib/motion'
import { scrollToSection } from '../../lib/scrollTo'
import { Button } from '../ui/Button'
import { HorizonArc } from '../ui/HorizonArc'
import { layoutCopy } from './layoutCopy'
import './MobileMenu.css'

export type MobileMenuProps = {
  open: boolean
  onClose: () => void
  activeId?: string
  /** Mirrors the bar's compact state so the close button sits exactly on the trigger. */
  compact?: boolean
  /** Measured before the body lock so the close button does not shift. */
  scrollbarWidth?: number
}

const CLIP_CLOSED = 'inset(0 0 100% 0)'
const CLIP_OPEN = 'inset(0 0 0% 0)'
const TZ_SUFFIX = 'IST'

// Timings in seconds.
const WIPE = 0.36
const FIRST_LABEL = 0.14
const LABEL_STEP = 0.04
const LABEL_RISE = 0.6
const ROWS_AT = FIRST_LABEL + sections.length * LABEL_STEP + 0.1
const ROW_STEP = 0.05
const PLATE_AT = ROWS_AT + 3 * ROW_STEP

// Only the panel and the close glyph define `exit`; the text stays put while the panel wipes over it.
const PANEL: Variants = {
  closed: { clipPath: CLIP_CLOSED },
  open: { clipPath: CLIP_OPEN, transition: tween(WIPE, 0, EASE_IN_OUT) },
  exit: { clipPath: CLIP_CLOSED, transition: tween(DUR.med, 0, EASE_IN_OUT) },
}
const PANEL_STILL: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
}
const GLYPH: Variants = {
  closed: { opacity: 0, rotate: -45 },
  open: { opacity: 1, rotate: 0, transition: tween(DUR.fast, 0.04) },
  exit: { opacity: 0, rotate: -45, transition: tween(DUR.fast) },
}
// `custom` is the delay in seconds.
const RISE: Variants = {
  closed: { y: '108%' },
  open: (delay: number) => ({ y: '0%', transition: tween(LABEL_RISE, delay) }),
}
const FADE: Variants = {
  closed: { opacity: 0 },
  open: (delay: number) => ({ opacity: 1, transition: tween(DUR.slow, delay) }),
}
const STILL: Variants = { closed: {}, open: {} }

// Navbar owns the open state and the trigger; the focus trap returns focus to the trigger on close.
export function MobileMenu({ open, onClose, activeId, compact = false, scrollbarWidth = 0 }: MobileMenuProps) {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const featured = useEventState()

  useBodyScrollLock(open)
  useFocusTrap(ref, open, onClose)

  // Navbar makes its own brand and CTA inert.
  useEffect(() => {
    if (!open) return
    const targets = [document.getElementById('content'), document.querySelector('footer')].filter(
      (el): el is HTMLElement => el !== null,
    )
    targets.forEach((el) => el.setAttribute('inert', ''))
    return () => targets.forEach((el) => el.removeAttribute('inert'))
  }, [open])

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!document.getElementById(id)) return
    e.preventDefault()
    onClose()
    // Scroll after the close has committed (lock lifted, inert removed).
    window.requestAnimationFrame(() => scrollToSection(id))
  }

  const panel = reduced ? PANEL_STILL : PANEL
  const glyph = reduced ? STILL : GLYPH
  const rise = reduced ? STILL : RISE
  const fade = reduced ? STILL : FADE

  const showNext = featured !== null && featured.state !== 'past'
  const nextPrefix = featured?.state === 'today' ? hero.nextUp.todayPrefix : hero.nextUp.prefix
  const sheetStyle = { '--sheet-sb': `${scrollbarWidth}px` } as CSSProperties

  return (
    <div id="site-menu" className="sheet-host">
      <AnimatePresence>
        {open && (
          <motion.div
            key="site-menu-sheet"
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={layoutCopy.siteMenu}
            className="sheet"
            data-compact={compact ? '' : undefined}
            style={sheetStyle}
            initial={reduced ? false : 'closed'}
            animate="open"
            exit="exit"
          >
            <Button
              variant="icon"
              className="sheet__close"
              aria-label={layoutCopy.closeMenu}
              onClick={onClose}
              iconStart={
                <motion.span className="sheet__close-glyph" variants={glyph} aria-hidden="true">
                  <X size={20} strokeWidth={1.75} />
                </motion.span>
              }
            />

            {/* Covers the page under the transparent bar until the panel wipe reaches it. */}
            <div className="sheet__guard" aria-hidden="true" />

            <motion.div className="sheet__panel" variants={panel}>
              <div className="sheet__ground" aria-hidden="true">
                <div className="sheet__dots dots-fine" />
                <HorizonArc className="sheet__horizon" rise={70} />
              </div>

              {/* Stops Lenis from swallowing wheel events inside the sheet. */}
              <div className="sheet__scroll" data-lenis-prevent="">
                <div className="sheet__body">
                  <nav aria-label={footer.sectionsLabel}>
                    <ul className="sheet__list">
                      {sections.map((s, i) => {
                        const isActive = activeId === s.id
                        const at = FIRST_LABEL + i * LABEL_STEP
                        return (
                          <li key={s.id} className="sheet__item">
                            <a
                              href={`#${s.id}`}
                              className="sheet__link"
                              aria-current={isActive ? 'true' : undefined}
                              onClick={(e) => go(e, s.id)}
                            >
                              <motion.span className="sheet__num" variants={fade} custom={at}>
                                {s.index}
                              </motion.span>
                              <span className="sheet__label">
                                <motion.span className="sheet__label-line" variants={rise} custom={at}>
                                  {s.label}
                                </motion.span>
                              </span>
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>

                  <motion.div className="sheet__row sheet__row--join" variants={fade} custom={ROWS_AT}>
                    <Button variant="primary" full external href="https://gsx-cert.vercel.app/" className="sheet__join">
                      Certificate
                    </Button>
                  </motion.div>

                  <motion.div className="sheet__row sheet__social" variants={fade} custom={ROWS_AT + ROW_STEP}>
                    <Button variant="ghost" external href={site.links.linkedin} className="sheet__social-link">
                      {layoutCopy.linkedin}
                    </Button>
                    <Button variant="ghost" external href={site.links.instagram} className="sheet__social-link">
                      {layoutCopy.instagram}
                    </Button>
                  </motion.div>

                  {showNext && featured && (
                    <motion.p className="sheet__row sheet__next t-meta" variants={fade} custom={ROWS_AT + 2 * ROW_STEP}>
                      <a
                        href={`#${hero.secondaryCta.target}`}
                        className="sheet__next-link"
                        onClick={(e) => go(e, hero.secondaryCta.target)}
                      >
                        <span className="live-dot" aria-hidden="true" />
                        <span>
                          <span className="sheet__next-prefix">{nextPrefix}</span>
                          <span aria-hidden="true"> — </span>
                          <span className="sheet__next-title">{featured.event.title}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="sheet__next-when">
                            {formatIstDay(featured.event.start)} {formatIstMonth(featured.event.start)}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span className="sheet__next-when">
                            {formatIstTime(featured.event.start)} {TZ_SUFFIX}
                          </span>
                        </span>
                      </a>
                      <Button variant="ghost" external href={featured.event.registerUrl} className="sheet__next-register">
                        {hero.nextUp.register}
                      </Button>
                    </motion.p>
                  )}

                  <div className="sheet__plate" aria-hidden="true">
                    <span className="sheet__plate-slot">
                      <motion.span className="sheet__plate-line sheet__plate-line--top" variants={rise} custom={PLATE_AT}>
                        {hero.titleTop}
                      </motion.span>
                    </span>
                    <span className="sheet__plate-slot">
                      <motion.span
                        className="sheet__plate-line sheet__plate-line--bottom"
                        variants={rise}
                        custom={PLATE_AT + LABEL_STEP}
                      >
                        {hero.titleBottom}
                      </motion.span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
