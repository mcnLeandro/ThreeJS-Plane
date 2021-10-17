import './style.css';
import gsap from 'gsap';
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import Config from './config';

const gui = new dat.GUI();
const world = {
  plane: {
    ...Object.keys(Config.size).reduce((hash, key) => {
      hash[key] = Config.size[key].default;
      return hash;
    }, {}),
  },
};

Object.keys(Config.size).forEach((key) => {
  gui
    .add(world.plane, key, Config.size[key].min, Config.size[key].max)
    .onChange(generateplane);
});

function generateplane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.segments,
    world.plane.segments
  );

  randomizePlane();

  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(
      Config.color.default.r,
      Config.color.default.g,
      Config.color.default.b
    );
  }

  planeMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}
function randomizePlane() {
  const randomValues = [];
  const { array } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i] = x + (Math.random() - 0.5) * 3;
    array[i + 1] = y + (Math.random() - 0.5) * 3;
    array[i + 2] = z + (Math.random() - 0.5) * 3;

    randomValues.push(Math.random(), Math.random(), Math.random());
  }

  planeMesh.geometry.attributes.position.randomValues = randomValues;
  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const raycaster = new THREE.Raycaster();
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

generateplane();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

camera.position.z = 50;
const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.03;
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.03;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;
  /**
   * FIXME:うまく色が変化しない。
   * 最初に一瞬だけど元に戻って変化なし。
   * 無名関数を使わずにやってみたけど同じ結果に、
   * 別の部分にエラーがあるはずなので探す。
   */
  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    console.log(intersects.length);
    const color = intersects[0].object.geometry.attributes.color;
    const face = intersects[0].face;

    const changeVerticeColor = (num, rgbColor) => {
      color.setX(num, rgbColor.r);
      color.setY(num, rgbColor.g);
      color.setZ(num, rgbColor.b);
    };
    const changeColor = (rgbColor) => {
      changeVerticeColor(face.a, rgbColor);
      changeVerticeColor(face.b, rgbColor);
      changeVerticeColor(face.c, rgbColor);
      color.needsUpdate = true;
    };

    changeColor(Config.color.hover);

    gsap.to(Config.color.hover, {
      ...Config.color.default,
      duration: 1,
      onUpdate: () => changeColor(Config.color.default),
    });
  }
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
