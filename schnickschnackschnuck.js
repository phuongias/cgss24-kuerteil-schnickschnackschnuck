

const canvas = document.querySelector(".webgl");
const scene= new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

let mixer = null; //für die Animation
let mixer2 = null;

//Spieler Klasse um die Animationen zu laden
class Spieler {
    constructor(name) {
        this.name = name;
        this.mixer = null;
    }

    //Methode zum Laden der Handanimation
    loadHandAnimation(url, animationName,handName,mixer,mirror,flipX,flipY,position, scale, rotation) {
        const loader = new THREE.GLTFLoader();
        loader.load(url, (glb) => {
            console.log(glb);
            this.handName = glb.scene;

            //Spiegelung der Hand, wenn true -> funktioniert noch nicht
            //https://stackoverflow.com/questions/28630097/flip-mirror-any-object-with-three-js
            //https://discourse.threejs.org/t/flipped-normals-after-using-scale-x-to-1-mirror-effect/58392
            if (mirror) {
                const mirrorScale = new THREE.Vector3(1, 1, 1);
                if (flipX) {
                    mirrorScale.x *= -1;
                }
                if (flipY) {
                    mirrorScale.y *= -1;  // Änderung von z zu y
                }

                this.handName.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.scale.multiply(mirrorScale);

                        if (flipX || flipY) {
                            child.geometry = child.geometry.clone(); // Klonen der Geometrie
                            child.geometry.scale(mirrorScale.x, mirrorScale.y, mirrorScale.z);
                            child.geometry.computeVertexNormals();
                        }
                    }
                });
            }


            this.handName.scale.set(...scale);
            this.handName.rotation.set(...rotation);
            this.handName.position.set(...position);
            scene.add(this.handName);
            this.mixer = new THREE.AnimationMixer(this.handName);
            const clips = glb.animations;
            const clip = THREE.AnimationClip.findByName(clips, animationName);
            const action = this.mixer.clipAction(clip);
            action.play();
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (error) {
            console.log(error);
            console.log('An error happened');
        });
    }
}


//wenn man vorzeichen bei roation ändert, dann dreht sich


//Spieler1 -> momentan rechts
const spieler1 = new Spieler("Spieler 1");
spieler1.loadHandAnimation('assets/paperHandAnimated.glb',
    'HandWave','handWave', mixer,false,true,false,[5, 0, -2],
    [0.1, 0.11, 0.1], [0, 0,20]);

//Spieler1 -> momentan rechts -> Stein (sieht aber nicht schön aus)
const spieler2 = new Spieler("Spieler 2");
spieler2.loadHandAnimation('assets/handRockTest.glb', 'HandRock',
    'handRock',mixer2,false,false,true,[-5, 0, -4],
    [0.1, 0.11, 0.1], [0, Math.PI,-20]);

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

    //mixer-Updates
    if (spieler1.mixer) spieler1.mixer.update(delta);
    if (spieler2.mixer) spieler2.mixer.update(delta);
    renderer.render(scene,camera);
}

animate();