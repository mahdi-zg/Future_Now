import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from '../../services/chat.service';

////////////////////////////////////////////////////////////////////////////////
// Les “facialExpressions” (conservez-les telles que dans votre projet)
////////////////////////////////////////////////////////////////////////////////
const facialExpressions: any = {
  default: {
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    browInnerUp: 0.1,
    eyeSquintLeft: 0.1,
    eyeSquintRight: 0.1
  },
  smile: {
    mouthSmileLeft: 0.5,
    mouthSmileRight: 0.5,
    browInnerUp: 0.2,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2
  },
  serious: {
    browDownLeft: 0.4,
    browDownRight: 0.4,
    mouthPressLeft: 0.2,
    mouthPressRight: 0.2,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3
  },
  thoughtful: {
    browInnerUp: 0.3,
    mouthFrownLeft: 0.2,
    mouthFrownRight: 0.2,
    eyeLookDownLeft: 0.2,
    eyeLookDownRight: 0.2
  },
  surprised: {
    browInnerUp: 0.5,
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.3
  }
};

////////////////////////////////////////////////////////////////////////////////
// Interface pour chaque MouthCue
////////////////////////////////////////////////////////////////////////////////
interface MouthCue {
  start: number;
  end: number;
  value: string;
}

////////////////////////////////////////////////////////////////////////////////
// Mapping des visèmes (A, B, C, D, E, F, G, H, X)
////////////////////////////////////////////////////////////////////////////////
const corresponding: any = {
  A: 'viseme_PP',
  B: 'viseme_kk',
  C: 'viseme_I',
  D: 'viseme_AA',
  E: 'viseme_O',
  F: 'viseme_U',
  G: 'viseme_FF',
  H: 'viseme_TH',
  X: 'viseme_PP'
};

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('rendererCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clock = new THREE.Clock();
  private loader = new GLTFLoader();
  
  private animationFrameId!: number;
  private chatSub!: Subscription;

  // Message courant (audio, lipsync, etc.)
  private currentMessage: ChatMessage | null = null;
  private audio?: HTMLAudioElement;

  // Pour le blink
  private blinkTime = 0;

  // Référence du mesh de l'avatar (configuration originale)
  private avatarMesh?: THREE.Object3D;

  // Animation Idle
  private mixer?: THREE.AnimationMixer;
  private idleAction?: THREE.AnimationAction;

  // setupMode si besoin
  private setupMode = false;
  private avatarCache: Map<string, THREE.Group> = new Map();

  constructor(private chatService: ChatService) {}

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();

    // Abonnement aux messages du ChatService
    this.chatSub = this.chatService.currentMessage$.subscribe(msg => {
      this.currentMessage = msg;
      if (msg?.audio) {
        this.playAudio(msg.audio);
      }
    });

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelPath'] && !changes['modelPath'].firstChange) {
      console.log("🔁 Nouveau modelPath détecté :", this.modelPath);
      this.reloadAvatar(); // 🔁 Recharge dynamiquement le modèle
    }
  
    if (changes['backgroundColor'] && this.scene) {
      console.log("🎨 Mise à jour de la couleur du fond :", this.backgroundColor);
      this.scene.background = new THREE.Color(this.backgroundColor); // ✅ Update dynamique
    }
  }
  
  
  @Input() backgroundColor: string = '#0a1f44'; // couleur par défaut
  @Input() modelPath: string = 'assets/models/animations1.glb';
  reloadAvatar(): void {
    if (!this.modelPath) {
      console.warn("🚫 Aucun modelPath fourni — avatar non chargé.");
      return;
    }
  
    if (this.avatarMesh) {
      this.scene.remove(this.avatarMesh);
      this.avatarMesh = undefined;
    }
  
    console.log("📦 Rechargement du modèle 3D :", `assets/models/${this.modelPath}`);
  
    this.loader.load(`assets/models/${this.modelPath}`, gltf => {
      this.avatarMesh = gltf.scene;
      this.avatarMesh.position.set(-0.18, -1.5, -0.2);
      this.scene.add(this.avatarMesh);
  
      this.avatarMesh.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
  
      if (gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.avatarMesh);
        const idleClip = gltf.animations.find(clip => clip.name === "Idle") || gltf.animations[0];
        this.idleAction = this.mixer.clipAction(idleClip);
        this.idleAction.play();
      }
     else {
      console.warn("❌ Avatar non trouvé dans le cache :", this.modelPath);
    }
    });
  }
  preloadAvatars() {
    const models = [
      'animations1.glb',
      'animations3.glb',
      'animations4.glb',
      'animations5.glb',
      'animations6.glb',
      'animations7.glb',
      'animations8.glb',
      'animations9.glb',
      'animations10.glb',
      'animations11.glb',
      'animations12.glb'
    ];
  
    models.forEach(model => {
      this.loader.load(`assets/models/${model}`, gltf => {
        this.avatarCache.set(model, gltf.scene);
        console.log(`✅ Préchargé : ${model}`);
      }, undefined, error => {
        console.error(`❌ Erreur chargement ${model}:`, error);
      });
    });
  }
  
  //////////////////////////////////////////////////////////////////////////////
  // 1) INITIALISATION DE LA SCENE
  //////////////////////////////////////////////////////////////////////////////
  initScene(): void {
    const canvas = this.canvasRef.nativeElement;

    // ✅ Configuration du Renderer avec ombres activées
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true; // ✅ Activation des ombres
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ✅ Ombres plus réalistes

    // ✅ Configuration de la Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);

    


    // ✅ **Caméra (laisse exactement comme dans ton code)**
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0.7); // ✅ Position inchangée
    this.scene.add(this.camera);

    // ✅ OrbitControls pour permettre la rotation de la caméra
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // ✅ **Ajout des lumières (identique à React Three.js)**
// ✅ Lumière d'ambiance plus douce
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
this.scene.add(ambientLight);

