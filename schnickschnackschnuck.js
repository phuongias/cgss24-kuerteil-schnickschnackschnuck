/*const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);*/
// Quellen: shaders -> sparkles: https://www.shadertoy.com/results?query=sparkles

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
let spieler3 = null;
let background1 = null;
let background2 = null;
let background3 = null;

let spieler1Choice = null;
let spieler2Choice = null;


//Spieler kann nur einmal Schere Stein oder Papier ausführen -> nicht mehr notwendig
// da spieler bis zum countdown mehrfach drücken kann
/*let spieler1ActionExecuted = false;
let spieler2ActionExecuted = false;*/


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
    loadHandAnimation(path, animationName, handName, mixer, position, scale, rotation) {
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

    //Funktion, um Aktionswahl zu speichern
    choosesActionPlayer1(choice) {
        spieler1Choice = choice;
        checkCountdown();
    }

    choosesActionPlayer2(choice) {
        spieler2Choice = choice;
        checkCountdown();
    }
}


//default Faust Animation
function loadDefaultAnimation() {
    //links
    spieler1.loadHandAnimation('assets/tom/main_mirror_schnickschnack.glb', 'faust',
        'handRockDefault1', mixer2,
        [-5, 0, -3.5], //-5, 0, -2
        [0.1, 0.11, 0.1],
        [0,0,0]);

    //rechts
    spieler2.loadHandAnimation('assets/tom/main_schnickschnack.glb', 'faust',
        'handRockDefault2', mixer2,
        [5, 0.1, -3.4], //5, 0.1, -3.4
        [0.1, 0.11, 0.1],
        [0,-0.9,0]);


    background1.loadHandAnimation('assets/tom/schnick.glb', 'schnick',
        'schnickpick', mixer,
        [0, 0.1, -1],
        [0.1, 0.11, 0.1],
        [0,0,0])

    background2.loadHandAnimation('assets/tom/schnack.glb', 'schnack',
        'schnickpick', mixer,
        [0, 0.1, -2],
        [0.1, 0.11, 0.1],
        [0,0,0])

    background3.loadHandAnimation('assets/tom/only_schnuck_placeholder.glb', 'schnuck2',
        'schnickpick', mixer,
        [5, 0.1, -200],
        [0.1, 0.11, 0.1],
        [0,0,0])



}


//Methode um Stein, Papier oder Schere auszuführen
function makeActions() {
    if (spieler1Choice && spieler2Choice) {//wenn beide Spieler gedrückt haben

        spieler1.removeHandAnimation();
        findOutcome(); //resultat anzeigen TODO: globale Animationsnamen ändern, um "Gewinneranimationen" zu zeigen?

        switch (spieler1Choice) {
            //Spieler 1
            case 'q':
                spieler1.loadHandAnimation('assets/tom/neu/schereSpieler1.glb', 'schere',
                    'schere1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0,0,0]);
                break;
            case 'w':
                spieler1.loadHandAnimation('assets/tom/neu/steinSpieler1.glb', 'stein',
                    'handRockDefault1', mixer,
                    [-5, 0, -3.5], //-5, 0, -2
                    [0.1, 0.11, 0.1],
                    [0,0,0]);
                break;

            case 'e':
                spieler1.loadHandAnimation('assets/tom/neu/blattSpieler1.glb',
                    'papier', 'HandWave', mixer,
                    [-4.5, 0, -2], [0.1, 0.11, 0.1], [0, 0, 0]);
                break;


        }
        //Spieler 2
        spieler2.removeHandAnimation();//default Stein entfernen

        switch (spieler2Choice) {
            case 'i':
                spieler2.loadHandAnimation('assets/tom/schere_final.glb', 'schere',
                    'scissorsHand', mixer2,
                    [4.5, 0, -2], [0.1, 0.11, 0.1], [0, Math.PI, -20]);
                break;

            case 'o':
                spieler2.loadHandAnimation('assets/tom/stein.glb', 'stein',
                    'handRockDefault2', mixer2,
                    [4.5, 0, 0], [0.1, 0.11, 0.1], [-0.2, -2.3, -0.4]);
                break;

            case 'p':
                spieler2.loadHandAnimation('assets/tom/papier_final.glb', 'papier',
                    'HandWave', mixer2,
                    [4.5, 0, -2], [0.1, 0.11, 0.1], [0, 0, 20]);
                break;
        }
    }
    spieler1Choice = null;
    spieler2Choice = null;

}

function loadSchnuckAnimation() {
    background1.removeHandAnimation();
    background2.removeHandAnimation();
    //spieler1.removeHandAnimation();
    //spieler2.removeHandAnimation();
    background3.loadHandAnimation('assets/tom/only_schnuck.glb', 'schnuck',
        'schnickpick', mixer2,
        [0, 0.1, -6.5],
        [0.2, 0.11, 0.1],//0.15, 0.15, 0.15
        [0,0,0])
    //background3.mixer.update(delta);
}

//Countdown -Code
//Quelle: https://stackoverflow.com/questions/31106189/create-a-simple-10-second-countdown
//Quelle: https://stackoverflow.com/questions/74297160/stop-countdown-timer-at-0
//Quelle: https://stackoverflow.com/questions/31106189/create-a-simple-10-second-countdown
function startCountdown() {
    //var elem = document.getElementById('countdownHTML');
    loadSchnuckAnimation();
    let countdown = 1; //Countdowndauer
    let countdownInterval = null;
    countdownInterval = setInterval(() => {
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (spieler1Choice && spieler2Choice) {
                makeActions();

            } else {
                startCountdown();
            }
        } else {
            countdown--;
            //Countdown in HTML anzeigen -> funktioniert noch nicht lol -> muss noch in html datei

        }
    }, 100);
}

