import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js';
import { unzipSync, strFromU8 } from 'https://unpkg.com/three@0.159.0/examples/jsm/libs/fflate.module.js';

const LoaderUtils = {

	createFilesMap: function ( files ) {

		const map = {};

		for ( let i = 0; i < files.length; i ++ ) {
			const file = files[ i ];
			map[ file.name ] = file;
		}

		return map;
	},

	getFilesFromItemList: function ( items, onDone ) {
		// TOFIX: setURLModifier() breaks when the file being loaded is not in root

		let itemsCount = 0;
		let itemsTotal = 0;

		const files = [];
		const filesMap = {};

		function onEntryHandled() {
			itemsCount ++;
			if ( itemsCount === itemsTotal ) onDone( files, filesMap );
		}

		function handleEntry( entry ) {

			if ( entry.isDirectory ) {
				const reader = entry.createReader();
				reader.readEntries( function ( entries ) {

					for ( let i = 0; i < entries.length; i ++ ) {
						handleEntry( entries[ i ] );
					}
					onEntryHandled();
				});

			} else if ( entry.isFile ) {
				entry.file( function ( file ) {

					files.push( file );
					filesMap[ entry.fullPath.slice( 1 ) ] = file;
					onEntryHandled();

				});
			}

			itemsTotal ++;

		}

		for ( let i = 0; i < items.length; i ++ ) {
			const item = items[ i ];
			if ( item.kind === 'file' ) handleEntry( item.webkitGetAsEntry() );
		}
	}

};

export class EZ3D_Module_THREE {

    constructor( opt ) {

		if( opt ) {
			this.editor = ( opt.editor ) ? opt.editor : null;
			this.sceneWrapper = ( opt.sceneWrapper ) ? opt.sceneWrapper : null;
		} 
        
		this.scene = null;
		this.renderer = null;
		this.cls = null;
		this.postScenes = [];
		this.threeScenes = {};
        this.editor = opt.editor;

    }

