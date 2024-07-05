/*const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);*/

document.addEventListener('DOMContentLoaded', function () {
    init();
    animate();
});

let mixer = null;
let mixer2 = null;

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({canvas: canvas});
const light = new THREE.DirectionalLight(0xffffff, 1);

let spieler1 = null;
let spieler2 = null;

//Spieler kann nur einmal Schere Stein oder Papier ausführen
let spieler1ActionExecuted = false;
let spieler2ActionExecuted = false;


//Spieler Klasse
class Spieler {
    constructor(name) {
        this.name = name;
        this.mixer = null;
        /*this.mixer = new THREE.AnimationMixer();*/
        this.handName = null;
    }

    //Methode zum Laden der Handanimation
    //Quelle: https://youtu.be/yPA2z7fl4J8?si=F7DOcu4_3Tney-4F -> Load 3D Object from blender in Three.js
    //Quelle: https://youtu.be/GByT8ActvDk?si=C7BWX5MIsQl_UmwL -> Load Animation frm blender in Three.js
    loadHandAnimation(url, animationName, handName, mixer, mirror, flipX, flipY, position, scale, rotation) {
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
                            child.geometry = child.geometry.clone();
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


    //Methode um Default Stein Movement zu löschen, um andere Aktion auszuführen
    removeHandAnimation() {
        if (this.handName) {
            scene.remove(this.handName);
            this.handName = null;
        }
    }

    //Methode um Stein, Papier oder Schere auszuführen
    choosesActionPlayer1(choice) {
        if (choice === "q") { //i = schere
            this.removeHandAnimation();
            this.loadHandAnimation('assets/handScissorsAnimated.glb',
                'ScissorsHand',
                'handRock', mixer,
                false, false, true, [-4.5, 0, -2],
                [0.1, 0.11, 0.1], [0, 0, -20]);
        }

        if (choice === "w") { //o = rock/stein
            this.removeHandAnimation();
            this.loadHandAnimation('assets/handRockTest.glb', 'HandRock',
                'handRockDefault1', mixer,
                false, false, true, [-4.5, 0, -2],
                [0.1, 0.11, 0.1], [0, 0, -20]);
        }

        if (choice === "e") { //p = paper
            this.removeHandAnimation();
            this.loadHandAnimation('assets/paperHandAnimated.glb',
                'HandWave', 'handWave',
                mixer, false, true, true, [-4.5, 0, -2],
                [0.1, 0.11, 0.1], [0, 0, -20]);
        }
    }


    choosesActionPlayer2(choice2) {
        if (choice2 === "i") { //i = schere
            this.removeHandAnimation();
            this.loadHandAnimation('assets/handScissorsAnimated.glb', 'ScissorsHand',
                'scissorsHand',mixer2, false,
                false, false, [4.5, 0, -2],
                [0.1, 0.11, 0.1], [0, Math.PI, -20]);
        }

        if (choice2 === "o") { //o = rock/stein
            this.removeHandAnimation();
            this.loadHandAnimation('assets/handRockTest.glb', 'HandRock',
                'handRockDefault2', mixer2, false,
                false, false, [4.5, 0, -2],
                [0.1, 0.11, 0.1], [0, Math.PI, -20]);
        }

        if (choice2 === "p") { //p = paper -> OK
            //wenn Spieler Aktion ausführt, dann wird default Animation gelöscht
            this.removeHandAnimation();
            this.loadHandAnimation('assets/paperHandAnimated.glb',
                'HandWave', 'handWave', mixer2, false,
                false, false, [4.5, 0, -2],
                [0.1, 0.11, 0.1], [0, 0, 20]);
        }
    }

}


function init() {

    spieler1 = new Spieler("Spieler 1 / links");
    spieler2 = new Spieler("Spieler 2 / rechts")

    // Setup Three.js environment: scene, camera, renderer
    //const canvas = document.querySelector(".webgl");
    //const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    //const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1, 2);
    scene.add(camera);

    //const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.gammaOutput = true;

    //Lighting
    light.position.set(2, 2, 5);
    scene.add(light);

    //Licht
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    loadDefaultAnimation();


    //default Stein Animation
    function loadDefaultAnimation() {
        spieler1.loadHandAnimation('assets/handRockTest.glb', 'HandRock',
            'handRockDefault1', mixer,
            false, false, true, [-5, 0, -2],
            [0.1, 0.11, 0.1], [0, 0, -20]);

        spieler2.loadHandAnimation('assets/handRockTest.glb', 'HandRock',
            'handRockDefault2', mixer2, false,
            false, false, [4.5, 0, -2],
            [0.1, 0.11, 0.1], [0, Math.PI, -20]);
    }

    //Countdown
    //Quelle: https://stackoverflow.com/questions/31106189/create-a-simple-10-second-countdown

    function startCountdown() {


    }


    //Event listener für Keyboard Input
    //Quelle: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
    document.addEventListener('keydown', (event) => {

        const key = event.key.toLowerCase(); //taste wird abgespeichert

            //Spieler 1
            if (key === 'q') {
                //Schere
                spieler1.choosesActionPlayer1('q');
            } else if (key === 'w') {
                //Papier
                spieler1.choosesActionPlayer1('w');
            } else if (key === 'e') {
                //Stein
                spieler1.choosesActionPlayer1('e');
            }

            //Spieler 2
            if (key === 'i' ) {
                //schere
                spieler2.choosesActionPlayer2('i');
            } else if (key === 'o') {
                //stein
                spieler2.choosesActionPlayer2('o');
            } else if (key === 'p') {
                //papier
                spieler2.choosesActionPlayer2('p');
            }

    });
}


//Animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (spieler1 && spieler1.mixer) {
        spieler1.mixer.update(delta);
    }
    if (spieler2 && spieler2.mixer) {
        spieler2.mixer.update(delta);
    }
    renderer.render(scene, camera);
}

