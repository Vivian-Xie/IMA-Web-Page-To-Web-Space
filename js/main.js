let params = {
  cubes: 0,
  scene_children: 0,
};

let room;
let plane;
let clock = new THREE.Clock();
let cubes = [];
let vertices=[];
let cardsArray = [];
let sceneElementsGroup;
let floating_cards;
let floating_cards2;
let glowMesh;//door back light
let door_frame;
const WORLD_HALF = 25;
const loader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const starTexture = loader.load(
  "./assets/teapot2.jpg"
  );
  
  starTexture.wrapS = THREE.RepeatWrapping; // 水平方向重复
  starTexture.wrapT = THREE.RepeatWrapping; // 垂直方向重复
  starTexture.repeat.set(4, 4); // 设置重复次数，可以根据需要调整
  starTexture.offset.set(0.1, 0.1); // 设置偏移，用于测试纹理效果

///condition
let doorFullyOpen1 = false;
let doorFullyOpen2 = false;



let flashPlane;
let flashOpacity = 0;
let flashFadingIn = false;
let flashFadingOut = false;

// const objLoader = new OBJLoader();

function setupThree() {
  // renderer additional setup
  renderer.shadowMap.enabled = true;

  // WebXR
  setupWebXR();


  //setupGroup

  sceneElementsGroup = new THREE.Group();
  // scene.add(sceneElementsGroup);


  // room
  // room = getRoom();
  // scene.add(room);


  // plane
  // plane = getPlane();
  // scene.add(plane);

  // floor
  // const floorGeometry = new THREE.PlaneGeometry(6, 6);
  // // const floorMaterial = new THREE.ShadowMaterial({ opacity: 1, blending: THREE.CustomBlending, transparent: false });
  // const floorMaterial = new THREE.MeshStandardMaterial({
    //   color: 0xaaaaaa, // 设置地板颜色
    //   roughness: 0.7,   // 控制材质的粗糙度
    //   metalness: 0.0,   // 控制材质的金属感
    // });
    // const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.rotation.x = - Math.PI / 2;
    // floor.receiveShadow = true;


    const floorGeometry = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2, 100, 100);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 1, blending: THREE.CustomBlending, transparent: false });
  // const floorMaterial = new THREE.MeshStandardMaterial({
  //   color: 0x000000, // 设置地板颜色
  //   roughness: 0.7,  // 控制材质的粗糙度
  //   metalness: 0.0,  // 控制材质的金属感
  //   side: THREE.DoubleSide, // 确保地板双面可见
  // });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // 旋转使其水平放置
  // floor.position.y = -WORLD_HALF / 4; // 调整高度
  floor.receiveShadow = true; // 设置接收阴影

  // scene.add(floor);

  // lights
  const hemiLight = new THREE.HemisphereLight(0xa5a5a5, 0x898989, 3);
  scene.add(hemiLight);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0, 6, 0);
  light.castShadow = true;
  light.shadow.camera.top = 3;
  light.shadow.camera.bottom = - 3;
  light.shadow.camera.right = 3;
  light.shadow.camera.left = - 3;
  light.shadow.mapSize.set(4096, 4096);
  scene.add(light);

  group = new THREE.Group();
  scene.add(group);
  getFlash();
  const geometries = [
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.ConeGeometry(0.2, 0.2, 64),
    new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronGeometry(0.2, 8),
    new THREE.TorusGeometry(0.2, 0.04, 64, 32)
  ];

  for (let i = 0; i < 1000; i++) {

    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
      // map: starTexture,
      roughness: 0.7,
      metalness: 0.0
    });

    

    const object = new THREE.Mesh(geometry, material);

    // object.position.x = Math.random() * 100 - 2;
    // object.position.y = Math.random() * 2;
    // object.position.z = Math.random() * 400 - 2;
    
    // object.rotation.x = Math.random() * 2 * Math.PI;
    // object.rotation.y = Math.random() * 2 * Math.PI;
    // object.rotation.z = Math.random() * 2 * Math.PI;
    object.position.x = Math.random() * (WORLD_HALF * 1.8) - (WORLD_HALF * 0.9);
    // object.position.y = Math.random() * (WORLD_HALF * 0.5) - (WORLD_HALF * 0.25);
    object.position.y = Math.random() * 4;
    object.position.z = Math.random() * (WORLD_HALF * 1.8) - (WORLD_HALF * 0.9);

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;


    object.scale.setScalar(Math.random() + 0.5);

    object.castShadow = true;
    object.receiveShadow = true;

    // group.add(object);

  }
  const door = gltfLoader.load(
    `./assets/door_frame/scene.gltf`,
    function (gltf) {
      door_frame = gltf.scene;
      door_frame.scale.set(0.08, 0.08, 0.08); // Scale the model
      door_frame.rotation.y = Math.PI / 2; // Rotate the frame
      scene.add(door_frame);
      
      const doorbox = new THREE.Box3().setFromObject(door_frame);
  
      // Get dimensions and center of the bounding box
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      doorbox.getSize(size); 
      doorbox.getCenter(center); 
      const glowGeometry = new THREE.BoxGeometry(size.x, size.y, size.z * 0.1); // Match size
      const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Bright white
        emissive: 0xffffff, // Emissive white light
        emissiveIntensity: 1.5, // Bright glow
      });
  
      glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  
      // Position the glowing geometry slightly behind the door
      glowMesh.position.set(center.x, center.y, center.z - size.z * 0.6); // Adjust Z to place it behind the door
  
      scene.add(glowMesh);
      // sceneElementsGroup.add(glowMesh);
      // console.log('Door frame size:', size);
      // console.log('Door frame center:', center);
      const doorTexture = loader.load('./assets/door.jpg');
      const doorGeometry = new THREE.BoxGeometry(size.x * 0.8, size.y*0.95, size.z * 0.1); // Slightly smaller than the frame
      // const doorMaterial = new THREE.MeshStandardMaterial({  map: doorTexture, }); // Brown door
    const doorTextureFront = loader.load('./assets/door.jpg');
    const doorTextureBack = loader.load('./assets/door.jpg'); // Separate texture for the back

    // Mirror the texture for the front face
    const doorMaterialFront = new THREE.MeshStandardMaterial({
      map: doorTextureFront, // Use the front texture
    });
    doorMaterialFront.map.wrapS = THREE.RepeatWrapping;
    doorMaterialFront.map.repeat.x = -1; // Flip horizontally for the front face

    // Create the door material for the back face
    const doorMaterialBack = new THREE.MeshStandardMaterial({
      map: doorTextureBack, // Use a separate back texture
    });

    // Create materials array for all six faces of the door
    const doorMaterials = [
      doorMaterialBack,  // Right face
      doorMaterialBack,  // Left face
      doorMaterialBack,  // Top face
      doorMaterialBack,  // Bottom face
      doorMaterialFront, // Front face (mirrored)
      doorMaterialBack,  // Back face
    ];
      const doorMesh = new THREE.Mesh(doorGeometry, doorMaterials);
  
      const doorPivot = new THREE.Object3D();
  

      doorPivot.position.set(center.x - size.x * 0.4, center.y, center.z);
      doorMesh.position.set(size.x * 0.4, 0, 0);
      doorPivot.add(doorMesh);
      
      scene.add(doorPivot);
      // sceneElementsGroup.add(doorMesh);
      
      window.doorPivot = doorPivot; 
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error(error);
    }
  );
  
  const cards = gltfLoader.load(
    `./assets/floating_cards/scene.gltf`,
    function (gltf) {
      floating_cards = gltf.scene;
      floating_cards.scale.set(0.08, 0.08, 0.08); // Scale child objects
  
      // Traverse and scale all children
      floating_cards.traverse((child) => {
        if (child.isMesh) {
          floating_cards.position.set(-60, 0, 0);
          // floating_cards.rotation.y = Math.PI*1.5; // Rotate 45 degrees around the Y-axis
          floating_cards.rotation.x = Math.PI; // Rotate 45 degrees around the Y-axis
        }
      });
      scene.add(floating_cards);
      sceneElementsGroup.add(floating_cards);
  
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error(error);
    }
  );
  const cards2 = gltfLoader.load(
    `./assets/cards/scene.gltf`,
    function (gltf) {
      // Create the first instance
      floating_cards2 = gltf.scene.clone();
      floating_cards2.scale.set(0.008, 0.008, 0.008);
      floating_cards2.position.set(0, 0, 0);
      // scene.add(floating_cards2);

  
      // Create additional instances
      for (let i = 1; i <= 5; i++) {
        const clone = gltf.scene.clone(); // Clone the original scene
        clone.scale.set(0.008, 0.008, 0.008); // Apply the same scale
        clone.position.set(20, 2, i * -10); // Position each instance uniquely
        cardsArray.push(clone);
        scene.add(clone);
        sceneElementsGroup.add(clone);
      }
      for (let i = 1; i <= 5; i++) {
        const clone = gltf.scene.clone(); // Clone the original scene
        clone.scale.set(0.008, 0.008, 0.008); // Apply the same scale
        clone.position.set(10, 2, i * -10); // Position each instance uniquely
        cardsArray.push(clone);
        scene.add(clone);
        sceneElementsGroup.add(clone);
      }
      for (let i = 1; i <= 5; i++) {
        const clone = gltf.scene.clone(); // Clone the original scene
        clone.scale.set(0.008, 0.008, 0.008); // Apply the same scale
        clone.position.set(-10, 2, i * -10); // Position each instance uniquely
        cardsArray.push(clone);
        scene.add(clone);
        sceneElementsGroup.add(clone);
      }
      for (let i = 1; i <= 5; i++) {
        const clone = gltf.scene.clone(); // Clone the original scene
        clone.scale.set(0.008, 0.008, 0.008); // Apply the same scale
        clone.position.set(-20, 2, i * -10); // Position each instance uniquely
        cardsArray.push(clone);
        scene.add(clone);
        sceneElementsGroup.add(clone);
      }
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error(error);
    }
  );
  
  
  


  // gui
  gui.add(params, "cubes", 0, 5000).step(1).listen();
  gui.add(params, "scene_children", 0, 5000).step(1).listen();
}

