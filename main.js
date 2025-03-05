import { OrbitControls } from 'three/addons/controls/OrbitControls.js' 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js' //novo
import * as THREE from 'three'; 

// -------- Botões ----------
const botaoAutoRotate = document.getElementById("btn-autorotate");
const botaoCorWood = document.getElementById("btn-color-wood");
const botaoCorLightOak = document.getElementById("btn-color-light-oak");
const botaoCorWalnut = document.getElementById("btn-color-walnut");
const botaoCorMahogany = document.getElementById("btn-color-mahogany");
// const botaoMaterialWicker = document.getElementById("btn-material-wicker2");
// const botaoMaterialWood = document.getElementById("btn-material-wood");
const tirarPes = document.getElementById("btn-tirar-pes");


// --------------------------

let cor_antiga = null;
// let material_antigo = null;
let pes = null;

// --------------------------

const cena = new THREE.Scene();
cena.background = new THREE.Color( 0xeeeefa );

const width = 800
const height = 600

const meuCanvas = document.getElementById( 'meuCanvas' )
const renderer = new THREE.WebGLRenderer( { canvas: meuCanvas } )
renderer.setSize(width, height)
renderer.shadowMap.enabled = true

// criar uma camara... 
const camara = new THREE.PerspectiveCamera( 70, width / height, 0.01, 1000 ); 
camara.position.set(1.25,1.25,2);
camara.lookAt(0,0,0);

const controlos = new OrbitControls( camara, renderer.domElement);
controlos.maxDistance = 4;
controlos.update();


let raycaster = new THREE.Raycaster()
let rato = new THREE.Vector2()
let misturador = new THREE.AnimationMixer(cena);

let acaoPortaDir = null;
let acaoPortaEsq = null;
let acaoGavetaDir = null;
let acaoGavetaEsq = null;
const namesClickableObjects = ['Porta_L','Porta_R','Gaveta_L','Gaveta_R']
const namesChangableObjects = ['Porta_L','Porta_R','Gaveta_L','Gaveta_R','Pés','Tampo','Tampo2','Nicho']
const namePlane = 'Plane'
let clickableObjects = []
let changableObjects = []
let playedAnimation = [false,false,false,false]

let carregador = new GLTFLoader();
carregador.load(
    'vintageDesk.gltf',
    ( gltf ) => {
        cena.add(gltf.scene)

        let clipe1 = THREE.AnimationClip.findByName( gltf.animations, 'PortaDirAbrir.001' ) 
        // console.log(clipe1)
        acaoPortaDir = misturador.clipAction( clipe1 ) 

        let clipe2 = THREE.AnimationClip.findByName( gltf.animations, 'PortaEsqAbrir.001' ) 
        // console.log(clipe2)
        acaoPortaEsq = misturador.clipAction( clipe2 ) 

        let clipe3 = THREE.AnimationClip.findByName( gltf.animations, 'GavetaDirAbrir.001' ) 
        // console.log(clipe3)
        acaoGavetaDir = misturador.clipAction( clipe3 ) 

        let clipe4 = THREE.AnimationClip.findByName( gltf.animations, 'GavetaEsqAbrir.001' ) 
        // console.log(clipe4)
        acaoGavetaEsq = misturador.clipAction( clipe4 ) 

        let i=0;
        cena.traverse((x) => {
            if (x.isMesh) {
                x.castShadow = true
                x.receiveShadow = true
            }

            if (namesClickableObjects.includes(x.name)) {
                clickableObjects.push(x);
            }
            if (namesChangableObjects.includes(x.name)) {
                changableObjects.push(x);
                if (i===1) {
                    cor_antiga = x.material.color.clone();
                    // material_antigo = x.material.clone();
                    // console.log("Cor antiga: ");
                    // console.log(cor_antiga)
                    // console.log("Material_antigo");
                    // console.log(material_antigo);
                }
                i++;
            }
            if (x.name === namePlane) {
                x.visible = false;
            }
            if (x.name === "Pés") {
                pes = x;
            }

        })
        // console.log(clickableObjects)
        // console.log(changableObjects)
        
    }
)

