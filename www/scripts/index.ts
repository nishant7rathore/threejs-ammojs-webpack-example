import { PhysicsLoader } from "@enable3d/ammo-physics";
import { Project, Scene3D } from "enable3d";
import { THREE, ExtendedMesh, ExtendedObject3D } from 'enable3d'
import * as dat from 'dat.gui'
import { Keyboard } from "@yandeu/keyboard";


let sphere ;

export class PhysicsTest extends Scene3D{
    bar: any;
    lookAt:any;
    light1:any;
    light2:any;
    sphereVel:any;
    particleTex:any;
    tiles:any;
    tileGroup:any;
    canAnimate: any;
    particles:any;
    particleKeyPressed:any;
    animateKeyPressed:any;

    constructor() {
        super();
        this.lookAt = new THREE.Vector3(0,0,0);
        this.sphereVel =  new THREE.Vector3(0,0,0);
        this.light1 = new THREE.AmbientLight( 0xff00ff );
        this.light2 = new THREE.SpotLight( 0x0550ff );
        this.tiles = [];
        this.tileGroup = new THREE.Group();
        this.canAnimate = false;
        this.particles = [];
        this.particleKeyPressed = false;
        this.animateKeyPressed = false;
    }

    async init(){
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        this.load.preload('particle', 'particle.png')
        this.load.preload('particle1', 'particle1.png')
        this.load.preload('particle4', 'particle4.png')
        this.load.preload('particle2', 'particle2.png')
        this.load.preload('particle3', 'particle3.png')
        this.load.preload('particle5', 'particle5.png')

    }


    async create(){

        this.particleTex = await this.load.texture('particle4')
        const face1 = await this.load.texture('particle1')
        const face2 = await this.load.texture('particle2')
        const face3 = await this.load.texture('particle3')
        const face4 = await this.load.texture('particle4')
        const face5 = await this.load.texture('particle5')

        this.physics.setGravity(0,0,0);
        this.camera.position.set(0,0,-10);
        const gui = new dat.GUI()
        const textureLoader = new THREE.TextureLoader()
        const cylTexture = textureLoader.load('cylinder.png');    
        this.bar = this.add.cylinder({ radiusBottom: 0.1, radiusTop: 0.1, height: 5, y:-15,z:-10,x:0 },{standard:{normalMap:cylTexture,color:'brown'}})
        this.bar.name = 'bar';

        this.bar.rotateZ(Math.PI / 2)
        this.physics.add.existing(this.bar, { collisionFlags: 2 })
 
        this.particleTex.wrapS = THREE.RepeatWrapping
        this.particleTex.wrapT = THREE.RepeatWrapping
        this.particleTex.repeat.set(2, 2)

        this.light1.position.x = 0
        this.light1.position.y = 0  
        this.light1.position.z = 32
        //this.scene.add(this.light1)

        this.light2.position.x = -10
        this.light2.position.y = 5  
        this.light2.position.z = 10
        this.scene.add(this.light2)

        //this.sphere.body.

        this.warpSpeed('camera', 'sky', 'light', 'orbitControls');
        let counter = 0;

        for(let j=1;j>-5;j--){ 
            for(let i=0;i<15;i++){

                let isTex = Math.random();

                if(isTex > 0.5){
                    
                    let mat = getTheBoxAndMaterial(this,face1,face2,face3,face4,face5);
                    let box1= this.add.box({ x: -15+i*2, y: j*1.5, z: -10},{custom:mat})
                    counter++;
                    box1.name=counter+"";
                    this.physics.add.existing(box1, { collisionFlags: 3})
                    this.tiles.push(box1);
                    
                }
                else{
                    let matConfig = getMaterialConfig(this);
                    console.log(matConfig);
                    let box1= this.add.box({ x: -15+i*2, y: j*1.5, z: -10},matConfig)
                    counter++;
                    box1.name=counter+"";
                    this.physics.add.existing(box1, { collisionFlags: 3})
                    this.tiles.push(box1);
                } 
                
                
            }
        }

        captureKeyEvents(this);


        //this.camera.lookAt(this.sphere.position.clone())
    }