function updateThree() {
  cleanIntersected();

  intersectObjects(controller1);
  intersectObjects(controller2);
  const deltaTime = clock.getDelta(); // Time elapsed since the last frame
  // updateFlash(deltaTime);
  let elapsedTime = clock.getElapsedTime();
  //cards
  if (floating_cards) {
    const floatingSpeed = 0.5; // 控制悬浮速度
    const floatingRange = 50; // 控制悬浮高度
    floating_cards.position.y =  Math.sin(elapsedTime * floatingSpeed) * floatingRange;
    //////////dizzy
    floating_cards.rotation.x += 0.005; 
  }

  cardsArray.forEach((card, index) => {
    const floatingSpeed = 0.5;
    const rotationRadius = 10;
    const angle = elapsedTime * floatingSpeed + index * 0.5; // Offset angle for variety

    // Circular motion
    card.position.x = Math.cos(angle) * rotationRadius;
    card.position.z = -2 + Math.sin(angle) * rotationRadius;

    // Rotate around its own axis
    card.rotation.y += 0.05;
    card.rotation.x += 0.005;
  });

  // Object floating
  group.children.forEach((object, index) => {
    const floatingSpeed = 0.5; 
    const floatingRange = 0.5; 
    object.position.y += Math.sin(elapsedTime * floatingSpeed + index) * floatingRange * 0.01;
    
  });
  //door
  let doorTargetAngle = 0; // Target angle for the door
let doorOpenSpeed = Math.PI / 100; // Speed of opening (adjust as needed)
  if (window.doorPivot) {
    if (doorFullyOpen2) {
      scene.remove(glowMesh)
      if (window.doorPivot.rotation.y < Math.PI / 2) { // If not fully open
        window.doorPivot.rotation.y += doorOpenSpeed; // Incrementally increase angle
        if (window.doorPivot.rotation.y > Math.PI / 2) { // Clamp to fully open
            window.doorPivot.rotation.y = Math.PI / 2;
        }
    }
    } else {
      // Continue swinging
      window.doorPivot.rotation.y = Math.sin(elapsedTime) * Math.PI / 25;
    }

    window.doorPivot.position.y = 26; // Keep the door position consistent
  }



  /*
  // generate cubes in real time
  let numOfCubes = floor(random(1, 5));
  for (let i = 0; i < numOfCubes; i++) {
    let tCube = new Cube()
      .setPosition(0, 6, 0)
      .setVelocity(random(-0.05, 0.05), random(0.01, 0.05), random(-0.05, 0.05))
      .setRotationVelocity(random(-0.05, 0.05), random(-0.05, 0.05), random(-0.05, 0.05))
      .setScale(random(0.3, 0.6));
    cubes.push(tCube);
  }

  // update the cubes
  for (let c of cubes) {
    let gravity = createVector(0, -0.00005, 0);
    c.applyForce(gravity);
    c.move();
    c.rotate();
    c.age();
    c.update();
  }

  // remove the cubes that are done
  for (let i = 0; i < cubes.length; i++) {
    let c = cubes[i];
    if (c.isDone) {
      scene.remove(c.mesh);
      cubes.splice(i, 1);
      i--;
    }
  }

  // update the GUI
  params.cubes = cubes.length;
  params.scene_children = scene.children.length;
  */
}