// -------- Animar ----------
let delta = 0;
let relogio = new THREE.Clock();
const  latencia_minima = 1 / 60;

function animar() {
    requestAnimationFrame(animar);

    // delta += relogio.getDelta();    // acumula tempo que passou desde a ultima chamada de getDelta

    // if (delta  < latencia_minima)   // não exceder a taxa de atualização máxima definida
    //     return;                     

    controlos.update();
    renderer.render(cena,camara);

    misturador.update( relogio.getDelta() ) 
    // delta = delta % latencia_minima;// atualizar delta com o excedente
}

animar();
// --------------------------


// -------- Luzes ----------
function luzes(cena) {
    /* luzes... */
    const luzAmbiente = new THREE.AmbientLight( "lightgreen" )
    cena.add(luzAmbiente)
    
    /* point light */
    const luzPonto = new THREE.PointLight( "white" )
    luzPonto.position.set( 0, 2, 2)
    luzPonto.intensity= 15 		
    cena.add( luzPonto )

    /* directional light*/
    const luzDirecional = new THREE.DirectionalLight( "white" );
    luzDirecional.position.set( 3, 2, 0 ); //aponta na direção de (0, 0, 0)
    luzDirecional.intensity= 30
    cena.add( luzDirecional );
}

luzes(cena)
// --------------------------


// -------- Interceptar Objecto ----------
function pegarObjeto(clickableObjects) {
    raycaster.setFromCamera(rato, camara)
    let intersetados = raycaster.intersectObjects(clickableObjects);
    if (intersetados.length > 0) {
        // console.log("alvo : \n")
        if (intersetados[0].object.parent.name !== undefined) {
            // console.log(intersetados[0].object.parent.name)
            return intersetados[0].object.parent.name;
        }

    }
}
// --------------------------


// -------- Animações ----------

function playAnimation(name) {
    // console.log("Nome: " + name);
    switch (name) {
        case 'Porta_L':
            if (playedAnimation[0] === false) {
                acaoPortaEsq.clampWhenFinished = true;
                acaoPortaEsq.timeScale = 1.75;
                acaoPortaEsq.setLoop(THREE.LoopOnce)
                acaoPortaEsq.play();
                acaoPortaEsq.paused = false;
                // console.log(acaoPortaEsq.clampWhenFinished)
                playedAnimation[0] = true;
            } else {
                acaoPortaEsq.timeScale = -1.75;
                acaoPortaEsq.paused = false;
                playedAnimation[0] = false;
            }
            break;
        case 'Porta_R':
            if (playedAnimation[1] === false) {
                acaoPortaDir.clampWhenFinished = true;
                acaoPortaDir.timeScale = 1.75;
                acaoPortaDir.setLoop(THREE.LoopOnce)
                acaoPortaDir.play();
                acaoPortaDir.paused = false;
                // console.log(acaoPortaDir.clampWhenFinished)
                playedAnimation[1] = true;
            } else {
                acaoPortaDir.timeScale = -1.75;
                acaoPortaDir.paused = false;
                playedAnimation[1] = false;
            }
            break;

        case 'Gaveta_L':
            if (playedAnimation[2] === false) {
                acaoGavetaEsq.clampWhenFinished = true;
                acaoGavetaEsq.timeScale = 1.75;
                acaoGavetaEsq.setLoop(THREE.LoopOnce)
                acaoGavetaEsq.play();
                acaoGavetaEsq.paused = false;
                // console.log(acaoGavetaEsq.clampWhenFinished)
                playedAnimation[2] = true;
            } else {
                acaoGavetaEsq.timeScale = -1.75;
                acaoGavetaEsq.paused = false;
                playedAnimation[2] = false;
            }
            break;

        case 'Gaveta_R':
            if (playedAnimation[3] === false) {
                acaoGavetaDir.clampWhenFinished = true;
                acaoGavetaDir.timeScale = 1.75;
                acaoGavetaDir.setLoop(THREE.LoopOnce)
                acaoGavetaDir.play();
                acaoGavetaDir.paused = false;
                // console.log(acaoGavetaDir.clampWhenFinished)
                playedAnimation[3] = true;
            } else {
                acaoGavetaDir.timeScale = -1.75;
                acaoGavetaDir.paused = false;
                playedAnimation[3] = false;
            }
            break;
        default:
            // console.log("default case");
            break;
    }
    // console.log("Played Animations");
    // console.log(playedAnimation);
}
// --------------------------