    async update(time){

        if(this.tiles.length == 0 || this.particleKeyPressed){
            createParticleSystem(this);
        }
        
        if(sphere == undefined){
            const textureLoader = new THREE.TextureLoader()
            const ballTexture = textureLoader.load('ball.png');    
            sphere = this.physics.add.sphere({y:-12.5,z:-10,radius:0.2},{standard:{normalMap:ballTexture}});
            this.physics.add.existing(sphere, { collisionFlags: 2 })
            sphere.body.setVelocityY(1);
            sphere.body.applyForceY(2);
            sphere.body.setVelocity(2,2,0);
            this.sphereVel.x = 2;
            this.sphereVel.y = 2;
            
        }
     


        sphere.body.on.collision((otherObject, event) => {
            if (otherObject.name !== 'bar') {
                if( event == 'start'){
                    sphere.body.setVelocity(-this.sphereVel.x,-this.sphereVel.y,this.sphereVel.z);
                    this.scene.remove(otherObject);
                    this.sphereVel.x = -this.sphereVel.x;
                    this.sphereVel.y = -this.sphereVel.y;
                    this.tiles.splice(parseInt(otherObject.name), parseInt(otherObject.name));
                    this.physics.destroy(otherObject);
                }
            }
            else{
                sphere.body.setVelocity((-1*(Math.random()+1))*this.sphereVel.x,-this.sphereVel.y,this.sphereVel.z);
                
            }
            
        })

        if(sphere.position.x < -15){
           sphere.body.applyForceX(1);
            this.sphereVel.x = 1;
        }
        if(sphere.position.x > 15){
           sphere.body.applyForceX(-1);
            this.sphereVel.x = -1;
        }
        
        if(sphere.position.y > 5){
            sphere.body.applyForceY(-1);
            this.sphereVel.y = -1;
        }

        const orbitRadius = 2
        const { x, y, z } = sphere.position.clone()

        if(this.animateKeyPressed){
            let rand = Math.ceil((this.tiles.length-1)*Math.random());
            if(parseInt(time)%4 == 0){
                this.tiles[rand].position.z = -11;
            }
            else{
                this.tiles[rand].position.z = -10;
            }
            if(parseInt(time)%6 == 0){
                this.tiles[rand].rotateZ(Math.PI/2);
            }
            else{
                this.tiles[rand].rotateY(Math.PI/2);
            }
            if(parseInt(time)%8 == 0){
                this.tiles[rand].scale.set(1.1,1.1,1.1)
            }
            else{
                this.tiles[rand].scale.set(0.2,0.2,0.2)
            }   
        }

        if(this.canAnimate){
          
            this.bar.position.set(
                Math.cos(time) * 18+ this.tileGroup.position.x,
             this.tileGroup.position.y,
              Math.sin(time)*20 + this.tileGroup.position.z
            )


            this.bar.body.needUpdate = true
        }

        if(this.canAnimate){
           
           this.physics.destroy(sphere);
           this.physics.add.existing(sphere, { collisionFlags: 2 })
           const angle = Math.atan2(this.bar.position.x - x, this.bar.position.z - z)


            sphere.position.set(
                this.bar.position.x,
            Math.cos(time) * orbitRadius + this.bar.position.y,
            Math.sin(time)*orbitRadius + this.bar.position.z
            )


            sphere.rotateX(angle)
            sphere.rotateZ(angle)
            sphere.rotateY(angle)

            sphere.body.needUpdate = true
        }

        
    }
}

const config = {scenes: [PhysicsTest], antialias:true}
PhysicsLoader('/ammo',()=> new Project(config))