    init( scn, obj ) {
		// console.log(`scn: ${scn}, obj: ${obj}`);
		if( !this.editor && !this.sceneWrapper ) {
			console.log('Error: insert option, editor or sceneWrapper!');
			return;
		}

        let scnContainer = scn;
		let sceneName = scn.id;
		const cls = this;
		if( scnContainer.firstChild ) scnContainer.removeChild( scnContainer.firstChild );
		
		const scene = new THREE.Scene();
		const aspectRatio = 16 / 9;

		const content_node = ( this.editor ) ? this.editor.querySelector('.ez3d-content') : null;
        const content_rect = ( content_node ) ? content_node.getBoundingClientRect() : null;

        let width = ( content_rect ) ? content_rect.width * .78 : 640 ;
        let height = width / aspectRatio;

		scnContainer.style.width = `${width}px`;
		scnContainer.style.height = `${height}px`;

        const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
		camera.position.set( 1.2, .6, 1.3 );
       
        const grid = new THREE.GridHelper(10);
        scene.add( grid );
        if( obj ) scene.add( obj );
    
        const light = new THREE.PointLight(0xffffff, 50)
        light.position.set(0.8, 1.4, 1.0)
        scene.add(light);

        const ambientLight = new THREE.AmbientLight()
        scene.add(ambientLight)

        const renderer = new THREE.WebGLRenderer();
		this.renderer = renderer;
        renderer.setSize( width, height );
        scnContainer.appendChild( renderer.domElement );

        const controls = new OrbitControls( camera, renderer.domElement);
        controls.enableDamping = true;

		// Creating FullScreen Button
		let btnWrapper = document.createElement('div');
		btnWrapper.className = 'three-scene-btn-wrapper';

		let tooltip = document.createElement('div');
		tooltip.className = 'tooltip';
		scnContainer.appendChild(tooltip); 

        let fullscreenBtn = document.createElement('button');
		fullscreenBtn.tabIndex = '-1';
		fullscreenBtn.contentEditable = false;
        fullscreenBtn.innerText = 'Full';
		fullscreenBtn.id = 'fullscreen-btn'
		fullscreenBtn.className = 'three-scene-btn';

		let backgroundBtn = document.createElement('input');
		backgroundBtn.type = 'color';
		backgroundBtn.value = '#222';
    	backgroundBtn.innerText = 'BG';
    	backgroundBtn.className = 'three-scene-btn';
		backgroundBtn.id = 'three-scene-btn-bg';
		backgroundBtn.addEventListener('input', () => {
			scene.background = new THREE.Color(backgroundBtn.value);
		});

		let customColorBtn = document.createElement('button');
		customColorBtn.className = 'three-scene-btn';
		customColorBtn.contentEditable = false;
		customColorBtn.textContent = 'BG';
		customColorBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
		customColorBtn.style.color = '#333'; 
		customColorBtn.addEventListener('click', () => {
		    backgroundBtn.click();
		});

		// Hide the actual color input elements.
		backgroundBtn.style.visibility = 'hidden';
		backgroundBtn.style.position = 'absolute';
		backgroundBtn.style.zIndex = '-1';

		// 그Create Grid toggle button
		let gridToggleBtn = document.createElement('button');
		gridToggleBtn.textContent = 'Grid';
		gridToggleBtn.className = 'three-scene-btn';
		gridToggleBtn.contentEditable = false;
		gridToggleBtn.id = 'three-scene-grid-btn'
		gridToggleBtn.addEventListener('click', () => {
			
			grid.visible = !grid.visible; 
		
		});

		// Create an Edit Mode button (Disabled)
		let editModeBtn = document.createElement('button');
		editModeBtn.textContent = 'Edit';
		editModeBtn.className = 'three-scene-btn';
		editModeBtn.contentEditable = false;
		editModeBtn.id = 'three-scene-edit-btn';
		editModeBtn.addEventListener('click', () => {
			console.log('edit mode: ', editModeBtn );
			if( tooltip.style.display === '' || tooltip.style.display === 'none') {
				// let editMenuBtn = document.querySelector(`[title="3D Scene Editor"]`);
				// editMenuBtn.click();
        		tooltip.textContent = 'Getting ready..';
				tooltip.style.display = 'block';

				setTimeout(() => {
					tooltip.style.display = 'none';
				}, 2000 );

			}
			
		});
		
		// Label
		btnWrapper.appendChild( fullscreenBtn );
		btnWrapper.appendChild(customColorBtn);
		btnWrapper.appendChild(backgroundBtn); 
		btnWrapper.appendChild(gridToggleBtn);  
    	btnWrapper.appendChild(editModeBtn); 
        scnContainer.appendChild( btnWrapper );
		
		// Resize
		window.addEventListener('resize', function(e) {
			
			if( !document.fullscreenElement ) {

				const content_rect = content_node.getBoundingClientRect();
				let width = content_rect.width * .78;
				let height = width / aspectRatio;
				scnContainer.style.width = `${width}px`;
				scnContainer.style.height = `${height}px`;
				cls.updateSize( renderer, camera, width, height );

			} else {
				cls.updateSize(renderer, camera, screen.width, screen.height);
			}
		});

		fullscreenBtn.addEventListener('click', () => {

            if( !document.fullscreenElement ) {
				
				renderer.domElement.requestFullscreen().catch(err => {
					alert(`Failed to Full Screen: ${err.message}`);
				})
				// .then( () => {
				// 		this.updateSize( renderer, camera, screen.width, screen.height )
				// });

            } else {
				if ( document.exitFullscreen ) {
            		document.exitFullscreen()
					// .then(() => {
					// 		this.updateSize( renderer, camera, width, height );
					// });
					scnContainer.appendChild( btnWrapper );
					
        		}
            }

        });

		// Repeat
        function animate() {

            requestAnimationFrame(animate);
            controls.update()
            renderer.render(scene, camera);
    
        }

		// this.scene = scene;
		this.threeScenes[ sceneName ] = scene;
    
        animate();
        return scnContainer;
    }

