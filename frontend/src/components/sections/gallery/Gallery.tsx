import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { gallery, sections } from '../../../data/content'
import { Reveal } from '../../ui/Reveal'
import { Section } from '../../ui/Section'
import { SectionLabel } from '../../ui/SectionLabel'
import { WordReveal } from '../../ui/WordReveal'
import './Gallery.css'

const meta = sections.find((section) => section.id === 'gallery')
const AUTOPLAY_MS = 4500

type DragState = { startX: number; lastX: number; lastTime: number; startOffset: number; velocity: number; moved: boolean }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const nearest = (offset: number, spacing: number, count: number) => clamp(Math.round(offset / spacing), 0, count - 1)

function springStep(value: number, velocity: number, target: number, dt: number): [number, number] {
  const stiffness = 70
  const damping = 2 * Math.sqrt(stiffness)
  const nextVelocity = velocity + (stiffness * (target - value) - damping * velocity) * dt
  return [value + nextVelocity * dt, nextVelocity]
}

function swingStep(angle: number, velocity: number, lineVelocity: number, dt: number): [number, number] {
  const nextVelocity = velocity + (-38 * angle - 4.2 * velocity + lineVelocity * 0.0034) * dt
  return [clamp(angle + nextVelocity * dt, -0.6, 0.6), nextVelocity]
}