function createParticleSystem(dis) {

    if(dis.particles.length < 1800){
        let particleCount = 1800 - dis.particles.length;
  
        for(let i=0;i<particleCount;i++){
            const material = new THREE.MeshLambertMaterial({ map: dis.particleTex })
            const geometry = new THREE.SphereBufferGeometry(0.05);
            const particles = new THREE.Mesh(geometry, material);
            let rand = Math.random();
            if(rand < 0.5){
                particles.position.x = (20*Math.random());
            }
            else{
                particles.position.x = (-1)*(20*Math.random());
            }
            rand = Math.random();
            if(rand < 0.5){
                particles.position.y = (20*Math.random());
            }
            else{
                particles.position.y = (20*Math.random())*(-1);
            }
            particles.position.z =  -10;
            dis.particles.push(particles);
            dis.scene.add(particles);
        }
    }

    
    let remove = [0];

    for(let i=0;i<dis.particles.length;i++){
        let rand = Math.random();
        if(rand < 0.5){
            dis.particles[i].translateZ(Math.random());
        }
        else{
            dis.particles[i].translateZ(-1*Math.random());
        }
        rand = Math.random();
        if(rand < 0.5){
            dis.particles[i].translateX(Math.random());
        }
        else{
            dis.particles[i].translateX(-1*Math.random());
        }
        rand = Math.random();
        if(rand < 0.5){
            dis.particles[i].translateY(Math.random());
        }
        else{
            dis.particles[i].translateY(-1*Math.random());
        }
        if(dis.particles[i].x > 15 || dis.particles[i].x < -15 || dis.particles[i].y < -15 || dis.particles[i].y > 15){
            remove.push(i);
        }
     
    }

    remove.forEach(r => { dis.particles.splice(r,r)});
  
}

function captureKeyEvents(dis) {

    const keyboard = new Keyboard()

    // watch all keys down
    keyboard.watch.down(keyCode => {
        if(keyboard.key('ArrowLeft').isDown || keyboard.key('ArrowRight').isDown){
            if(keyboard.key('ArrowRight').isDown){
                moveTheBar(dis,-2);
            }
            else{
                moveTheBar(dis,2);
            }
                
        }
        else if(keyboard.key('KeyD').isDown){
            let val = dis.lookAt.x + 1;
            dis.camera.lookAt(val,0,0);
            dis.lookAt = new THREE.Vector3(val,0,0);
        }
        else if(keyboard.key('KeyA').isDown){
            let val = dis.lookAt.x - 1;
            dis.camera.lookAt(val,0,0);
            dis.lookAt = new THREE.Vector3(val,0,0);
        }
        else if(keyboard.key('KeyE').isDown){
            let val = dis.lookAt.y + 1;
            dis.camera.lookAt(0,val,0);
            dis.lookAt = new THREE.Vector3(0,val,0);
        }
        else if(keyboard.key('KeyQ').isDown){
            let val = dis.lookAt.y - 1;
            dis.camera.lookAt(0,val,0);
            dis.lookAt = new THREE.Vector3(0,val,0);
        }
        else if(keyboard.key('KeyW').isDown){
            let val = dis.lookAt.z + 1;
            dis.camera.lookAt(0,0,val);
            dis.lookAt = new THREE.Vector3(0,0,val);
        }
        else if(keyboard.key('KeyS').isDown){
            let val = dis.lookAt.z - 1;
            dis.camera.lookAt(0,0,val);
            dis.lookAt = new THREE.Vector3(0,0,val);
        }

        else if(keyboard.key('KeyG').isDown){
            groupAllTiles(dis);
        }
        else if(keyboard.key('KeyP').isDown){
            dis.particleKeyPressed = !dis.particleKeyPressed;
            if(!dis.particleKeyPressed){
                for(let i=0;i<dis.particles.length;i++){
                    dis.scene.remove(dis.particles[i]);
                }
                dis.particles = [];
            }
        }
        else if(keyboard.key('KeyM').isDown){
            dis.animateKeyPressed = !dis.animateKeyPressed;
        }
        else if(keyboard.key('Numpad5').isDown || keyboard.key('Numpad0').isDown || keyboard.key('Numpad2').isDown || keyboard.key('Numpad6').isDown || keyboard.key('Numpad4').isDown || keyboard.key('Numpad8').isDown || keyboard.key('Numpad7').isDown || keyboard.key('Numpad9').isDown){
            moveTheLight(dis,keyCode);
        }


    })

}

function moveTheBar(dis,mov) {
    dis.physics.destroy(dis.bar);
    dis.bar.translateY(mov);
    dis.physics.add.existing(dis.bar, { collisionFlags: 2 })
}

