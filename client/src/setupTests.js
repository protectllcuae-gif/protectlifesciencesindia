import '@testing-library/jest-dom'

// Mock IntersectionObserver for testing environment
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
  }
  observe(target) {
    // Instantly trigger observation in tests to simulate entering viewport
    this.callback([{ isIntersecting: true, target }], this)
  }
  unobserve() {}
  disconnect() {}
}