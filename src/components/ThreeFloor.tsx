'use client';
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { CubicleData, STATUS_COLORS } from '@/lib/cubicleData';

const GRID_SIZE = 1.2;
const FLOOR_CELLS = 14;
const FLOOR_HALF = (FLOOR_CELLS * GRID_SIZE) / 2;

export interface FloorRef {
  handleDrop: (cubicleId: string, screenX: number, screenY: number) => void;
}

interface Props {
  cubicles: CubicleData[];
  onCubicleUpdate: (updated: CubicleData) => void;
  onCubicleSelect: (id: string | null) => void;
  onReturnToStack: (id: string) => void;
  selectedId: string | null;
}

// ---- helpers ----
function snapToGrid(v: number) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

function buildCubicleGeometry(w: number, d: number, h = 1.4): THREE.BufferGeometry {
  return new THREE.BoxGeometry(w * GRID_SIZE * 0.92, h, d * GRID_SIZE * 0.92);
}

function buildWireframe(w: number, d: number, h = 1.4) {
  const geo = new THREE.EdgesGeometry(buildCubicleGeometry(w, d, h));
  return geo;
}

const ThreeFloor = forwardRef<FloorRef, Props>(function ThreeFloor(
  { cubicles, onCubicleUpdate, onCubicleSelect, onReturnToStack, selectedId },
  ref
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const raycasterRef = useRef(new THREE.Raycaster());
  const floorMeshRef = useRef<THREE.Mesh | undefined>(undefined);
  const cubicleObjectsRef = useRef<Map<string, THREE.Group>>(new Map());
  const animFrameRef = useRef<number | undefined>(undefined);
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef<string | null>(null);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragIntersectRef = useRef(new THREE.Vector3());
  const hoveredIdRef = useRef<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupDataRef = useRef<{ cubicle: CubicleData; x: number; y: number } | null>(null);
  const [popupState, setPopupState] = useState<{ cubicle: CubicleData; x: number; y: number } | null>(null);
  const [returnConfirm, setReturnConfirm] = useState<string | null>(null);
  const router = useRouter();

  // Keep a stable ref to the latest cubicles array so imperative handles don't go stale
  const cubiclesRef = useRef<CubicleData[]>(cubicles);
  useEffect(() => { cubiclesRef.current = cubicles; }, [cubicles]);

  // Keep a stable ref to onCubicleUpdate
  const onCubicleUpdateRef = useRef(onCubicleUpdate);
  useEffect(() => { onCubicleUpdateRef.current = onCubicleUpdate; }, [onCubicleUpdate]);

  // orbit state
  const orbitRef = useRef({ theta: 0.6, phi: 1.1, radius: 18, isDragging: false, lastX: 0, lastY: 0 });

  const getMouseNDC = useCallback((e: MouseEvent | Touch) => {
    const rect = mountRef.current!.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  }, []);

  const getCubicleAtNDC = useCallback((ndc: THREE.Vector2): string | null => {
    if (!cameraRef.current || !sceneRef.current) return null;
    raycasterRef.current.setFromCamera(ndc, cameraRef.current);
    const meshes: THREE.Object3D[] = [];
    cubicleObjectsRef.current.forEach((group) => {
      group.children.forEach(child => { if ((child as THREE.Mesh).isMesh) meshes.push(child); });
    });
    const hits = raycasterRef.current.intersectObjects(meshes, false);
    if (!hits.length) return null;
    // find which group
    const hit = hits[0].object;
    for (const [id, group] of cubicleObjectsRef.current) {
      if (group.children.includes(hit) || group === hit.parent) return id;
    }
    return null;
  }, []);

  const getFloorPosition = useCallback((ndc: THREE.Vector2): THREE.Vector3 | null => {
    if (!cameraRef.current) return null;
    raycasterRef.current.setFromCamera(ndc, cameraRef.current);
    const target = new THREE.Vector3();
    raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, target);
    target.x = snapToGrid(Math.max(-FLOOR_HALF + GRID_SIZE, Math.min(FLOOR_HALF - GRID_SIZE, target.x)));
    target.z = snapToGrid(Math.max(-FLOOR_HALF + GRID_SIZE, Math.min(FLOOR_HALF - GRID_SIZE, target.z)));
    return target;
  }, []);

  // Build / update cubicle mesh
  const buildCubicleObject = useCallback((c: CubicleData): THREE.Group => {
    const group = new THREE.Group();
    group.userData.id = c.id;

    const statusColor = STATUS_COLORS[c.status];
    const h = 1.4;
    const geo = buildCubicleGeometry(c.width, c.depth, h);

    // Main body
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(c.color),
      transparent: true,
      opacity: 0.82,
      shininess: 60,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Glass roof
    const roofGeo = new THREE.PlaneGeometry(c.width * GRID_SIZE * 0.9, c.depth * GRID_SIZE * 0.9);
    const roofMat = new THREE.MeshPhongMaterial({
      color: 0xffffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = h + 0.01;
    group.add(roof);

    // Wireframe edges
    const edgesGeo = buildWireframe(c.width, c.depth, h);
    const edgesMat = new THREE.LineBasicMaterial({ color: new THREE.Color(statusColor), linewidth: 1 });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.position.y = h / 2;
    group.add(edges);

    // Status glow bottom ring
    const ringGeo = new THREE.TorusGeometry(c.width * GRID_SIZE * 0.45, 0.06, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(statusColor) });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04;
    group.add(ring);

    // Label sprite
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    roundRect(ctx, 4, 4, 248, 56, 10);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.name, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(c.width * GRID_SIZE * 0.85, 0.4);
    const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = h + 0.28;
    label.rotation.x = -Math.PI / 6;
    group.add(label);

    group.position.set(...c.position);
    group.rotation.y = c.rotationY;
    return group;
  }, []);

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Init scene
  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
    const orbit = orbitRef.current;
    camera.position.set(
      orbit.radius * Math.sin(orbit.theta) * Math.sin(orbit.phi),
      orbit.radius * Math.cos(orbit.phi),
      orbit.radius * Math.cos(orbit.theta) * Math.sin(orbit.phi)
    );
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.3);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(FLOOR_CELLS * GRID_SIZE, FLOOR_CELLS * GRID_SIZE);
    const floorMat = new THREE.MeshPhongMaterial({
      color: 0xf3f0ff, transparent: true, opacity: 0.92,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'floor';
    scene.add(floor);
    floorMeshRef.current = floor;

    // Grid helper
    const grid = new THREE.GridHelper(FLOOR_CELLS * GRID_SIZE, FLOOR_CELLS, 0xc4b5f4, 0xe2daf8);
    grid.position.y = 0.01;
    scene.add(grid);

    // Floor border
    const borderGeo = new THREE.EdgesGeometry(
      new THREE.PlaneGeometry(FLOOR_CELLS * GRID_SIZE, FLOOR_CELLS * GRID_SIZE)
    );
    const borderMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, linewidth: 2 });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.02;
    scene.add(border);

    // Render loop
    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    animFrameRef.current = frameId!;

      // Resize — debounce via rAF to avoid ResizeObserver loop warnings
      let resizeRaf: number | undefined;
      const ro = new ResizeObserver(() => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          if (w === 0 || h === 0) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
      });
      ro.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update camera from orbit
  const updateCamera = useCallback(() => {
    const orbit = orbitRef.current;
    const cam = cameraRef.current;
    if (!cam) return;
    cam.position.set(
      orbit.radius * Math.sin(orbit.theta) * Math.sin(orbit.phi),
      orbit.radius * Math.cos(orbit.phi),
      orbit.radius * Math.cos(orbit.theta) * Math.sin(orbit.phi)
    );
    cam.lookAt(0, 0, 0);
  }, []);

  // Sync cubicle objects with data
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const placed = cubicles.filter(c => c.placed);

    // Remove old
    const currentIds = new Set(placed.map(c => c.id));
    cubicleObjectsRef.current.forEach((obj, id) => {
      if (!currentIds.has(id)) {
        scene.remove(obj);
        cubicleObjectsRef.current.delete(id);
      }
    });

    // Add/update
    placed.forEach(c => {
      if (cubicleObjectsRef.current.has(c.id)) {
        // update position/rotation
        const obj = cubicleObjectsRef.current.get(c.id)!;
        obj.position.set(...c.position);
        obj.rotation.y = c.rotationY;
      } else {
        const obj = buildCubicleObject(c);
        scene.add(obj);
        cubicleObjectsRef.current.set(c.id, obj);
      }
    });
  }, [cubicles, buildCubicleObject]);

  // Mouse events
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let clickStartTime = 0;
    let clickStartPos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) return; // right click = orbit
      const ndc = getMouseNDC(e);
      const hitId = getCubicleAtNDC(ndc);

      if (hitId) {
        isDraggingRef.current = true;
        dragTargetRef.current = hitId;
        el.style.cursor = 'grabbing';
        clickStartTime = Date.now();
        clickStartPos = { x: e.clientX, y: e.clientY };
      } else {
        // Start orbit
        orbitRef.current.isDragging = true;
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (orbitRef.current.isDragging) {
        const dx = e.clientX - orbitRef.current.lastX;
        const dy = e.clientY - orbitRef.current.lastY;
        orbitRef.current.theta -= dx * 0.008;
        orbitRef.current.phi = Math.max(0.4, Math.min(1.45, orbitRef.current.phi + dy * 0.008));
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
        updateCamera();
        return;
      }

      const ndc = getMouseNDC(e);

      if (isDraggingRef.current && dragTargetRef.current) {
        const pos = getFloorPosition(ndc);
        if (pos) {
          const obj = cubicleObjectsRef.current.get(dragTargetRef.current);
          if (obj) { obj.position.x = pos.x; obj.position.z = pos.z; }
        }
        return;
      }

      // Hover detection
      const hitId = getCubicleAtNDC(ndc);
      if (hitId !== hoveredIdRef.current) {
        // Reset old
        if (hoveredIdRef.current) {
          const old = cubicleObjectsRef.current.get(hoveredIdRef.current);
          if (old) {
            const body = old.children[0] as THREE.Mesh;
            if (body && (body.material as THREE.MeshPhongMaterial).opacity !== undefined) {
              (body.material as THREE.MeshPhongMaterial).opacity = 0.82;
              old.scale.setScalar(1);
            }
          }
        }
        hoveredIdRef.current = hitId;
        if (hitId) {
          const obj = cubicleObjectsRef.current.get(hitId);
          if (obj) {
            const body = obj.children[0] as THREE.Mesh;
            if (body) (body.material as THREE.MeshPhongMaterial).opacity = 0.95;
            obj.scale.setScalar(1.03);
          }
          // Popup
          const cubicle = cubicles.find(c => c.id === hitId);
          if (cubicle) {
            const rect = el.getBoundingClientRect();
            setPopupState({ cubicle, x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
          el.style.cursor = 'pointer';
        } else {
          setPopupState(null);
          el.style.cursor = 'grab';
        }
      } else if (hitId && popupState) {
        // Update popup position
        const rect = el.getBoundingClientRect();
        setPopupState(prev => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      orbitRef.current.isDragging = false;

      if (isDraggingRef.current && dragTargetRef.current) {
        const id = dragTargetRef.current;
        const obj = cubicleObjectsRef.current.get(id);
        if (obj) {
          const ndc = getMouseNDC(e);
          const pos = getFloorPosition(ndc);
          if (pos) {
            // Check if dragged off left side (x < -FLOOR_HALF)
            if (e.clientX < el.getBoundingClientRect().left + 10) {
              setReturnConfirm(id);
            } else {
              onCubicleUpdate({
                ...cubicles.find(c => c.id === id)!,
                position: [pos.x, 0, pos.z],
              });
            }
          }
        }
        isDraggingRef.current = false;
        dragTargetRef.current = null;
        el.style.cursor = 'grab';

        // Click detection (short press, no movement)
        const dt = Date.now() - clickStartTime;
        const moved = Math.hypot(e.clientX - clickStartPos.x, e.clientY - clickStartPos.y);
        if (dt < 300 && moved < 8) {
          onCubicleSelect(id);
          router.push(`/cubicle/${id}`);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      orbitRef.current.radius = Math.max(8, Math.min(35, orbitRef.current.radius + e.deltaY * 0.04));
      updateCamera();
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('contextmenu', onContextMenu);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onContextMenu);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cubicles, getCubicleAtNDC, getFloorPosition, getMouseNDC, onCubicleUpdate, onCubicleSelect, updateCamera]);

  // External drop from stack (called by parent via ref)
  useImperativeHandle(ref, () => ({
    handleDrop: (cubicleId: string, screenX: number, screenY: number) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      const ndc = new THREE.Vector2(
        ((screenX - rect.left) / rect.width) * 2 - 1,
        -((screenY - rect.top) / rect.height) * 2 + 1
      );
      raycasterRef.current.setFromCamera(ndc, cameraRef.current!);
      const target = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, target);
      const x = snapToGrid(Math.max(-FLOOR_HALF + GRID_SIZE, Math.min(FLOOR_HALF - GRID_SIZE, target.x)));
      const z = snapToGrid(Math.max(-FLOOR_HALF + GRID_SIZE, Math.min(FLOOR_HALF - GRID_SIZE, target.z)));
      const existing = cubicles.find(c => c.id === cubicleId);
      if (existing) {
        onCubicleUpdate({ ...existing, placed: true, position: [x, 0, z] });
      }
    },
  }));

  return (
    <div className="relative w-full h-full" style={{ cursor: 'grab' }}>
      <div ref={mountRef} className="w-full h-full" />

      {/* Hover popup */}
      {popupState && (
        <div
          className="pointer-events-none absolute"
          style={{ left: popupState.x + 16, top: popupState.y - 20, zIndex: 50 }}
        >
          <div
            className="rounded-2xl p-4 min-w-[220px]"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--ipqc-border)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.18)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: STATUS_COLORS[popupState.cubicle.status] }}
              />
              <span className="font-bold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>
                {popupState.cubicle.name}
              </span>
            </div>
            <InfoRow label="Instruments" items={popupState.cubicle.instruments} />
            <InfoRow label="Equipment" items={popupState.cubicle.equipment} />
            <InfoRow label="Employees" items={popupState.cubicle.employees} />
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: STATUS_COLORS[popupState.cubicle.status] + '22',
                  color: STATUS_COLORS[popupState.cubicle.status],
                }}
              >
                {popupState.cubicle.status === 'available' ? 'Available'
                  : popupState.cubicle.status === 'in-use' ? 'In Use'
                    : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Return confirm dialog */}
      {returnConfirm && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 60, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}>
          <div
            className="rounded-2xl p-6 w-72"
            style={{ background: 'var(--ipqc-surface)', border: '1px solid var(--ipqc-border)', boxShadow: 'var(--ipqc-menu-shadow)' }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--ipqc-text-primary)' }}>Move Cubicle?</p>
            <p className="text-sm mb-4" style={{ color: 'var(--ipqc-text-muted)' }}>
              Return this cubicle to the stack or keep it on the floor?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'var(--ipqc-accent)', color: '#fff' }}
                onClick={() => { onReturnToStack(returnConfirm); setReturnConfirm(null); }}
              >
                Return to Stack
              </button>
              <button
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'var(--ipqc-bg-secondary)', color: 'var(--ipqc-text-primary)', border: '1px solid var(--ipqc-border)' }}
                onClick={() => setReturnConfirm(null)}
              >
                Keep on Floor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full"
        style={{ background: 'var(--ipqc-panel-bg)', color: 'var(--ipqc-text-muted)', border: '1px solid var(--ipqc-border)', backdropFilter: 'blur(8px)' }}
      >
        Drag floor to orbit &bull; Scroll to zoom &bull; Drag cubicle to move &bull; Click to open
      </div>
    </div>
  );
});

function InfoRow({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-1.5">
      <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--ipqc-text-muted)' }}>{label}</span>
      <div className="flex flex-wrap gap-1 mt-0.5">
        {items.slice(0, 3).map(item => (
          <span key={item} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--ipqc-accent-ultra-light)', color: 'var(--ipqc-text-secondary)' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ThreeFloor;
