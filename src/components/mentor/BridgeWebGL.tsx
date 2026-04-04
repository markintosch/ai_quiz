'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Wireframe bridge-over-canyon WebGL component.
// Replicates the architectural sketch in the mentor page hero:
// white line geometry on dark, slightly tilted perspective.

export default function BridgeWebGL({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.1, 200)
    // Angle matches the sketch: slightly elevated, right-of-centre, looking across
    camera.position.set(-6, 5, 18)
    camera.lookAt(2, 0, 0)

    // Subtle tilt like the hand-drawn perspective in the sketch
    camera.rotation.z = -0.07

    const MAT = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.9, transparent: true })

    function line(points: [number, number, number][]): THREE.Line {
      const geo = new THREE.BufferGeometry().setFromPoints(
        points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
      )
      return new THREE.Line(geo, MAT)
    }

    function addLine(...pts: [number, number, number][]) {
      scene.add(line(pts))
    }

    // ── Bridge deck ───────────────────────────────────────────────────────────
    // Two parallel rails running left-right (X axis), at y=0, separated in Z
    const RAIL_Z = [-0.6, 0.6]
    const SPAN_X: [number, number] = [-8, 8]
    const DECK_Y = 0

    for (const z of RAIL_Z) {
      addLine([SPAN_X[0], DECK_Y, z], [SPAN_X[1], DECK_Y, z])
    }

    // Cross-ties every 1.6 units
    for (let x = SPAN_X[0]; x <= SPAN_X[1]; x += 1.6) {
      addLine([x, DECK_Y, RAIL_Z[0]], [x, DECK_Y, RAIL_Z[1]])
    }

    // ── Truss girder (top chord) ──────────────────────────────────────────────
    const TOP_Y = 3.2
    for (const z of RAIL_Z) {
      addLine([SPAN_X[0], TOP_Y, z], [SPAN_X[1], TOP_Y, z])
    }

    // Cross-ties at top
    for (let x = SPAN_X[0]; x <= SPAN_X[1]; x += 1.6) {
      addLine([x, TOP_Y, RAIL_Z[0]], [x, TOP_Y, RAIL_Z[1]])
    }

    // Verticals connecting deck to top chord
    for (let x = SPAN_X[0]; x <= SPAN_X[1]; x += 1.6) {
      for (const z of RAIL_Z) {
        addLine([x, DECK_Y, z], [x, TOP_Y, z])
      }
    }

    // Diagonal bracing (Warren truss pattern)
    for (let i = 0; i < 10; i++) {
      const x0 = SPAN_X[0] + i * 1.6
      const x1 = x0 + 1.6
      for (const z of RAIL_Z) {
        // Alternating diagonals
        if (i % 2 === 0) {
          addLine([x0, DECK_Y, z], [x1, TOP_Y, z])
        } else {
          addLine([x0, TOP_Y, z], [x1, DECK_Y, z])
        }
      }
    }

    // End verticals (portal frames)
    for (const x of SPAN_X) {
      addLine([x, DECK_Y, RAIL_Z[0]], [x, TOP_Y, RAIL_Z[0]])
      addLine([x, DECK_Y, RAIL_Z[1]], [x, TOP_Y, RAIL_Z[1]])
      // Portal cross-beam
      addLine([x, TOP_Y, RAIL_Z[0]], [x, TOP_Y, RAIL_Z[1]])
      addLine([x, DECK_Y, RAIL_Z[0]], [x, DECK_Y, RAIL_Z[1]])
    }

    // ── Canyon walls ─────────────────────────────────────────────────────────
    // Left cliff — angular facets descending
    const leftCliff: [number, number, number][][] = [
      [[-8, 0, -0.6], [-8, -2, -2], [-6, -4, -3], [-5, -7, -4]],
      [[-8, 0, 0.6],  [-8, -2, 2],  [-6, -4, 3],  [-5, -7, 4]],
      [[-8, -2, -2],  [-8, -2, 2]],
      [[-6, -4, -3],  [-6, -4, 3]],
      [[-5, -7, -4],  [-5, -7, 4]],
      [[-8, 0, -0.6], [-8, 0, 0.6]],
      // Extra facet lines for rocky texture
      [[-8, -1, -1.5], [-6.5, -3, -2.5], [-5.5, -5.5, -3.5]],
      [[-8, -1, 1.5],  [-6.5, -3, 2.5],  [-5.5, -5.5, 3.5]],
      [[-7, -1.5, -2], [-7, -1.5, 2]],
      [[-6, -3.5, -2.8], [-6, -3.5, 2.8]],
    ]

    // Right cliff — mirrored
    const rightCliff: [number, number, number][][] = [
      [[8, 0, -0.6], [8.5, -1.5, -1.8], [7, -3.5, -2.8], [6.5, -6.5, -3.8]],
      [[8, 0, 0.6],  [8.5, -1.5, 1.8],  [7, -3.5, 2.8],  [6.5, -6.5, 3.8]],
      [[8.5, -1.5, -1.8], [8.5, -1.5, 1.8]],
      [[7, -3.5, -2.8],   [7, -3.5, 2.8]],
      [[6.5, -6.5, -3.8], [6.5, -6.5, 3.8]],
      [[8, 0, -0.6], [8, 0, 0.6]],
      // Rocky texture
      [[8.2, -0.8, -1.2], [7.5, -2.5, -2.2], [7, -4.5, -3.2]],
      [[8.2, -0.8, 1.2],  [7.5, -2.5, 2.2],  [7, -4.5, 3.2]],
      [[7.8, -1.2, -1.5], [7.8, -1.2, 1.5]],
      [[7.2, -3, -2.5],   [7.2, -3, 2.5]],
    ]

    for (const pts of [...leftCliff, ...rightCliff]) {
      addLine(...pts as [number, number, number][])
    }

    // Canyon floor — thin lines deep below
    for (let z = -3; z <= 3; z += 1.5) {
      addLine([-6, -8, z], [6, -8, z])
    }
    for (let x = -6; x <= 6; x += 2) {
      addLine([x, -8, -3], [x, -8, 3])
    }

    // ── Approach ramps (outside the span) ────────────────────────────────────
    // Left approach
    for (const z of RAIL_Z) {
      addLine([-8, 0, z as number], [-12, -0.5, z as number])
    }
    addLine([-8, 0, RAIL_Z[0]], [-8, 0, RAIL_Z[1]])
    addLine([-12, -0.5, RAIL_Z[0]], [-12, -0.5, RAIL_Z[1]])

    // Right approach
    for (const z of RAIL_Z) {
      addLine([8, 0, z as number], [12, -0.5, z as number])
    }
    addLine([12, -0.5, RAIL_Z[0]], [12, -0.5, RAIL_Z[1]])

    // ── Subtle animation: very slow rotation / drift ──────────────────────────
    let rafId: number
    let t = 0

    function animate() {
      rafId = requestAnimationFrame(animate)
      t += 0.0003

      // Gentle pendulum on camera X/Y — barely perceptible
      camera.position.x = -6 + Math.sin(t) * 0.4
      camera.position.y = 5 + Math.cos(t * 0.7) * 0.2
      camera.lookAt(2, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ────────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%', ...style }} />
}
