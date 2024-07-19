// Fonts: https://www.dafont.com/regular-day.font
// Fonts: https://www.dafont.com/bridgers-brush.font
// Fonts: https://www.dafont.com/longevity-2.font


document.addEventListener('DOMContentLoaded', function () {
    onWindowResize();
    init();
    animate();
});

window.addEventListener('resize', onWindowResize, false);

let isGameOver = false;
let mixer = null;
let wantsReset = false;


const clock = new THREE.Clock();
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({canvas: canvas});
const light = new THREE.DirectionalLight(0xffffff, 1);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const fontLoader = new THREE.FontLoader();


let spieler1 = null;
let spieler2 = null;
let spieler3 = null;
let background1 = null;
let background2 = null;
let background3 = null;

let spieler1Choice = null;
let spieler1Animation = null;
let spieler2Choice = null;
let spieler2Animation = null;

let spieler1score = 0;
let spieler2score = 0;

let currentResultTextMesh = null;
let currentRestartTextMesh = null;


//Spieler Klasse
class DreiDObjekt {
    countdown = new Countdown();

    constructor(name) {
        this.name = name;
        this.mixer = null;
        this.handName = null;
    }

    //Methode zum Laden der Handanimation
    //Quelle: https://youtu.be/yPA2z7fl4J8?si=F7DOcu4_3Tney-4F -> Load 3D Object from blender in Three.js
    //Quelle: https://youtu.be/GByT8ActvDk?si=C7BWX5MIsQl_UmwL -> Load Animation frm blender in Three.js

    loadAnimationSchnax(path, animationName, handName, mixer, position, scale, rotation) {
        const loader = new THREE.GLTFLoader();
        loader.load(path, (glb) => {
            console.log(glb);
            this.handName = glb.scene;

            this.handName.scale.set(...scale);
            this.handName.rotation.set(...rotation);
            this.handName.position.set(...position);
            scene.add(this.handName);
            this.mixer = new THREE.AnimationMixer(this.handName);
            const clips = glb.animations;
            const clip = THREE.AnimationClip.findByName(clips, animationName);
            const action = this.mixer.clipAction(clip);
            action.play();
            const textureLoader = new TextureLoader();
            const texture = textureLoader.load('./assets/pakettextur.jpg', (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.needsUpdate = true;
            });
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({map: texture});
                }
            });
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (error) {
            console.log(error);
            console.log('An error happened');
        });
    }

    //Methode um Animationen entfernen zu können -> zb bei default Animation
    removeAnimation() {
        if (this.handName) {
            scene.remove(this.handName);
            this.handName = null;
        }
    }

    //Funktion, um Aktionswahl zu speichern

    choosesActionPlayer1(choice) {
        spieler1Choice = choice;
        this.countdown.checkCountdown();
    }

    choosesActionPlayer2(choice) {
        spieler2Choice = choice;
        this.countdown.checkCountdown();
    }
}


//default Faust Animation
function loadDefaultAnimation() {

    //links
    spieler1.loadAnimationSchnax('assets/animations/main_mirror_schnickschnack.glb', 'faust',
        'handRockDefault1', mixer,
        [-5, -0.7, -3.5], //-5, 0, -2
        [0.1, 0.11, 0.1],
        [0, 0, 0]);

    //rechts
    spieler2.loadAnimationSchnax('assets/animations/main_schnickschnack.glb', 'faust',
        'handRockDefault2', mixer,
        [5, -0.7, -3.4], //5, 0.1, -3.4
        [0.1, 0.11, 0.1],
        [0, -0.9, 0]);


    background1.loadAnimationSchnax('assets/animations/neu/bg_schnick.glb', 'schnick',
        'schnickpick', mixer,
        [0, 0.15, 0],
        [1, 1, 1],
        [0, 0, 0])

    background2.loadAnimationSchnax('assets/animations/neu/bg_schnack.glb', 'schnack',
        'schnickpick', mixer,
        [0, -0.05, 0],
        [1, 1, 1],
        [0, 0, 0])

    background3.loadAnimationSchnax('assets/animations/neu/only_schnuck_placeholder.glb', 'schnuck2',
        'schnickpick', mixer,
        [5, 0.1, -200],
        [0.1, 0.11, 0.1],
        [0, 0, 0])


}


