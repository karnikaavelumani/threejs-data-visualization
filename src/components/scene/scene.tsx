"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createFoodWasteService } from "@/lib/food-waste";

interface Feature {
  type: string;
  properties: Record<string, string | number>;
  bbox: [number, number, number, number];
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

async function setup(containerElement: HTMLElement) {
  if (containerElement.children.length > 0) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerElement.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);

  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  const foodWasteService = await createFoodWasteService();
  fetch("/ne_110m_admin_0_countries.geojson")
    .then((res) => res.json())
    .then((countries) => {
      const globe = new ThreeGlobe()
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
        .polygonsData(
          countries.features.filter((f: Feature) =>
            f.properties.ISO_A2 !== "AQ"
          ),
        )
        .polygonCapColor(() => "rgba(200, 0, 0, 0.7)")
        .polygonSideColor(() => "rgba(0, 200, 0, 0.1)")
        .polygonStrokeColor(() => "#111");
      globe.polygonAltitude((f) => {
        let data = foodWasteService.getDataByCountry(
          (f as Feature).properties["NAME"] as string,
        );
        data ??= foodWasteService.getDataByCountry(
          (f as Feature).properties["NAME_LONG"] as string,
        );
        if (!data) {
          return 0;
        }

        return data.FoodWaste2021kgcapitayear / 100;
      });
      scene.add(globe);
    });

  camera.position.z = 350;
  controls.update();

  function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

export function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setup(containerRef.current!);
  }, []);

  return <div ref={containerRef} />;
}
