import * as THREE from 'three';

import { TGALoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/TGALoader.js'
// import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { LoaderUtils } from './LoaderUtils.js';
import { unzipSync, strFromU8 } from 'https://unpkg.com/three@0.159.0/examples/jsm/libs/fflate.module.js';

function Loader() {

	const scope = this;
	this.texturePath = '';

	this.loadItemList = function ( items ) {

		LoaderUtils.getFilesFromItemList( items, function ( files, filesMap ) {

			scope.loadFiles( files, filesMap );

		} );

	};

	this.loadFiles = function ( files, filesMap, cb ) {
        
		if ( files.length > 0 ) {
            
			filesMap = filesMap || LoaderUtils.createFilesMap( files );
            // console.log('filesMap: ', filesMap );
			const manager = new THREE.LoadingManager();

			// Initialize loading manager with URL callback.
			const objectURLs = [];
			manager.setURLModifier( ( url ) => {
				
				url = URL.createObjectURL( filesMap[ url ] );
				objectURLs.push( url );
				return url;
			
			} );
            
			// manager.setURLModifier( function ( url ) {
                
			// 	url = url.replace( /^(\.?\/)/, '' ); // remove './'
	
			// 	const file = filesMap[ url ];
            //     console.log(`file: ${file}`)
			// 	if ( file ) {

			// 		console.log( 'Loading', url );

			// 		return URL.createObjectURL( file );

			// 	}

			// 	return url;

			// } );

			// manager.addHandler( /\.tga$/i, new TGALoader() );
			let fileExt = [ '.gltf', '.fbx', '.obj', 'glb', 'zip' ];

			for ( let i = 0; i < files.length; i ++ ) {

				fileExt.map( ext => {

					if( files[i].name.endsWith( ext ) ) scope.loadFile( files[ i ], manager, cb );
				
				})

			}

		}

	};

	this.loadFile = function ( file, manager, cb ) {
        
		const filename = file.name;
		const extension = filename.split( '.' ).pop().toLowerCase();
		console.log( 'ext: ', extension );

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
					// editor.execute( new AddObjectCommand( editor, object ) );

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
						// editor.execute( new AddObjectCommand( editor, scene ) );

						loader.dracoLoader.dispose();
						// loader.ktx2Loader.dispose();

					} );

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
						// editor.execute( new AddObjectCommand( editor, scene ) );

						loader.dracoLoader.dispose();
						// loader.ktx2Loader.dispose();

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			}

			case 'obj':

			{

				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;

					const { OBJLoader } = await import( 'three/addons/loaders/OBJLoader.js' );

					const object = new OBJLoader().parse( contents );
					object.name = filename;

					// editor.execute( new AddObjectCommand( editor, object ) );

				}, false );
				reader.readAsText( file );

				break;

			}

			case 'stl':

			{

				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;

					const { STLLoader } = await import( 'three/addons/loaders/STLLoader.js' );

					const geometry = new STLLoader().parse( contents );
					const material = new THREE.MeshStandardMaterial();

					const mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					// editor.execute( new AddObjectCommand( editor, mesh ) );

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

					const { SVGLoader } = await import( 'three/addons/loaders/SVGLoader.js' );

					const loader = new SVGLoader();
					const paths = loader.parse( contents ).paths;

					//

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

					// editor.execute( new AddObjectCommand( editor, group ) );

				}, false );
				reader.readAsText( file );

				break;

			}

			case 'usdz':

			{

				reader.addEventListener( 'load', async function ( event ) {

					const contents = event.target.result;

					const { USDZLoader } = await import( '../../examples/jsm/loaders/USDZLoader.js' );

					const group = new USDZLoader().parse( contents );
					group.name = filename;

					// editor.execute( new AddObjectCommand( editor, group ) );

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

	};


	async function handleZIP( contents ) {

		const zip = unzipSync( new Uint8Array( contents ) );

		// Poly

		if ( zip[ 'model.obj' ] && zip[ 'materials.mtl' ] ) {

			const { MTLLoader } = await import( 'three/addons/loaders/MTLLoader.js' );
			const { OBJLoader } = await import( 'three/addons/loaders/OBJLoader.js' );

			const materials = new MTLLoader().parse( strFromU8( zip[ 'materials.mtl' ] ) );
			const object = new OBJLoader().setMaterials( materials ).parse( strFromU8( zip[ 'model.obj' ] ) );
			// editor.execute( new AddObjectCommand( editor, object ) );

		}

		//

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

			} );

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

					} );

					break;

				}

			}

		}

	}

	async function createGLTFLoader( manager ) {

		const { GLTFLoader } = await import( 'three/addons/loaders/GLTFLoader.js' );
		const { DRACOLoader } = await import( 'three/addons/loaders/DRACOLoader.js' );

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( '../examples/jsm/libs/draco/gltf/' );

		const loader = new GLTFLoader( manager );
		loader.setDRACOLoader( dracoLoader );

		return loader;

	}

}

export { Loader };