//Methode um Stein, Papier oder Schere auszuführen
function makeActions() {
    if (spieler1Choice && spieler2Choice) {//wenn beide Spieler gedrückt haben

        spieler1.removeAnimation();
        switch (spieler1Animation) {

            //#######   Spieler 1       #########
            //#######   SAME            #########

            case 'schere_SAME':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Schere_SAME.glb', 'schere',
                    'schere1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;
            case 'stein_SAME':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Stein_SAME.glb', 'stein',
                    'handRockDefault1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            case 'papier_SAME':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Papier_SAME.glb', 'papier',
                    'HandWave', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            //#######   Spieler 1       #########
            //#######   WIN             #########

            case 'schere_WIN':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Schere_WIN.glb', 'schere',
                    'schere1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;
            case 'stein_WIN':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Stein_WIN.glb', 'stein',
                    'handRockDefault1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            case 'papier_WIN':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Papier_WIN.glb', 'papier',
                    'HandWave', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            //#######   Spieler 1       #########
            //#######   LOSS            #########

            case 'schere_LOSS':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Schere_LOSS.glb', 'schere',
                    'schere1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;
            case 'stein_LOSS':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Stein_LOSS.glb', 'stein',
                    'handRockDefault1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            case 'papier_LOSS':
                spieler1.loadAnimationSchnax('assets/animations/neu/s1_Papier_LOSS.glb', 'papier',
                    'HandWave', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

        }


        spieler2.removeAnimation();
        switch (spieler2Animation) {

            //#######   Spieler 2       #########
            //#######   SAME            #########

            case 'schere_SAME':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Schere_SAME.glb', 'schere',
                    'scissorsHand', mixer,
                    [5, 0, -3.4], //position
                    [0.1, 0.11, 0.1], //size
                    [0, 0, 0]); //rotation
                break;

            case 'stein_SAME':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Stein_SAME.glb', 'stein',
                    'handRockDefault2', mixer,
                    [5, 0.1, -3.4], //5, 0.1, -3.4
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            case 'papier_SAME':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Papier_SAME.glb', 'papier',
                    'HandWave', mixer,
                    [5, 0.1, -3.4], //5, 0.1, -3.4
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            //#######   Spieler 2       #########
            //#######   WIN             #########

            case 'schere_WIN':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Schere_WIN.glb', 'schere',
                    'scissorsHand', mixer,
                    [5, 0, -3.4], //position
                    [0.1, 0.11, 0.1], //size
                    [0, 0, 0]); //rotation
                break;

            case 'stein_WIN':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Stein_WIN.glb', 'stein',
                    'handRockDefault2', mixer,
                    [5, 0.1, -3.4], //5, 0.1, -3.4
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            case 'papier_WIN':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Papier_WIN.glb', 'papier',
                    'HandWave', mixer,
                    [5, 0.1, -3.4], //5, 0.1, -3.4
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            //#######   Spieler 2       #########
            //#######   LOSS            #########

            case 'schere_LOSS':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Schere_LOSS.glb', 'schere',
                    'scissorsHand', mixer,
                    [5, 0, -3.4], //position
                    [0.1, 0.11, 0.1], //size
                    [0, 0, 0]); //rotation
                break;

            case 'stein_LOSS':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Stein_LOSS.glb', 'stein',
                    'handRockDefault2', mixer,
                    [5, 0.1, -3.4], //5, 0.1, -3.4
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;

            case 'papier_LOSS':
                spieler2.loadAnimationSchnax('assets/animations/neu/s2_Papier_LOSS.glb', 'papier',
                    'HandWave', mixer,
                    [5, 0.1, -3.4], //5, 0.1, -3.4
                    [0.1, 0.11, 0.1],
                    [0, 0, 0]);
                break;


        }


    }
    spieler1Choice = null;
    spieler2Choice = null;

    isGameOver = true;

}

function loadSchnuckAnimation() {
    background1.removeAnimation();
    background2.removeAnimation();
    background3.removeAnimation();
    //spieler1.removeAnimation();
    //spieler2.removeAnimation();
    background3.loadAnimationSchnax('assets/animations/neu/bg_schnuck.glb', 'schnuck',
        'schnickpick', mixer,
        [0, 0, -7],
        [0.15, 0.15, 0.15],//0.15, 0.15, 0.15
        [0, 0, 0])
    //background3.mixer.update(delta);
}

