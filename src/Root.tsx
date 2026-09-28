import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App'

// The prep notes and the book are large; load each only when someone opens its page.
const Preparation = lazy(() => import('./pages/Preparation'))
const Book = lazy(() => import('./pages/Book'))

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/preparation"
          element={
            <Suspense fallback={null}>
              <Preparation />
            </Suspense>
          }
        />
        <Route
          path="/book/:chapterId?"
          element={
            <Suspense fallback={null}>
              <Book />
            </Suspense>
          }
        />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}
