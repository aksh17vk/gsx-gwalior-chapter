import { AppReadyProvider } from './context/AppReady'
import { Navbar } from './components/layout/Navbar'
import { SkipLink } from './components/layout/SkipLink'
import { Preloader } from './components/preloader/Preloader'
import { SmoothScroll } from './components/scroll/SmoothScroll'
import { Hero } from './components/sections/hero/Hero'
import { MarqueeBand } from './components/sections/hero/MarqueeBand'
import { About } from './components/sections/about/About'
import { WhatWeDo } from './components/sections/whatwedo/WhatWeDo'
import { Events } from './components/sections/events/Events'
import { Gallery } from './components/sections/gallery/Gallery'
import { Join } from './components/sections/join/Join'
import { Footer } from './components/sections/join/Footer'

export default function App() {
  return (
    <AppReadyProvider>
      <SmoothScroll />
      <Preloader />
      <SkipLink />
      <Navbar />
      <main id="content" className="page" tabIndex={-1}>
        <Hero />
        <MarqueeBand />
        <About />
        <WhatWeDo />
        <Events />
        <Gallery />
        <Join />
      </main>
      <Footer />
    </AppReadyProvider>
  )
}