class Countdown {
//Countdown -Code
//Quelle: https://stackoverflow.com/questions/31106189/create-a-simple-10-second-countdown
    startCountdown() {
        loadSchnuckAnimation();
        let countdown = 1; //Countdowndauer
        let countdownInterval = null;
        countdownInterval = setInterval(() => {
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                if (spieler1Choice && spieler2Choice) {
                    findOutcome();
                    makeActions();

                } else {
                    this.startCountdown();
                }
            } else {
                countdown--;

            }
        }, 100);
    }

//Funktion um Countdown zu überprüfen, ob beide Spieler gewählt haben
    checkCountdown() {
        if (spieler1Choice && spieler2Choice) {
            this.startCountdown();
        }
    }
}

class Result {
//Funktion um Ergebnis anzuzeigen mit FontLoader
//Quelle: https://www.youtube.com/watch?v=IA3HjAV2nzU
//Quelle: https://threejs.org/docs/#examples/en/loaders/FontLoader
    constructor() {
    }

    showResult(text) {
        this.removeCurrentResult();
        fontLoader.load('assets/fonts/regularDay.json', (font) => {
            const textGeometry = new THREE.TextGeometry(text, {
                font: font,
                size: 0.35,
                //Tiefe des Textes -> Text hat keine Tiefe bei 0 (für 2D in 3D Szene)
                height: 0.05,
                //Anzahl der Kurvensegmente -> je höher desto glattere Kurven
                curveSegments: 1,
            })
            const textMaterial = new THREE.MeshPhongMaterial({color: '#f06305'});
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            textMesh.castShadow = true; // Schattensetzung aktivieren
            textMesh.receiveShadow = true; // Schatten empfangen aktivieren
            textMesh.position.set(-3.35, 3, -2.3);
            textMesh.rotation.y = 0;

            textMesh.castShadow = true; // Schatten
            textMesh.position.set(-3.35, 3, -1.3);
            textMesh.rotation.y = 0;

            scene.add(textMesh);

            currentResultTextMesh = textMesh;

        });
    }

    //Funktion, um Result zu löschen, für nächstes Spiel
    removeCurrentResult() {
        if (currentResultTextMesh) {
            scene.remove(currentResultTextMesh);
            currentResultTextMesh = null;
        }
    }

    //Funktion um Restart anzuzeigen
    showRestartNotice(resetText) {
        fontLoader.load('assets/fonts/regularDay.json', (font) => {
            const textGeometry = new THREE.TextGeometry(resetText, {
                font: font,
                size: 0.2,
                //Tiefe des Textes -> Text hat keine Tiefe bei 0 (für 2D in 3D Szene)
                height: 0.02,
                //Anzahl der Kurvensegmente -> je höher desto glattere Kurven
                curveSegments: 1,
            })

            const textMaterial = new THREE.MeshPhongMaterial({color: 'black'}/*MeshBasicMaterial({ color: 0x00ffff }*/);
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            textMesh.castShadow = true; //schatten
            textMesh.receiveShadow = true;
            textMesh.position.set(-2.35, 2, -1.3);
            textMesh.rotation.y = 0;
            scene.add(textMesh);

            currentRestartTextMesh = textMesh;



        });


    }

    removeRestartNotice() {
        if (currentRestartTextMesh) {
            scene.remove(currentRestartTextMesh);
            currentRestartTextMesh = null;
        }
    }
}


//Score Klasse, um Punkte anzuzeigen
class Score {
    constructor() {
    }

    updateScoreDisplay() {
        document.getElementById('spieler1score').textContent = spieler1score;
        document.getElementById('spieler2score').textContent = spieler2score;
    }

    addScorePlayer1() {
        spieler1score++;
        console.log('Punkte Spieler1 :' + spieler1score);

        this.updateScoreDisplay();
    }

    addScorePlayer2() {
        spieler2score++;
        console.log('Punkte Spieler2 :' + spieler2score);
        this.updateScoreDisplay();
    }

    resetScores() {
        spieler2score = 0;
        spieler1score = 0;
        console.log('Reset. Punkte Spieler1 :' + spieler1score);
        console.log('Reset. Punkte Spieler2 :' + spieler2score);
        this.updateScoreDisplay();
    }


}


