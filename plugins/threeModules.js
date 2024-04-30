import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js';

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

export class ThreeModules {

    constructor( opt ) {
        
        this.editor = opt.editor;
        // this.obj = opt.obj;
        // this.loader = null;

    }

    init( scn, obj ) {
    
        let scnContainer = scn;
        const scene = new THREE.Scene();
        let width = this.editor.clientWidth * .4;
        let height = this.editor.clientHeight * .8;
        
        const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
        camera.position.z = 5;

        const grid = new THREE.GridHelper(10);
        scene.add( grid );
        if( obj ) scene.add( obj );
    
        const light = new THREE.PointLight(0xffffff, 50)
        light.position.set(0.8, 1.4, 1.0)
        scene.add(light);

        const ambientLight = new THREE.AmbientLight()
        scene.add(ambientLight)

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        scnContainer.appendChild( renderer.domElement );

        const controls = new OrbitControls( camera, renderer.domElement);
        controls.enableDamping = true;

        function animate() {

            requestAnimationFrame(animate);
            controls.update()
            renderer.render(scene, camera);
    
        }
    
        animate();
        return scnContainer;
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
                                                        // ** scope주의
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
				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;
					const { FBXLoader } = await import( 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/FBXLoader.js' );

					const loader = new FBXLoader( manager );
					const object = loader.parse( contents );
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
					handleZIP( event.target.result );
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


async function handleZIP( contents ) {

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
                const { FBXLoader } = await import( 'three/addons/loaders/FBXLoader.js' );
                const loader = new FBXLoader( manager );
                const object = loader.parse( file.buffer );
                // editor.execute( new AddObjectCommand( editor, object ) );
                break;
            }

            case 'glb':
            {
                const loader = await createGLTFLoader();
                loader.parse( file.buffer, '', function ( result ) {

                    const scene = result.scene;
                    scene.animations.push( ...result.animations );
                    // editor.execute( new AddObjectCommand( editor, scene ) );
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