( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

/**
 * Represents a licence.
 * @constructor
 *
 * @param {string} id A licence id to be used as internal identifier. For consistency, is should
 *        match the template name on Commons. In addition, the HTML file in the "licences" folder
 *        containing the licence's legal code should be named with the id.
 * @param {string|RegExp} name The licence name how it should be displayed. May be a regular
 *        expression to generate an "abstract" licence object that may itself be used to generate a
 *        proper licence using Licence.newFromAbstract().
 * @param {RegExp|string|Object} [regExp] Regular expression used for detecting the licence
 *        analyzing the asset's Commons categories. If omitted, the name will be used for exact
 *        matching.
 * @param {string|Object} [url] The url to the licence.
 * @param {Object} [options] Default options overwrites:
 *        - {string} outputTemplate: Text template specifying the actual text output of the licence
 *          information. {{name}} is replaced with the licence name
 *
 * @throws {Error} if no proper parameters are specified.
 * @throws {Error} when trying to instantiate an "abstract" licence with an additional regExp.
 */
var Licence = function( id, name, regExp, url, options ) {
	if( !id ) {
		throw new Error( 'Internal id needs to be specified' );
	}

	this._id = id;

	if( $.isPlainObject( regExp ) ) {
		options = regExp;
		url = options;
		options = undefined;
	} else if( $.isPlainObject( url ) ) {
		options = url;
		url = undefined;
	}

	if( name instanceof RegExp && regExp instanceof RegExp ) {
		throw new Error( 'Trying to instantiate an abstract licence with an exact matching' );
	}

	if( name instanceof RegExp ) {
		this._regExp = name;
	} else if( typeof name === 'string' ) {
		this._name = name;
	} else {
		throw new Error( 'Name needs to be specified' );
	}

	if( regExp instanceof RegExp ) {
		this._regExp = regExp;
	} else {
		this._regExp = new RegExp( '/^' + name + '$/i' );
	}

	this._url = url || null;

	$.extend( this._options, ( options || {} ) );
};

$.extend( Licence.prototype, {
	/**
	 * Identifier for internal use.
	 * @type {string}
	 */
	_id: null,

	/**
	 * @type {Object}
	 */
	_options: {
		'outputTemplate': 'released under {{name}}'
	},

	/**
	 * @type {string|null}
	 */
	_name: null,

	/**
	 * @type {RegExp}
	 */
	_regExp: null,

	/**
	 * @type {string}
	 */
	_url: null,

	/**
	 * @return {boolean}
	 */
	isAbstract: function() {
		return !this._name;
	},

	/**
	 * Checks whether a string matches the licence definition.
	 *
	 * @param {string} string
	 * @return {boolean}
	 */
	match: function( string ) {
		return this._regExp.test( string );
	},

	/**
	 * @return {string}
	 */
	getId: function() {
		return this._id;
	},

	/**
	 * @return {string|null}
	 */
	getName: function() {
		return this._name;
	},

	/**
	 * @return {RegExp}
	 */
	getRegExp: function() {
		return this._regExp;
	},

	/**
	 * @return {string}
	 */
	getUrl: function() {
		return this._url;
	},

	/**
	 * Retrieves the licence text of a specific licence.
	 *
	 * @return {Object} jQuery Promise
	 *         Resolved parameters:
	 *         - {jQuery} Licence text.
	 *         Rejected parameters:
	 *         - {string} Error message.
	 */
	getLegalCode: function() {
		var self = this,
			deferred = $.Deferred();

		$.get( './licences/' + this._id + '.html' )
		.done( function( html ) {
			var $licence = $( '<div/>' )
			.addClass( 'licence-text' )
			.addClass( 'licence-' + self.getName() )
			.html( html );
			deferred.resolve( $licence );
		} )
		.fail( function() {
			deferred.reject( 'Failed retrieving licence text' );
		} );

		return deferred.promise();
	}

} );

/**
 * Instantiates a Licence object from an abstract Licence using a specified text string.
 *
 * @param {Licence} abstractLicence
 * @param {string} rawText
 * @return {Licence}
 */
Licence.newFromAbstract = function( abstractLicence, rawText ) {
	var url = rawText.replace( abstractLicence.getRegExp(), abstractLicence.getUrl() );
	return new Licence( rawText, url );
};

return Licence;

} );

}( define ) );