//Funktion um Countdown zu überprüfen, ob beide Spieler gewählt haben
function checkCountdown() {
    if (spieler1Choice && spieler2Choice) {
        startCountdown();

    }
}


function init() {

    spieler1 = new Spieler("Spieler 1 / links");
    spieler2 = new Spieler("Spieler 2 / rechts");
    spieler3 = new Spieler("Spieler 2 / rechts");
    background1 = new Spieler("awdawd");
    background2 = new Spieler("awdawd");
    background3 = new Spieler("awdawd");
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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);

    //zuerst wird faust angezeigt
    loadDefaultAnimation();


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


    });
}

//Animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    background1.mixer.update(delta);
    background2.mixer.update(delta);
    background3.mixer.update(delta);


    if (spieler1 && spieler1.mixer) {
        spieler1.mixer.update(delta);
    }

    if (spieler2 && spieler2.mixer) {
        spieler2.mixer.update(delta);

    }
    renderer.render(scene, camera);

}

//Funktion um Ergebnis zu finden
function findOutcome() {
    if (spieler1Choice && spieler2Choice) {

        if (spieler1Choice === 'q' && spieler2Choice === 'i') {
            //Schere vs Schere
            console.log('Unentschieden: Schere');

        } else if (spieler1Choice === 'w' && spieler2Choice === 'o') {
            //Stein vs Stein
            console.log('Unentschieden: beide Stein');

        } else if (spieler1Choice === 'e' && spieler2Choice === 'p') {
            //Paper vs Papier
            console.log('Unentschieden: beide Papier');

        } else if (spieler1Choice === 'q' && spieler2Choice === 'o') {
            //Spieler 1: SCHERE vs. Spieler 2: STEIN
            console.log('Spieler 2 gewinnt: Stein schlägt Schere');

        } else if (spieler1Choice === 'q' && spieler2Choice === 'p') {
            //Spieler 1: SCHERE vs. Spieler 2: PAPIER
            console.log('Spieler 1 gewinnt: Schere schneidet Papier');

        } else if (spieler1Choice === 'w' && spieler2Choice === 'i') {
            //Spieler 1: STEIN vs. Spieler 2: SCHERE
            console.log('Spieler 1 gewinnt: Stein schlägt Schere');

        } else if (spieler1Choice === 'w' && spieler2Choice === 'p') {
            //Spieler 1: STEIN vs. Spieler 2: SCHERE
            console.log('Spieler 2 gewinnt: Papier umhüllt Stein');

        } else if (spieler1Choice === 'e' && spieler2Choice === 'i') {
            //Spieler 1: PAPIER vs. Spieler 2: SCHERE
            console.log('Spieler 2 gewinnt: Schere schneidet Papier');

        } else if (spieler1Choice === 'e' && spieler2Choice === 'o') {
            //Spieler 1: PAPIER vs. Spieler 2: STEIN
            console.log('Spieler 1 gewinnt: Papier umhüllt Stein');
        }



    }

}