///// UTILS /////

function getRoom() {
  const geometry = new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0);
  const materials = new THREE.LineBasicMaterial({
    color: 0xbcbcbc,
    transparent: true,
    opacity: 0.5,
  });
  const mesh = new THREE.LineSegments(geometry, materials);
  return mesh;
}
function getPlane() {
  const geometry = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2, 100, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });

  const plane = new THREE.Mesh(geometry, material);
  // plane.position.y = -WORLD_HALF / 4; // 设置平面高度
  plane.rotation.x = -Math.PI / 2;   // 将平面旋转以水平放置
  return plane;
}

function getFlash() {
  const distance = camera.near + 0.1; // Slightly in front of the camera
  const height = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance; // Screen height at near plane
  const width = height * camera.aspect; // Screen width at near plane

  // Create the flash plane
  const flashGeometry = new THREE.PlaneGeometry(10000,10000); // Match screen size
  const flashMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Pure white color
    // transparent: true,
    // opacity: flashOpacity, // Start fully transparent
  });
  flashPlane = new THREE.Mesh(flashGeometry, flashMaterial);
  flashPlane.rotation.x = -Math.PI / 2; // Place it horizontally
  flashPlane.position.y = 10; // Place it slightly above the scene
  flashPlane.position.y = 1000; // Place it slightly above the scene
  camera.add(flashPlane);
  // console.log("Flash plane added to scene:", flashPlane); // Debug
}



