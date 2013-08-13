var colls;

colls = null;

exports.fetch = function(inColls) {
  return colls = inColls;
};

exports.profile = {
  get: function(req, res) {
    return colls.users.get(req.params.id, function(err, user) {
      if (err) {
        return res.send(500, err);
      } else {
        return res.render("profile.html", {
          user: user
        });
      }
    });
  }
};