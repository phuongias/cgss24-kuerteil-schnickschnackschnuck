

const canvas = document.querySelector(".webgl");
const scene= new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

let mixer; //für die Animation
let mixer2;

//HandWaveRight
const loader = new THREE.GLTFLoader();
loader.load('assets/paperHandAnimated.glb', (glb) => {
    console.log(glb)
    //const root = gltf.scene;
    //scene.add(root);
    const handWave = glb.scene;


    handWave.scale.set(0.1, 0.1, 0.1);
    handWave.rotation.set(0,0,20)
    handWave.position.set(5,0,-2)

    scene.add(handWave);

    mixer = new THREE.AnimationMixer(handWave);

    const clips = glb.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'HandWave'); //auswählen welche Animation abgespielt werden soll
    const action = mixer.clipAction(clip);
    action.play();

}, function (xhr){
    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
},function (error){
    console.log(error);
    console.log('An error happened');
})


//HandWaveLeft
const loader2 = new THREE.GLTFLoader();
loader2.load('assets/paperHandAnimated.glb', (glb) => {
    console.log(glb)
    //const root = gltf.scene;
    //scene.add(root);
    const handWaveLeft = glb.scene;


    handWaveLeft.scale.set(0.1, 0.1, 0.1);
    handWaveLeft.rotation.set(0,0,-20);
    handWaveLeft.position.set(-5,0,-2)

    scene.add(handWaveLeft);

    mixer2 = new THREE.AnimationMixer(handWaveLeft);

    const clips2 = glb.animations;
    const clip2 = THREE.AnimationClip.findByName(clips2, 'HandWave'); //auswählen welche Animation abgespielt werden soll
    const actionLeft = mixer2.clipAction(clip2);
    actionLeft.play();

}, function (xhr){
    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
},function (error){
    console.log(error);
    console.log('An error happened');
})

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2,2,5)
scene.add(light);


//Box als Test
/*const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: 'red'});
const boxMesh = new THREE.Mesh(geometry, material);

scene.add(boxMesh);*/

// Boilerplate Code
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0,1,2);
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;

const clock = new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    const delta = clock.getDelta()
    mixer.update(delta);
    mixer2.update(delta);
    renderer.render(scene,camera);
}

animate();