function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

class Cube {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = 1;
    //this.setMass(); // feel free to use this method; it arbitrarily defines the mass based on the scale.

    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();

    this.lifespan = 1.0;
    this.lifeReduction = random(0.005, 0.010);
    this.isDone = false;
    //
    this.mesh = getBox();
    // scene.add(this.mesh);
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);

    // console.log("position");
    // console.log(x,y,z);
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
    return this;
  }
  setScale(w, h = w, d = w) {
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    return this;
  }
  setMass(mass) {
    if (mass) {
      this.mass = mass;
    } else {
      this.mass = 1 + (this.scl.x * this.scl.y * this.scl.z) * 0.000001; // arbitrary
    }
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    if (this.mass > 0) {
      force.div(this.mass);
    }
    this.acc.add(force);
  }
  reappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
      this.pos.z = -WORLD_SIZE / 2;
    }
  }
  disappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
      this.isDone = true;
    }
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);

    let newScale = p5.Vector.mult(this.scl, this.lifespan);
    this.mesh.scale.set(newScale.x, newScale.y, newScale.z);
  }
}


let flashTimer = 0; // Track elapsed time for the flash
let flashActive = false;

function updateFlash(deltaTime) {
  if (flashActive) {
    if (flashOpacity < 1 && flashTimer < 1) {
      // Gradually increase opacity to 1 within 1 second
      flashOpacity += deltaTime;
      if (flashOpacity > 1) flashOpacity = 1; // Clamp to max
    } else if (flashTimer >= 1 && flashTimer < 6) {
      // Gradually fade opacity to 0 over 5 seconds
      flashOpacity -= deltaTime / 5;
      if (flashOpacity < 0) flashOpacity = 0; // Clamp to min
    }

    flashTimer += deltaTime;

    if (flashTimer >= 6) {
      // End the flash effect after 6 seconds
      flashActive = false;
      flashOpacity = 0;
      flashTimer = 0;
    }

    // Update the flash plane's material opacity
    if (flashPlane) {
      flashPlane.material.opacity = flashOpacity;
      console.log(flashPlane.material.opacity)
    }
  }
}