// ✅ Lumière directionnelle plus naturelle (éclairage principal)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(2, 4, 5);
keyLight.castShadow = true;
this.scene.add(keyLight);

// ✅ Lumière de remplissage (pour éviter les ombres trop dures)
const fillLight = new THREE.PointLight(0xffffff, 1.2, 10);
fillLight.position.set(-2, 2, 3);
this.scene.add(fillLight);

// ✅ Lumière de contre-jour pour donner du relief à l'avatar
const backLight = new THREE.DirectionalLight(0xaaaaaa, 1.0);
backLight.position.set(0, 2, -3);
this.scene.add(backLight);


    // ✅ **Ombres plus détaillées**
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;


    // ✅ **Ajout des Contact Shadows**
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.7;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ✅ Charger l'avatar
    console.log("📦 Chargement du modèle 3D :", `assets/models/${this.modelPath}`);
    this.loader.load(`assets/models/${this.modelPath}`, gltf => {
      this.avatarMesh = gltf.scene;
        this.avatarMesh.position.set(-0.18, -1.5, -0.2);
        this.scene.add(this.avatarMesh);

        // ✅ Activer les ombres pour l'avatar
        this.avatarMesh.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // ✅ Jouer l'animation Idle
        if (gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.avatarMesh);
            const idleClip = gltf.animations.find(clip => clip.name === "Idle") || gltf.animations[0];
            this.idleAction = this.mixer.clipAction(idleClip);
            this.idleAction.play();
        }
    });
    this.preloadAvatars(); 
    // ✅ Ajouter gestion du resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
}


  //////////////////////////////////////////////////////////////////////////////
  // 2) BOUCLE D'ANIMATION
  //////////////////////////////////////////////////////////////////////////////
  animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    // Mise à jour de OrbitControls pour une rotation fluide
    this.controls.update();

    // Mise à jour de l'animation Idle
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Mise à jour du blink et du lipsync
    this.updateBlink(delta);
    this.updateLipSync();

    // Rendu de la scène
    this.renderer.render(this.scene, this.camera);
  }

  //////////////////////////////////////////////////////////////////////////////
  // 3) BLINK (clignement)
  //////////////////////////////////////////////////////////////////////////////
  updateBlink(delta: number): void {
    this.blinkTime += delta;
    // Clignement toutes les ~3 secondes
    if (this.blinkTime > 3) {
      this.blinkTime = 0;
      if (!this.avatarMesh) return;
      this.avatarMesh.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const dict = mesh.morphTargetDictionary as any;
          if (dict['eyeBlinkLeft'] !== undefined && dict['eyeBlinkRight'] !== undefined) {
            // Activer le clignement pendant 200 ms
            mesh.morphTargetInfluences[dict['eyeBlinkLeft']] = 1;
            mesh.morphTargetInfluences[dict['eyeBlinkRight']] = 1;
            setTimeout(() => {
              if (mesh.morphTargetInfluences) {
                mesh.morphTargetInfluences[dict['eyeBlinkLeft']] = 0;
                mesh.morphTargetInfluences[dict['eyeBlinkRight']] = 0;
              }
            }, 200);
          }
        }
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // 4) LIPSYNC
  //////////////////////////////////////////////////////////////////////////////
  updateLipSync(): void {
    if (!this.currentMessage?.lipsync || !this.avatarMesh || !this.audio) return;
    
    const currentTime = this.audio.currentTime;
    const mouthCues = this.currentMessage.lipsync.mouthCues;
    let activeCue: MouthCue | null = null;

    // Trouver le phonème correspondant au temps actuel
    for (const cue of mouthCues) {
        if (currentTime >= cue.start && currentTime <= cue.end) {
            activeCue = cue;
            break;
        }
    }

    this.avatarMesh.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            const dict = mesh.morphTargetDictionary as any;

            // Réduction progressive des valeurs précédentes pour un effet fluide
            for (const key in dict) {
                mesh.morphTargetInfluences[dict[key]] *= 0.8; // Diminue lentement
            }

            if (activeCue) {
                const morphName = corresponding[activeCue.value] || null;
                if (morphName && dict[morphName] !== undefined) {
                    // Appliquer une transition douce au mouvement des lèvres
                    const targetInfluence = 1.0; // Force du phonème
                    mesh.morphTargetInfluences[dict[morphName]] += (targetInfluence - mesh.morphTargetInfluences[dict[morphName]]) * 0.5;
                }
            }
        }
    });
}

  //////////////////////////////////////////////////////////////////////////////
  // 5) AUDIO
  //////////////////////////////////////////////////////////////////////////////
  playAudio(base64Audio: string): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.audio = new Audio("data:audio/mp3;base64," + base64Audio);
    
    this.audio.play().then(() => {
      console.log("Lecture audio commencée.");
    }).catch(error => {
      console.error("Erreur de lecture audio:", error);
    });
  
    this.audio.onended = () => {
      console.log("Lecture audio terminée.");
      this.chatService.onMessagePlayed();
    };
  }
  

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    if (this.chatSub) {
      this.chatSub.unsubscribe();
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}