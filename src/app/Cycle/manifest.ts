// FILE: src/app/Cycle/manifest.ts
// PWA manifest scoped to /Cycle so the home-screen install applies only to
// the cycle app, not the rest of markdekock.com.

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:        'Cycle Companion',
    short_name:  'Cycle',
    description: 'Persoonlijke cyclus, stemming en levenstijl tracker.',
    start_url:   '/Cycle',
    scope:       '/Cycle',
    display:     'standalone',
    orientation: 'portrait',
    background_color: '#FBF1ED',
    theme_color:      '#FBF1ED',
    lang:        'nl',
    icons: [
      {
        src:   '/Cycle/icon-192.png',
        sizes: '192x192',
        type:  'image/png',
        purpose: 'maskable',
      },
      {
        src:   '/Cycle/icon-512.png',
        sizes: '512x512',
        type:  'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
