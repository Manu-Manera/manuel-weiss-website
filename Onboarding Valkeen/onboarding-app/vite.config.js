import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Leitet häufige Falsch-URLs ohne /onboarding/ um (z. B. localhost:3000/admin-login.html). */
function onboardingBaseRedirects() {
  return {
    name: 'onboarding-base-redirects',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        const qs = req.url?.includes('?') ? '?' + req.url.split('?')[1] : ''

        if (raw === '/' || raw === '') {
          res.statusCode = 302
          res.setHeader('Location', '/onboarding/')
          res.end()
          return
        }
        if (raw === '/admin-login.html' || raw === '/dev-login.html') {
          res.statusCode = 302
          res.setHeader('Location', '/onboarding/dev-login.html' + qs)
          res.end()
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [onboardingBaseRedirects(), react(), tailwindcss()],
  base: '/onboarding/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-xlsx': ['xlsx'],
          'vendor-ui': ['lucide-react', 'date-fns'],
        }
      }
    }
  }
})