	initPost( files, id ) {

		// console.log('initPost: ', files );
		let threeScenes_keys = Object.keys( this.threeScenes );
		let element = document.querySelector(`#${id}`);

		this.loadFiles( files, null, res => {
			
			let threeSceneLen = threeScenes_keys.length;
			// console.log('this.threeScenes: ', this.threeScenes );
			
			if(  threeSceneLen > 0 ) {
				
				let threeSceneSet = new Set( threeScenes_keys );
				
				if( threeSceneSet.has( id ) ) {
					// console.log('add 3D scene')
					this.addObject( res, this.threeScenes[ id ] );
				} else {
					// console.log('create another 3D scene');
					this.init( element, res );
				}
			
			} else if( threeSceneLen === 0 ) {
				// console.log('create first 3D scene');
				this.init( element, res );
			
			}
		})

	}

	getScene() {
		if( this.scene ) return this.scene;
	}

	addObject( obj, scene ) {

		if( scene ) { 
			scene.add( obj ); 
		} else {
			this.scene.add( obj );
		}
	}

	updateSize(renderer, camera, width, height ) {
		
        const aspectRatio = width / height;
        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

    }

    loadItemList( items ) {

        LoaderUtils.getFilesFromItemList( items, function ( files, filesMap ) {

			this.loadFiles( files, filesMap );

		});

    }

    loadFiles( files, filesMap, cb ) {
		
        if ( files.length > 0 ) {
            
			filesMap = filesMap || LoaderUtils.createFilesMap( files );
            
			const manager = new THREE.LoadingManager();
			const objectURLs = [];
			manager.setURLModifier(( url ) => {
				
				url = URL.createObjectURL( filesMap[ url ] );
				objectURLs.push( url );
				return url;
			
			} );
            
			let fileExt = [ '.gltf', '.fbx', '.obj', 'glb', 'zip' ];

			for ( let i = 0; i < files.length; i ++ ) {

				fileExt.map( ext => {
                    // ** caution:: scope
					if( files[i].name.endsWith( ext ) ) this.loadFile( files[ i ], manager, cb );
				
				})

			}

		}

    }

    loadFile( file, manager, cb ) {

        const filename = file.name;
		const extension = filename.split( '.' ).pop().toLowerCase();

		const reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {
			
			const size = '(' + Math.floor( event.total / 1000 ) + ' KB)';
			const progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			console.log( 'Loading', filename, size, progress );

		} );

		switch ( extension ) {

			case 'fbx':
			{
				// console.log('fbx loaded');
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const { FBXLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/FBXLoader.js' );

					const loader = new FBXLoader( manager );
					const object = loader.parse( contents );
					object.name = filename;
                    cb( object );

				}, false );
				reader.readAsArrayBuffer( file );
				break;
			}