function groupAllTiles(dis) {
        dis.tiles.forEach(t => { dis.tileGroup.add(t);
    });
    dis.add.existing(dis.tileGroup)
    dis.physics.add.existing(dis.tileGroup)
    dis.physics.destroy(dis.bar);
    dis.bar.rotateZ(-Math.PI/2)
    dis.physics.add.existing(dis.bar, { collisionFlags: 2 })
    dis.canAnimate = !dis.canAnimate;

}
function moveTheLight(dis,keyCode) {
    switch(keyCode) {
        case "Numpad6":
            dis.light2.position.x = dis.light2.position.x + 1;
 
            //dis.light2.updateMatrixWorld();
            console.log(dis.light2.position.x);
        break;
        case "Numpad4":
            dis.light2.position.x = dis.light2.position.x - 1;
            //console.log(dis.light2.position.x);
        break; 
        case "Numpad8":
            dis.light2.position.z = dis.light2.position.z + 1;
            //console.log(dis.light2.position.x);
        break;
        case "Numpad2":
            dis.light2.position.z = dis.light2.position.z - 1;
            //console.log(dis.light2.position.x);
        break;
        case "Numpad9":
            dis.light2.position.y = dis.light2.position.y + 1;
            //console.log(dis.light2.position.x);
        break;
        case "Numpad7":
            dis.light2.position.y = dis.light2.position.y - 1;
            dis.scene.remove(dis.light2);
            dis.scene.add(dis.light2);
            //console.log(dis.light2.position.x);
        break;
        case "Numpad5":
         
            if(dis.light2.intensity == 100){
                dis.light2.intensity = 0;
            }
            else{
                dis.light2.intensity = 100;
            }
            console.log(dis.light2.intensity);
            //console.log(dis.light2.position.x);
        break;
        case "Numpad0":
            dis.light2.color = new THREE.Color((16777215*2)*Math.random());
        break;
    }
}

function getTheBoxAndMaterial(dis,face1,face2,face3,face4,face5) {

    let arr = [face1,face2,face3,face4,face5];

    let val = Math.floor(Math.random()*5)
    let face = arr[val];
    const textureCube = dis.misc.textureCube([face, face, face, face, face, face])

    textureCube.texture.front.repeat.set(4, 1)
    textureCube.texture.back.repeat.set(4, 1)

    textureCube.texture.left.repeat.set(1, 1)
    textureCube.texture.right.repeat.set(1, 1)


    return textureCube.materials;
}

function getMaterialConfig(dis) {
    
    const textureLoader = new THREE.TextureLoader()
    const nornmalTexture = textureLoader.load('bumpMap.png');
    const nornmalTexture2 = textureLoader.load('bumpMap1.png');
    const nornmalTexture3 = textureLoader.load('bumpMap2.png');

    let matArray = [

        {lambert:{color: new THREE.Color((16777215*2)*Math.random()),shininess:150}},
        {basic:{color:new THREE.Color((16777215*2)*Math.random())}},
        {phong:{color:new THREE.Color((16777215*2)*Math.random()),emissive:new THREE.Color((16777215*2)*Math.random()),flatShading:true}},
        {phong:{color:new THREE.Color((16777215*2)*Math.random()),emissive:new THREE.Color((16777215*2)*Math.random()),flatShading:false}},
        {normal:{wireframe:true,wireframeLinewidth:Math.random()*10,color:new THREE.Color((16777215*2)*Math.random()),normalMap:nornmalTexture}},
        {normal:{color:new THREE.Color((16777215*2)*Math.random()),normalMap:nornmalTexture,metalness:0.8,roughness:0.2}},
        {normal:{color:new THREE.Color((16777215*2)*Math.random()),normalMap:nornmalTexture2,metalness:0.8,roughness:0.6}},
        {normal:{color:new THREE.Color((16777215*2)*Math.random()),normalMap:nornmalTexture3,metalness:0.5,roughness:0.4}},
        {physical:{color:new THREE.Color((16777215*2)*Math.random()),emissive:new THREE.Color((16777215*2)*Math.random()),clearcoat:Math.random(),clearcoatRoughness:Math.random()}}


    ];

    let mat = Math.floor(Math.random()*8);
    return matArray[mat];
}

