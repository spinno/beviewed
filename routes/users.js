var Hasher, colls, createHash, createSession, hash, valid;

colls = null;

Hasher = require('phpass').PasswordHash;

hash = new Hasher;

valid = function(pass, user) {
  return hash.checkPassword(pass, user.pass);
};

createHash = function(pass) {
  return hash.hashPassword(pass);
};

createSession = function(user, fn) {
  var date;
  date = new Date().getTime();
  return colls.sessions.post({
    target: user["_id"],
    expire: date + 36e5
  }, function(err, session) {
    return fn(err, session['_id']);
  });
};

exports.fetch = function(inColls) {
  return colls = inColls;
};

exports.authorize = function(req, fn) {
  var sid;
  sid = req.signedCookies['s_id'];
  if (sid) {
    return colls.sessions.get(sid, function(err, sess) {
      if (err) {
        return fn(err, null);
      } else if (!sess) {
        return fn("no-sess", null);
      } else {
        return colls.users.get(sess.target, function(err, user) {
          if (err) {
            return fn(err, null);
          } else {
            return fn(null, user);
          }
        });
      }
    });
  } else {
    return fn("no sid", null);
  }
};

exports.join = function(req, res) {
  return exports.authorize(req, function(err, user) {
    if (err) {
      return res.send({
        error: "auth-err"
      });
    } else {
      return colls.communities.get(req.params.id, function(err, community) {
        if (err) {
          return res.send({
            error: "community-err"
          });
        } else {
          user["in"].push(community['_id']);
          community.users.push(user["_id"]);
          community.userCount += 1;
          user.save();
          community.save();
          return res.send({
            joined: true
          });
        }
      });
    }
  });
};

exports.profile = {
  get: function(req, res) {
    return exports.authorize(req, function(err, user) {
      if (err) {
        return res.redirect("/");
      } else {
        return res.render("profile.html", {
          user: user,
          write: true
        });
      }
    });
  },
  put: function(req, res) {
    return exports.authorize(req, function(err, user) {
      if (err) {
        return res.send(403);
      } else {
        return colls.users.put(user['_id'], req.body, function(err) {
          if (err) {
            return res.send(500);
          } else {
            return res.send(200);
          }
        });
      }
    });
  }
};

exports.pubProfile = {
  get: function(req, res) {
    return exports.authorize(req, function(err, user) {
      if (err) {
        user = {
          id: ''
        };
      }
      return colls.users.get(req.params.id, function(err, user) {
        return res.render("profile.html", {
          user: user,
          write: false
        });
      });
    });
  }
};

exports.authentication = {
  signout: function(req, res) {
    var sid;
    sid = req.signedCookies['s_id'];
    if (!sid) {
      return res.send({
        error: "sess-err|c"
      });
    } else {
      return colls.sessions.get(sid, function(err, sess) {
        if (err) {
          return res.send({
            error: "sess-err|s"
          });
        } else {
          sess.remove();
          res.clearCookie("s_id");
          return res.send("success");
        }
      });
    }
  },
  login: function(req, res) {
    var email, pass;
    email = req.query.email;
    pass = req.query.pass;
    return colls.users.model.find().where("email", email).exec(function(err, user) {
      if (err || !user[0]) {
        return res.send({
          isValid: false,
          error: "Please check your credientials, no user with that email was found."
        });
      } else {
        if (!valid(pass, user[0])) {
          return res.send({
            isValid: false,
            error: "Invalid password / email combination."
          });
        } else {
          return createSession(user[0], function(err, sess) {
            if (err) {
              return res.send({
                isValid: false,
                error: "There was an error when trying to generate your login session."
              });
            } else {
              res.cookie("s_id", sess, {
                signed: true
              });
              return res.send({
                isValid: true
              });
            }
          });
        }
      }
    });
  },
  signup: function(req, res) {
    var email;
    email = req.body.email;
    return colls.users.model.find().where("email", email).exec(function(err, users) {
      if (err) {
        res.send({
          error: "usr-err"
        });
        return;
      }
      if (users.length > 0) {
        res.send({
          error: "usr-exists"
        });
        return;
      }
      return colls.users.post({
        email: email,
        pass: createHash(req.body.pass)
      }, function(err, user) {
        if (err) {
          return res.send({
            error: "post-err"
          });
        } else {
          return createSession(user, function(err, sess) {
            console.log("stage 3");
            if (err) {
              return res.send({
                error: "sess-err"
              });
            } else {
              res.cookie("s_id", sess, {
                signed: true
              });
              return res.send("reg");
            }
          });
        }
      });
    });
  }
};
