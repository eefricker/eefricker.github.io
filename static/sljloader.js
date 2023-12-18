// Subclass of THREE.Loader to open slview JSON format
// Based on BufferGeometryLoader by mrdoob / http://mrdoob.com/

import { Loader, FileLoader } from './lib/three.js/build/three.module.js';


function SLJLoader( manager ) {

    Loader.call( this, manager );

}

SLJLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

    constructor: SLJLoader,

    required_elements: ['format', 'mode', 'layout', 'vectors'],

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var loader = new FileLoader( scope.manager );
        loader.setPath( scope.path );
        loader.load( url, function ( text ) {

            try {

                onLoad( scope.parse( JSON.parse( text ) ) );

            } catch ( e ) {

                if ( onError ) {

                    onError( e );

                } else {

                    console.error( e );

                }

                scope.manager.itemError( url );

            }

        }, onProgress, onError );

    },

    parse: function ( json ) {
        this.required_elements.forEach( function(e) {
            if (!(e in json)) {
                throw new Error( 'Malformed SL(View) JSON file; missing required attribute '.concat(e) );
            }
        });
        if (json.format != 'slview_v1') {
            throw new Error( 'Malformed SL(View) JSON file; expected format slview_v1, got '.concat(json.format) );
        }

        var parsed;
        switch(json.mode) {
            case 'R3':
                parsed = this.parseR3(json);
                break;
            default:
                throw new Error( 'Malformed SL(View) JSON file; unknown mode '.concat(json.mode) );
        }
        if (!('title' in parsed)) {
            parsed['title'] = 'Untitled dataset';
        }
        if (!('shortdesc' in parsed)) {
            parsed['shortdesc'] = 'No description available';
        }
        if (!('longdesc' in parsed)) {
            parsed['longdesc'] = parsed.shortdesc;
        }

        return parsed;
    },

    parseR3: function ( json ) {
        var rawvectors = json.vectors;
        delete json['vectors'];
        var indices = ['a','b','c','d'].map(function (e) { return json.layout.indexOf(e) });

        var vectors = [];
        rawvectors.forEach(function (v) {
            vectors.push( indices.map(function (i) { return v[i] }) );
        });
        json['vectors'] = vectors;

        var sizes = [];
        vectors.forEach(w => {
            sizes.push(1.0);
        });
        json['sizes'] = sizes;

        return json;
    }

} );

export { SLJLoader };