const result = new Result();
const score = new Score();

//Funktion, um einzelnes Spiel zurückzusetzen
function resetStage() {
    console.log("Stage resetted");

    spieler1.removeAnimation();
    spieler2.removeAnimation();
    background1.removeAnimation();
    background2.removeAnimation();
    background3.removeAnimation();

    result.removeCurrentResult();
    result.removeRestartNotice();

    spieler1Choice = null;
    spieler2Choice = null;

    currentRestartTextMesh = null;
    currentResultTextMesh = null;

    isGameOver = false;


    loadDefaultAnimation();

}


//Funktion um Ergebnis zu finden
function findOutcome() {
    let resultMessage;
    let Spieler2WinMessage = '\n              Spieler 2\n          hat gewonnen!';
    let Spieler1WinMessage = '\n              Spieler 1\n          hat gewonnen!'
    let UnentschiedenMessage = '\n\n          Unentschieden!'


    if (spieler1Choice && spieler2Choice) {

        if (spieler1Choice === 'q' && spieler2Choice === 'i') {
            //Schere vs Schere
            console.log('Unentschieden: Schere');
            spieler1Animation = 'schere_SAME';
            spieler2Animation = 'schere_SAME';
            resultMessage = UnentschiedenMessage;


        } else if (spieler1Choice === 'w' && spieler2Choice === 'o') {
            //Stein vs Stein
            console.log('Unentschieden: beide Stein');
            spieler1Animation = 'stein_SAME';
            spieler2Animation = 'stein_SAME';
            resultMessage = UnentschiedenMessage;


        } else if (spieler1Choice === 'e' && spieler2Choice === 'p') {
            //Paper vs Papier
            console.log('Unentschieden: beide Papier');
            spieler1Animation = 'papier_SAME';
            spieler2Animation = 'papier_SAME';
            resultMessage = UnentschiedenMessage;


        } else if (spieler1Choice === 'q' && spieler2Choice === 'o') {
            //Spieler 1: SCHERE vs. Spieler 2: STEIN
            console.log('Spieler 2 gewinnt: Stein schlägt Schere');
            spieler1Animation = 'schere_LOSS';
            spieler2Animation = 'stein_WIN';
            resultMessage = Spieler2WinMessage;
            score.addScorePlayer2();


        } else if (spieler1Choice === 'q' && spieler2Choice === 'p') {
            //Spieler 1: SCHERE vs. Spieler 2: PAPIER
            console.log(' Spieler 1 gewinnt: Schere schneidet Papier');
            spieler1Animation = 'schere_WIN';
            spieler2Animation = 'papier_LOSS';
            resultMessage = Spieler1WinMessage;
            score.addScorePlayer1();


        } else if (spieler1Choice === 'w' && spieler2Choice === 'i') {
            //Spieler 1: STEIN vs. Spieler 2: SCHERE
            console.log('Spieler 1 gewinnt: Stein schlägt Schere');
            spieler1Animation = 'stein_WIN';
            spieler2Animation = 'schere_LOSS';
            resultMessage = Spieler1WinMessage;
            score.addScorePlayer1();


        } else if (spieler1Choice === 'w' && spieler2Choice === 'p') {
            //Spieler 1: STEIN vs. Spieler 2: PAPIER
            console.log('Spieler 2 gewinnt: Papier umhüllt Stein');
            spieler1Animation = 'stein_LOSS';
            spieler2Animation = 'papier_WIN';
            resultMessage = Spieler2WinMessage;
            score.addScorePlayer2();

            //Angepasst
        } else if (spieler1Choice === 'e' && spieler2Choice === 'i') {
            //Spieler 1: PAPIER vs. Spieler 2: SCHERE
            console.log('Spieler 2 gewinnt: Schere schneidet Papier');
            spieler1Animation = 'papier_LOSS'; //papier
            spieler2Animation = 'schere_WIN';  //Schere
            resultMessage = Spieler2WinMessage;
            score.addScorePlayer2();


        } else if (spieler1Choice === 'e' && spieler2Choice === 'o') {
            //Spieler 1: PAPIER vs. Spieler 2: STEIN
            console.log('Spieler 1 gewinnt: Papier umhüllt Stein');
            spieler1Animation = 'papier_WIN';
            spieler2Animation = 'stein_LOSS';
            resultMessage = Spieler1WinMessage;
            score.addScorePlayer1();
        }
        //Quelle: https://stackoverflow.com/questions/16873323/javascript-sleep-wait-before-continuing
        setTimeout(function () {
            result.showResult(resultMessage);
        }, 2300);

        //Quelle: https://stackoverflow.com/questions/16873323/javascript-sleep-wait-before-continuing
        setTimeout(function(){
            result.showRestartNotice("\n\n\n\n\n\n\n\n\n\n\n\nDrücke M, um eine weitere Runde zu starten. \nDrücke X, um die Punkte zurückzusetzen.");
        }, 3300);

    }

}


