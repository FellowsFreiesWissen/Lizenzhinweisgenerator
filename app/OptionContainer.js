( function( define ) {
'use strict';

define( [
	'jquery',
	'app/options/OriginalFileLink',
	'app/options/HtmlCode',
	'app/options/ImageSize',
	'app/options/RawText'
], function( $, OriginalFileLink, HtmlCode, ImageSize, RawText ) {

/**
 * Visual container for input elements that act as options.
 * @constructor
 *
 * @event update
 *        Triggered whenever one option's value is changed.
 *        (1) {jQuery.Event}
 *
 * @param {jQuery} $node
 * @param {Asset} asset
 * @param {string[]} defaultOptions
 */
var OptionContainer = function( $node, asset, defaultOptions ) {
	var self = this;

	this._$node = $node;
	this._defaultOptions = defaultOptions || [
		'imageSize',
		'originalFileLink'
	];
	this._currentOptions = this._defaultOptions;

	this._options = [
		{ id: 'imageSize', instance: new ImageSize( asset ) },
		{ id: 'originalFileLink', instance: new OriginalFileLink( asset ) },
		{ id: 'rawText', instance: new RawText( asset ) },
		{ id: 'htmlCode', instance: new HtmlCode( asset ) }
	];

	for( var i = 0; i < this._options.length; i++ ) {
		$( this._options[i].instance )
		.on( 'update', function() {
			$( self ).trigger( 'update' );
		} )
		.on( 'toggleunderlay updateunderlay', function( event, $underlay ) {
			var $button = $underlay.data( 'anchor' ).closest( '.button' ),
				$container = $button.closest( '.optioncontainer-option' ),
				padding = $underlay.outerWidth() - $underlay.width();

			$button[ $underlay.is( ':visible' ) ? 'addClass' : 'removeClass' ]( 'active' );

			$underlay.width( $container.width() - 10 - padding );

			$underlay.css( 'width', 'auto' );
			$underlay.css( 'top', '0' );
			$underlay.css( 'left', '0' );

			$underlay.offset( {
				top: $container.offset().top - $underlay.outerHeight(),
				left: $container.offset().left + $container.width() / 2 - $underlay.outerWidth() / 2
			} );
		} );
	}
};

$.extend( OptionContainer.prototype, {
	/**
	 * Node of the OptionContainer, node the Options are appended to.
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * List of ids of options that should be rendered by default.
	 * @type {string[]}
	 */
	_defaultOptions: null,

	/**
	 * Definition of the options that should be rendered.
	 * @type {Object[]}
	 */
	_options: null,

	/**
	 * Options that shall be rendered currently. (It may not be possible to always render all
	 * options.)
	 * @type {string[]}
	 */
	_currentOptions: null,

	/**
	 * Renders the bar according to the submitted option ids.
	 *
	 * @param {string[]} [ids]
	 * @param {Object} [initialValues]
	 */
	render: function( ids, initialValues ) {
		this._currentOptions = $.merge( $.merge( [], this._defaultOptions ), ids || [] );

		this._$node.empty();

		for( var i = 0; i < this._options.length; i++ ) {
			var id = this._options[i].id;

			if( $.inArray( id, this._currentOptions ) !== -1 ) {
				this._$node.addClass( 'optioncontainer' )
				.append(
					$( '<div/>' )
					.addClass( 'optioncontainer-option' )
					.addClass( 'optioncontainer-option-' + id )
					.append( this._options[i].instance.render() )
				);
				if( initialValues && initialValues[id] ) {
					this._options[i].instance.value( initialValues[id] );
				}
			}
		}
	},

	/**
	 * Re-renders all options that are supposed to be displayed.
	 */
	_reRender: function() {
		var values = {},
			i;

		for( i = 0; i < this._options.length; i++ ) {
			values[this._options[i].id] = this._options[i].instance.value();
		}

		this.render( this._currentOptions );

		for( i = 0; i < this._options.length; i++ ) {
			this._options[i].instance.value( values[this._options[i].id] );
		}
	},

	/**
	 * Returns a specific option.
	 *
	 * @param {string|null} id
	 * @return {Option}
	 */
	getOption: function( id ) {
		for( var i = 0; i < this._options.length; i++ ) {
			if( id === this._options[i]['id'] ) {
				return this._options[i]['instance'];
			}
		}
		return null;
	},

	/**
	 * @param {AttributionGenerator} attributionGenerator
	 */
	setAttributionGenerator: function( attributionGenerator ) {
		for( var i = 0; i < this._options.length; i++ ) {
			this._options[i].instance.setAttributionGenerator( attributionGenerator );
		}
		this._reRender();
	}

} );

return OptionContainer;

} );

}( define ) );