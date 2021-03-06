var extend = require('xtend');
var request = require('request');

/**
 * <b>Cyclades API Client</b>.
 * @constructor
 * @param {string}    endpoint      Your Cyclades API endpoint
 * @param {string}    token         Your Cyclades API token
 * @author Christos Kanellopoulos <skanct@gmail.com>
 */
var Cyclades = function(endpoint, token) {
	this.API_URL = endpoint
	this.token = token
};
module.exports = Cyclades;

/**
 * <b>Helper to handle requests to the API with authorization</b>.
 *
 * @private
 * @param {string}    url             address part after API root
 * @param {Object}    parameters      additional parameters
 * @callback          complete
 * @memberof Cyclades
 * @method call
 */
Cyclades.prototype._call = function(method, url, parameters, callback) {
	var getURL = this.API_URL + '/' + url
	request[method]({
		url: getURL,
		headers: {
			'X-Auth-Token': this.token,
			'Content-Type': 'application/json'
		},
		strictSSL: true,
		json: true,
		body: parameters
	}, function(error, response, body) {
		if (!error && !!response.statusCode && response.statusCode >= 400) {
			error = new Error();
			error.status_code = response.statusCode;
			error.status_message = response.statusMessage;
		}
		callback(error, body || { statusCode: response.statusCode, statusMessage: response.statusMessage });
	});
};

/**
 * <b>List Servers</b>.
 * This method returns all virtual servers owned by the user.
 * @callback   complete
 * @memberof Cyclades
 * @method serverList
 */
Cyclades.prototype.serverList = function(callback) {
	this._call('get', 'servers', {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>List Servers with details</b>.
 * This method returns all virtual servers owned by the user. All available API information is presented for each server.
 * @callback   complete
 * @memberof Cyclades
 * @method serverListDetail
 */
Cyclades.prototype.serverListDetail = function(callback) {
	this._call('get', 'servers/detail', {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>Create Server</b>.
 * This method allows you to create a new server. See the required parameters section below for an explanation of the variables that are needed to create a new server.
 * @param {string}    name                             Required, this is the name of the server
 * @param {string}    imageId                          Required, this is the id of the image you would like to be used for the server
 * @param {number}    flavorId                         Required, this is the id of the flavor you would like to be used for the server create
 * @param {Object}    optionals                        Optional values
 * @param {Object[]}  optionals.personality            A list of personality injections
 * @param {string}    optionals.personality[].path     The path (including name) for the file on the remote server. If the file does not exist, it will be created
 * @param {string}    optionals.personality[].contents The data to be injected, must not exceed 10240 bytes and must be base64-encoded
 * @param {string}    optionals.personality[].owner    The file owner
 * @param {string}    optionals.personality[].group    The file group
 * @param {number}    optionals.personality[].mode     The file access mode
 * @param {Object[]}  optionals.networks               The networks attribute is not provided. the service will apply its default policy (e.g., automatic public network and IP assignment). If the network attribute is an empty list, the virtual server will not have any network connections
 * @param {string}    optionals.networks[].uuid        Provide an existing network ID. In that case, the virtual server will be connected to that network.
 * @param {string}    optionals.networks[].fixed_ip    Provide an existing network ID and an IP (which is already associated to that network). In that case, the virtual server will be connected to that network with this specific IP attached.
 * @param {string}    optionals.networks[].port        Provide an existing port ID to establish a connection through it.
 * @param {Object}    optionals.metadata               key:value pairs of custom server-specific metadata. There are no semantic limitations, although the OS and USERS values should rather be defined
 * @param {string}    optionals.project	               The project where the VM is to be assigned. If not given, user’s system project is assumed (identified with the same uuid as the user)
 * @callback          complete
 * @memberof Cyclades
 * @method serverCreate
 */
Cyclades.prototype.serverCreate = function(name, imageId, flavorId, optionals, callback) {
	var options = {
		name: name,
		imageRef: imageId,
		flavorRef: flavorId
	};

	options = extend(options, optionals);
	var options = {
		server: options
	}

	this._call('post', 'servers', options, function(error, httpResponse, body) {
		callback(error, httpResponse);
	});
};

/**
 * <b>Get Server Details</b>.
 * This method returns etailed information for a virtual server
 * @param {number}    id              Required, this is the id of your server
 * @callback          complete
 * @memberof Cyclades
 * @method serverGet
 */
Cyclades.prototype.serverGet = function(id, callback) {
	this._call('get', 'servers/' + id, {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>Reboot Server</b>.
 * This method transitions a server from ACTIVE to REBOOT and then ACTIVE again.
 * @param {number}    id              Required, this is the id of your server that you want to reboot
 * @callback          complete
 * @memberof Cyclades
 * @method serverReboot
 */
Cyclades.prototype.serverReboot = function(id, callback) {
	var options = {
		reboot: {
			type: 'SOFT'
		}
	};
	this._call('post', 'servers/' + id + '/action', options, function(error, httpResponse, body) {
		callback(error, httpResponse);
	});
};

/**
 * <b>Delete Server</b>.
 * This method deletes a virtual server. When a server is deleted, all its attachments (ports) are deleted as wel
 * @param {number}    id              Required, this is the id of the server you want to destroy
 * @callback          complete
 * @memberof Cyclades
 * @method serverDelete
 */
Cyclades.prototype.serverDelete = function(id, callback) {
	this._call('del', 'servers/' + id, {}, function(error, httpResponse, body) {
		callback(error, httpResponse);
	});
};

/**
 * <b>All Images</b>.
 * This method returns all the available images that can be accessed by your client ID.
 * @memberof Cyclades
 * @method imageList
 */
Cyclades.prototype.imageList = function(callback) {
	this._call('get', 'images', {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>All Images with details</b>.
 * This method returns all the available images that can be accessed by your client ID including the extra details
 * @callback   complete
 * @memberof Cyclades
 * @method imageListDetail
 */
Cyclades.prototype.imageListDetail = function(callback) {
	this._call('get', 'images/detail', {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>Get Image Details</b>.
 * This method returns etailed information for an image
 * @param {number}    id              Required, this is the id the image
 * @callback          complete
 * @memberof Cyclades
 * @method imageGet
 */
Cyclades.prototype.imageGet = function(id, callback) {
	this._call('get', 'images/' + id, {}, function(error, body) {
		callback(error, body);
	});
};


/**
 * <b>All Flavors</b>.
 * This method returns all the available flavors.
 * @memberof Cyclades
 * @method flavorList
 */
Cyclades.prototype.flavorList = function(callback) {
	this._call('get', 'flavors', {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>All Flavors with details</b>.
 * This method returns all the available flavors with detailed information
 * @callback   complete
 * @memberof Cyclades
 * @method flavorListDetail
 */
Cyclades.prototype.flavorListDetail = function(callback) {
	this._call('get', 'flavors/detail', {}, function(error, body) {
		callback(error, body);
	});
};

/**
 * <b>Get Flavor Details</b>.
 * This method returns etailed information for an image
 * @param {number}    id              Required, this is the id the image
 * @callback          complete
 * @memberof Cyclades
 * @method flavorGet
 */
Cyclades.prototype.flavorGet = function(id, callback) {
	this._call('get', 'flavors/' + id, {}, function(error, body) {
		callback(error, body);
	});
};