//Quelle: https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
//Fenster scalable machen
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//GUI für die Kamera-Einstellung
function guiControlFunction(camera, renderer) {
    const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.noZoom = false;
    orbitControls.noPan = false;
    orbitControls.staticMoving = true;
    orbitControls.enabled = false

    //GUI für die Kamera
    let controls = new function () {
        this.freeCamera = false;
        this.frontView = function () {
            camera.position.set(0, 0, 3);
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            camera.updateProjectionMatrix();

        };
    };

    //Quelle: https://discourse.threejs.org/t/how-to-update-a-guis-display-from-an-objects-properties/27578
    //Quelle: https://threejs.org/docs/#examples/en/controls/OrbitControls
    let gui = new dat.GUI();
    gui.add(controls, 'freeCamera').onChange(function (e) {
        orbitControls.enabled = e;
    }).name("Kamera\ bewegen");
    gui.add(controls, 'frontView').name("zurücksetzen")

    //gui position im bild
    gui.domElement.style.position = 'fixed'
    gui.domElement.style.bottom = '0';
    gui.domElement.style.right = '0';

}


function init() {

    spieler1 = new DreiDObjekt("Spieler 1 / links");
    spieler2 = new DreiDObjekt("Spieler 2 / rechts");
    spieler3 = new DreiDObjekt("Spieler 2 / rechts");
    background1 = new DreiDObjekt("awdawd");
    background2 = new DreiDObjekt("awdawd");
    background3 = new DreiDObjekt("awdawd");
    let score = new Score();
    //Hintergrundbild
    const loader = new THREE.TextureLoader();
    loader.load('assets/bilder/hintergrund1_berb2.jpg', function(texture) {
        //Textur als Hintergrund setzen
        scene.background = texture;
    });




    camera.position.set(0, 0, 3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    //WebGL Renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.gammaOutput = true;

    //Licht
    light.position.set(2, 2, 5);
    scene.add(light);
    scene.add(directionalLight);

    guiControlFunction(camera, renderer);

    //zuerst wird faust angezeigt
    loadDefaultAnimation();
    score.updateScoreDisplay();


    //Event listener für Keyboard Input
    //Quelle: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase(); //taste wird abgespeichert


        //Restart Game
        if (!isGameOver) {
            wantsReset = false;
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
            if (key === 'i') {
                //schere
                spieler2.choosesActionPlayer2('i');
            } else if (key === 'o') {
                //stein
                spieler2.choosesActionPlayer2('o');
            } else if (key === 'p') {
                //papier
                spieler2.choosesActionPlayer2('p');
            }
        } else if (key === 'm') {
            resetStage();
        } else if (key === 'x') {
            wantsReset = true;
            result.removeRestartNotice();
            result.showRestartNotice("\n\n\n\n\n\n\n\n\n\n\n\n\nDrücke Y, um Punktereset zu bestätigen. \n\nDrücke M, um die Punkte zu behalten.)");
            document.addEventListener('keydown', (reset) => {
                const key = reset.key.toLowerCase();
                if (key === 'y' && wantsReset) {
                    score.resetScores();
                    resetStage();
                }
            });
        }


    });


}


//Animation loop
function animate() {

    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (background1 && background1.mixer) {
        background1.mixer.update(delta);
    }
    if (background2 && background2.mixer) {
        background2.mixer.update(delta);
    }

    if (background3 && background3.mixer) {
        background3.mixer.update(delta);
    }

    if (spieler1 && spieler1.mixer) {
        spieler1.mixer.update(delta);
    }

    if (spieler2 && spieler2.mixer) {
        spieler2.mixer.update(delta);

    }


    renderer.render(scene, camera);

}



