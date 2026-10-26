
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Edges } from "@react-three/drei";
import { Suspense } from "react";

function CajaHerramientas() {
  return (
    <group rotation={[0, -0.3, 0]}>

      {/* Cuerpo de la caja */}
      <RoundedBox
        args={[3, 1.5, 1.5]}
        radius={0.12}
        smoothness={4}
        position={[0, -0.3, 0]}
      >
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.35}
          roughness={0.35}
        />
      </RoundedBox>

      {/* Tapa superior */}
      <RoundedBox
        args={[3.1, 0.3, 1.6]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.55, 0]}
      >
        <meshStandardMaterial
          color="#1e3a8a"
          metalness={0.4}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Asa */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[1.1, 0.15, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <mesh position={[-0.45, 0.83, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <mesh position={[0.45, 0.83, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Cierre frontal */}
      <mesh position={[0, 0.35, 0.82]}>
        <boxGeometry args={[0.4, 0.35, 0.08]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

    </group>
  );
}

function Producto3D() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-800">
          Visualización 3D de Productos
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Modelo interactivo de una caja de herramientas.
          Puedes girarla y acercarla utilizando el mouse.
        </p>
      </div>

      <div className="h-80 w-full overflow-hidden rounded-xl bg-slate-900">
        <Canvas
          camera={{
            position: [5, 3, 6],
            fov: 45
          }}
        >
          <color attach="background" args={["#0f172a"]} />

          <ambientLight intensity={1.2} />

          <directionalLight
            position={[5, 8, 5]}
            intensity={2}
          />

          <pointLight
            position={[-4, 3, -3]}
            intensity={1}
          />

          <Suspense fallback={null}>
            <CajaHerramientas />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={12}
          />
        </Canvas>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Modelo tridimensional interactivo desarrollado con
        Three.js y React Three Fiber.
      </p>

    </section>
  );
}

export default Producto3D;
