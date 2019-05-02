function validateUsername(username) {
  if (username && username.match(/^[-a-z0-9_A-Z]/)) {
    return true;
  }
  return false;
}

exports.validateUsername = validateUsername;