			case 'glb':
			{
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const loader = await createGLTFLoader();

					loader.parse( contents, '', function ( result ) {

						const scene = result.scene;
						scene.name = filename;
						scene.animations.push( ...result.animations );
						cb( scene );
						loader.dracoLoader.dispose();
						// loader.ktx2Loader.dispose();
					});
				}, false );
				reader.readAsArrayBuffer( file );
				break;
			}

			case 'gltf':
			{
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const loader = await createGLTFLoader( manager );

					loader.parse( contents, '', function ( result ) {

						const scene = result.scene;
						scene.name = filename;
						scene.animations.push( ...result.animations );
                        cb( scene );

						loader.dracoLoader.dispose();
						// loader.ktx2Loader.dispose();
					});
				}, false );
				reader.readAsArrayBuffer( file );
				break;
			}

			case 'obj':
			{
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const { OBJLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/OBJLoader.js' );

					const object = new OBJLoader().parse( contents );
					object.name = filename;
					cb( object );

				}, false );
				reader.readAsText( file );
				break;
			}

			case 'stl':
			{
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const { STLLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/STLLoader.js' );

					const geometry = new STLLoader().parse( contents );
					const material = new THREE.MeshStandardMaterial();

					const mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;
					cb( mesh )

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {
					reader.readAsBinaryString( file );
				} else {
					reader.readAsArrayBuffer( file );
				}

				break;
			}

			case 'svg':
			{
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const { SVGLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/SVGLoader.js' );
					const loader = new SVGLoader();
					const paths = loader.parse( contents ).paths;
					const group = new THREE.Group();
					group.scale.multiplyScalar( 0.1 );
					group.scale.y *= - 1;

					for ( let i = 0; i < paths.length; i ++ ) {

						const path = paths[ i ];
						const material = new THREE.MeshBasicMaterial( {
							color: path.color,
							depthWrite: false
						} );

						const shapes = SVGLoader.createShapes( path );

						for ( let j = 0; j < shapes.length; j ++ ) {

							const shape = shapes[ j ];
							const geometry = new THREE.ShapeGeometry( shape );
							const mesh = new THREE.Mesh( geometry, material );
							group.add( mesh );

						}

					}

					cb( group )

				}, false );
				reader.readAsText( file );
				break;
			}

			case 'usdz':
			{
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const { USDZLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/USDZLoader.js' );

					const group = new USDZLoader().parse( contents );
					group.name = filename;

				}, false );
				reader.readAsArrayBuffer( file );
				break;
			}

			case 'zip':
			{
				reader.addEventListener( 'load', function ( event ) {
					handleZIP( event.target.result, cb );
				}, false );
				reader.readAsArrayBuffer( file );
				break;
			}

			default:
				console.error( 'Unsupported file format (' + extension + ').' );
				break;
            
        }

    }

    
}


async function handleZIP( contents, cb ) {

    const zip = unzipSync( new Uint8Array( contents ) );

    // Poly
    if ( zip[ 'model.obj' ] && zip[ 'materials.mtl' ] ) {

        const { MTLLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/MTLLoader.js' );
        const { OBJLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/OBJLoader.js' );

        const materials = new MTLLoader().parse( strFromU8( zip[ 'materials.mtl' ] ) );
        const object = new OBJLoader().setMaterials( materials ).parse( strFromU8( zip[ 'model.obj' ] ) );

    }

    for ( const path in zip ) {

        const file = zip[ path ];
        const manager = new THREE.LoadingManager();
        manager.setURLModifier( function ( url ) {

            const file = zip[ url ];

            if ( file ) {
                console.log( 'Loading', url );
                const blob = new Blob( [ file.buffer ], { type: 'application/octet-stream' } );
                return URL.createObjectURL( blob );
            }

            return url;

        });

        const extension = path.split( '.' ).pop().toLowerCase();

        switch ( extension ) {

            case 'fbx':
            {
                const { FBXLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/FBXLoader.js' );
                const loader = new FBXLoader( manager );
                const object = loader.parse( file.buffer );
                cb( object );
                break;
            }

			case 'obj':
			{
			
				const { OBJLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/OBJLoader.js' );
				const object = new OBJLoader().parse( file.buffer );
				object.name = filename;
				cb( object );
				break;
			}

            case 'glb':
            {
                const loader = await createGLTFLoader();
                loader.parse( file.buffer, '', function ( result ) {

                    const scene = result.scene;
                    scene.animations.push( ...result.animations );
                    cb( scene )
                    loader.dracoLoader.dispose();
                    // loader.ktx2Loader.dispose();
                } );
                break;
            }

            case 'gltf':
            {
                const loader = await createGLTFLoader();   
                loader.parse( strFromU8( file ), '', function ( result ) {

                    const scene = result.scene;
                    scene.animations.push( ...result.animations );
					cb( scene );
                    // editor.execute( new AddObjectCommand( editor, scene ) );
                    loader.dracoLoader.dispose();
                    // loader.ktx2Loader.dispose();
                });
                break;
            }

        }

    }

}

async function createGLTFLoader( manager ) {

    const { GLTFLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js' );
    const { DRACOLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/DRACOLoader.js' );

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.159.0/examples/jsm/libs/draco/gltf/' );

    const loader = new GLTFLoader( manager );
    loader.setDRACOLoader( dracoLoader );

    return loader;

}