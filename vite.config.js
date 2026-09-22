import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const ENTRIES = { '/research/parents': '/research-parents.html', '/research/kids': '/research-kids.html' }

// Dev-only: serve /research/* from research.html and run the api/ functions
// in-process, so `npm run dev` behaves like the Vercel deployment.
function research() {
  return {
    name: 'research-dev',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://x')
        if (url.pathname === '/research' || url.pathname.startsWith('/research/')) {
          req.url = ENTRIES[url.pathname] || '/research.html'
          return next()
        }
        if (url.pathname.startsWith('/api/')) {
          try {
            const file = resolve(`.${url.pathname}.js`)
            const mod = await server.ssrLoadModule(file)
            return await mod.default(req, res)
          } catch (e) {
            res.statusCode = e.code === 'ENOENT' ? 404 : 500
            res.end(e.message)
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), research()],
  build: {
    rollupOptions: {
      input: { main: resolve('index.html'), research: resolve('research.html'), parents: resolve('research-parents.html'), kids: resolve('research-kids.html') },
    },
  },
})
