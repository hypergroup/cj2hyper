/**
 * Transform a Collection+JSON resource into a hyper+json representation
 *
 * @param {Object} resource
 * @return {Object}
 */

module.exports = function(resource) {
  var root = get('collection', resource);
  if (!root) throw new Error('Missing root "collection" property');

  var hyperObj = {};
  mergeItem(hyperObj, root, null, true);

  var template = get('data', get('template', root));
  if (template) hyperObj.create = {
    enctype: 'application/collection+json',
    action: hyperObj.href,
    method: 'POST',
    input: transformInputs(template)
  };

  hyperObj.collection = get('items', root, []).map(function(item) {
    return mergeItem({}, item, template);
  });

  get('queries', root, []).forEach(function(query) {
    var rel = get('rel', query);
    // TODO is rel required?
    if (!rel) return;
    var form = hyperObj[rel] = {
      method: 'GET',
      input: {}
    };
    Object.keys(query).forEach(function(key) {
      if (key === 'rel') return;
      if (key === 'href') return form.action = query[key];
      if (key === 'data') return form.input = transformInputs(query[key]);
      form[key] = query[key];
    });
  });

  return hyperObj;
};

/**
 * Merge an item's properties into a document
 *
 * @param {Object} doc
 * @param {Object} item
 * @param {Array} template
 * @param {Boolean} isRoot
 * @return {Object}
 */

function mergeItem(doc, item, template, isRoot) {
  // TODO is href required?
  var href = doc.href = get('href', item);

  get('links', item, []).forEach(function(link) {
    var rel = get('rel', link);
    // TODO is rel required?
    if (!rel) return;
    var render = get('render', link);
    var out = doc[rel] = {};
    Object.keys(link).forEach(function(key) {
      if (key === 'rel' || key === 'render') return;
      if (key === 'href' && render === 'image') return out.src = link[key];
      out[key] = link[key];
    });
  });

  get('data', item, []).forEach(function(datum) {
    var name = get('name', datum);
    // TODO is name required?
    if (!name) return;
    /**
     * TODO consider an extension to hyper+json that allows for metadata
     *
     *   {
     *     "property": {
     *       "@value": 42,
     *       "prompt": "Secret to the universe"
     *     }
     *   }
     *
     * For now we'll just use "value"
     */
    doc[name] = get('value', datum);
  });

  if (template) doc.update = {
    enctype: 'application/collection+json',
    method: 'PUT',
    action: href,
    input: transformInputs(template, doc)
  }

  if (!isRoot) doc.delete = {
    method: 'DELETE',
    action: href
  };

  return doc;
}

/**
 * Transform CJ inputs into hyper rep, filling in any values
 *
 * @param {Array} inputs
 * @param {Object} values
 * @return {Object}
 */

function transformInputs(inputs, values) {
  var hyperInputs = {};
  inputs.forEach(mergeInput.bind(null, hyperInputs, values));
  return hyperInputs;
}

/**
 * Merge input into inputs
 *
 * @param {Object} inputs
 * @param {Object} values
 * @param {Object} input
 */

function mergeInput(inputs, values, input) {
  var name = get('name', input);
  // TODO is name required?
  if (!name) return;
  var out = inputs[name] = {};
  Object.keys(input).forEach(function(key) {
    if (key === 'name') return;
    if (!values || key !== 'value') return out[key] = input[key];
    var value = values[name];
    if (!value || typeof value !== 'object') return out.value = value;
    out.value = value.href || value.src || value['@value'];
  });
}

/**
 * Gracefully get a value
 *
 * @param {String} key
 * @param {Any} obj
 * @param {Any} fallback
 * @return {Any}
 */

function get(key, obj, fallback) {
  if (!obj) return undefined;
  if (obj.hasOwnProperty(key)) return obj[key];
  return fallback;
}