export function Gallery() {
  const reducedMotion = useReducedMotion() ?? false
  const stageRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([])
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const simulation = useRef({ offset: 0, velocity: 0, target: 0, angles: [] as number[], angularVelocity: [] as number[] })
  const [size, setSize] = useState({ width: 0, height: 0, cardWidth: 300 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const [dragging, setDragging] = useState(false)
  const count = gallery.photos.length
  const spacing = size.cardWidth * 1.08

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const resize = new ResizeObserver(() => {
      const bounds = stage.getBoundingClientRect()
      setSize({
        width: bounds.width,
        height: bounds.height,
        cardWidth: Math.round(Math.min(320, bounds.width - 40)),
      })
    })
    resize.observe(stage)
    return () => resize.disconnect()
  }, [])

  useEffect(() => {
    simulation.current.target = currentIndex * spacing
    simulation.current.offset = currentIndex * spacing
  }, [spacing])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !size.width || !size.height || !count) return
    const state = simulation.current
    const reduce = reducedMotion
    let visible = false
    let raf = 0
    let previousTime = performance.now()
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      setIsVisible(visible)
      if (visible && !raf) {
        previousTime = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })

    const frame = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.033, (now - previousTime) / 1000)
      previousTime = now
      const { width, height, cardWidth } = size
      const y0 = Math.max(52, height * 0.2)
      let lineVelocity = 0
      if (dragRef.current?.moved) {
        lineVelocity = dragRef.current.velocity * 1000
      } else if (!reduce) {
        const before = state.offset
        ;[state.offset, state.velocity] = springStep(state.offset, state.velocity, state.target, dt)
        lineVelocity = -(state.offset - before) / Math.max(dt, 0.001)
      } else {
        state.offset = state.target
        state.velocity = 0
      }

      const active = nearest(state.offset, spacing, count)
      for (let index = 0; index < count; index += 1) {
        const card = cardsRef.current[index]
        if (!card) continue
        const x = width / 2 + index * spacing - state.offset
        if (x < -cardWidth * 1.5 || x > width + cardWidth * 1.5) {
          card.style.visibility = 'hidden'
          continue
        }
        card.style.visibility = 'visible'
        let angle = state.angles[index] ?? 0
        let angularVelocity = state.angularVelocity[index] ?? 0
        if (reduce) {
          angle = 0
          angularVelocity = 0
        } else {
          ;[angle, angularVelocity] = swingStep(angle, angularVelocity, lineVelocity, dt)
          angle += Math.sin(now / 1300 + index * 1.7) * 0.0009
        }
        state.angles[index] = angle
        state.angularVelocity[index] = angularVelocity
        const point = clamp(x / width, 0, 1)
        const y = y0 + 4 * 34 * point * (1 - point) - 6
        card.style.transform = `translate(${(x - cardWidth / 2).toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angle.toFixed(4)}rad)`
        card.style.zIndex = String(index === active ? count + 1 : count - Math.abs(index - active))
      }
      pathRef.current?.setAttribute('d', `M0 ${y0} Q${width / 2} ${y0 + 68} ${width} ${y0}`)
      setCurrentIndex((current) => (current === active ? current : active))
      raf = requestAnimationFrame(frame)
    }

    observer.observe(stage)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [count, reducedMotion, size, spacing])

  const goTo = useCallback(
    (index: number) => {
      simulation.current.target = clamp(index, 0, count - 1) * spacing
    },
    [count, spacing],
  )

  useEffect(() => {
    if (reducedMotion || !isVisible || isHovered || hasFocus || count < 2) return
    const timer = window.setInterval(() => goTo(currentIndex >= count - 1 ? 0 : currentIndex + 1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [count, currentIndex, goTo, hasFocus, isHovered, isVisible, reducedMotion])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.gallery__toolbar')) return
    dragRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      startOffset: simulation.current.offset,
      velocity: 0,
      moved: false,
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const delta = event.clientX - drag.startX
    if (!drag.moved && Math.abs(delta) > 5) {
      drag.moved = true
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (!drag.moved) return
    const elapsed = Math.max(1, event.timeStamp - drag.lastTime)
    drag.velocity = 0.7 * ((event.clientX - drag.lastX) / elapsed) + 0.3 * drag.velocity
    drag.lastX = event.clientX
    drag.lastTime = event.timeStamp
    const maxOffset = (count - 1) * spacing
    simulation.current.offset = clamp(drag.startOffset - delta, 0, maxOffset)
  }

  const onPointerUp = () => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    if (drag.moved) {
      setDragging(false)
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
      simulation.current.velocity = -drag.velocity * 1000
      goTo(nearest(simulation.current.offset - drag.velocity * 180, spacing, count))
    }
  }

  const step = (direction: -1 | 1) => goTo(clamp(currentIndex + direction, 0, count - 1))

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  }

  return (
    <Section id="gallery" labelledBy="gallery-title" className="gallery">
      <div className="container">
        <SectionLabel index={meta?.index ?? '04'} label={meta?.ruleLabel ?? gallery.label} />
        <WordReveal
          as="h2"
          id="gallery-title"
          className="t-h1 gallery__title"
          text={gallery.title}
          stagger={0.055}
          duration={0.8}
          amount={0.6}
        />
        <Reveal as="p" className="t-lead gallery__lead" delay={0.12}>
          {gallery.lead}
        </Reveal>

        <Reveal className="gallery__carousel-wrap" delay={0.18}>
          <div
            className="gallery__carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label={gallery.title}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={() => setHasFocus(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false)
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setIsHovered(true)
            }}
            onPointerLeave={() => setIsHovered(false)}
          >
            <div
              ref={stageRef}
              className="gallery__stage"
              data-dragging={dragging ? 'true' : undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <svg className="gallery__string" aria-hidden="true">
                <path ref={pathRef} fill="none" stroke="var(--primary-soft)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {gallery.photos.map((photo, index) => (
                <button
                  key={photo.src}
                  ref={(element) => { cardsRef.current[index] = element }}
                  className="gallery__print"
                  type="button"
                  data-index={index}
                  aria-label={`View photo ${index + 1}: ${photo.alt}`}
                  aria-current={currentIndex === index ? 'true' : undefined}
                  aria-hidden={currentIndex !== index}
                  tabIndex={currentIndex === index ? 0 : -1}
                  style={{ width: `${size.cardWidth}px` }}
                  onClick={() => {
                    if (suppressClickRef.current) return
                    goTo(index)
                  }}
                >
                  <span className="gallery__paper">
                    <span className="gallery__photo-frame">
                      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable={false} />
                    </span>
                    <span className="gallery__photo-title">{photo.alt}</span>
                  </span>
                  <span className="gallery__peg" aria-hidden="true" />
                </button>
              ))}
              <div className="gallery__toolbar">
                <span className="gallery__caption" aria-live="polite" aria-atomic="true">
                  <strong>{gallery.photos[currentIndex]?.alt}</strong>
                  <span>{String(currentIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
                </span>
                <button className="gallery__control" type="button" aria-label="Previous photo" onClick={() => step(-1)}>
                  <ChevronLeft size={18} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <button className="gallery__control" type="button" aria-label="Next photo" onClick={() => step(1)}>
                  <ChevronRight size={18} strokeWidth={1.7} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