// -------- Cor ----------

let corAtual = cor_antiga;
const colorLightOak = new THREE.Color(0xD2B48C);
const colorWalnut = new THREE.Color(0x8B4513);
const colorMahogany = new THREE.Color(0xC04000);

function mudarCor(name) {
    switch(name) {
        case "wood":
            changableObjects.forEach(obj => {
                obj.material.color = cor_antiga;
            });
            corAtual = cor_antiga;
            break;
        case "lightOak":
            changableObjects.forEach(obj => {
                obj.material.color = colorLightOak;
            });
            corAtual = colorLightOak;
            break;
        case "walnut":
            changableObjects.forEach(obj => {
                obj.material.color = colorWalnut;
            });
            corAtual = colorWalnut;
            break;
        case "mahogany":
            changableObjects.forEach(obj => {
                obj.material.color = colorMahogany;
            });
            corAtual = colorMahogany
            break;
        default:
            // console.log("Invalid color name");
            break;
    }
};
// --------------------------


// -------- Material (NOT WORKING) ----------
// const textureWood =  new THREE.TextureLoader().load('/model/materials/Wood_Normal_2K.png');
// const textureWicker =  new THREE.TextureLoader().load('/model/materials/Wicker2_Normal_1K.png');
// const materialWood = new THREE.MeshPhysicalMaterial({
//     color: cor_antiga,
//     map: textureWood,
// });
// const materialWicker = new THREE.MeshPhysicalMaterial({
//     color: cor_antiga,
//     map: textureWicker,
// });

// function mudarMaterial(name) {
//     switch(name) {
//         case "wicker":
//             changableObjects.forEach(obj => {
//                 obj.material.map = materialWicker;
//                 obj.material.color = corAtual;
//             });
//             // console.log("changed material");
//             // console.log(changableObjects);
//             break;
//         case "wood":
//             changableObjects.forEach(obj => {
//                 obj.material.map = materialWood;
//                 obj.material.color = corAtual;
//             });
//             // console.log("changed material");
//             // console.log(changableObjects);
//             break;
//         default:
//             // console.log("Invalid material name");
//             break;
//     }
// }
// --------------------------


// -------- EventListeners ----------
tirarPes.addEventListener("click", () => {
    // console.log(pes);
    if (pes.visible) {
        pes.visible = false;
    } else {
        pes.visible = true;
    }
});

botaoCorWood.addEventListener("click", () => {
    mudarCor("wood");
});
botaoCorLightOak.addEventListener("click", () => {
    mudarCor("lightOak");
});
botaoCorWalnut.addEventListener("click", () => {
    mudarCor("walnut");
});
botaoCorMahogany.addEventListener("click", () => {
    mudarCor("mahogany");
});

botaoAutoRotate.addEventListener("change", ()=> {
    if (botaoAutoRotate.checked) {
        controlos.autoRotate = 1;
    } else {
        controlos.autoRotate = 0;
    }
});

// botaoMaterialWicker.addEventListener("click", () => {
//     mudarMaterial("wicker");
// });

// botaoMaterialWood.addEventListener("click", () => {
//     mudarMaterial("wood");
// });

meuCanvas.addEventListener("click", (evento) => {
    const limites = evento.target.getBoundingClientRect();

    rato.x = 2 * (evento.clientX - limites.left) / parseInt(meuCanvas.style.width) - 1;
    rato.y = 1 - 2 * (evento.clientY - limites.top) / parseInt(meuCanvas.style.height);
    // console.log("x: " + rato.x + "\n" + "y: " + rato.y + "\n");
    let nomeObjeto = pegarObjeto(clickableObjects);
    playAnimation(nomeObjeto)
});
