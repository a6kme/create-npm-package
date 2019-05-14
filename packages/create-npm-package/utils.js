function validateUsername(username) {
  if (username && username.match(/^[-a-z0-9_A-Z]/)) {
    return true;
  }
  return false;
}

const JsType = {
  ES5: 'ES5',
  ES6: 'ES6',
  TypeScript: 'TypeScript'
};

function camelCased(name) {
  return name.replace(/-([a-zA-Z0-9])/g, function(g) {
    return g[1].toUpperCase();
  });
}

exports.validateUsername = validateUsername;
exports.JsType = JsType;
exports.camelCased = camelCased;
