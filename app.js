/*
Module dependencies.
*/

var app, attributes, express, http, path, routes, server, services, swoosh, timers;

express = require("express");

http = require("http");

path = require("path");

routes = require('./routes');

swoosh = require('swoosh');

timers = require('timers');

services = require("./services");

attributes = require('./attributes');

app = express();

swoosh(path.join(__dirname, "swoosh.yml"), attributes, function(err, collections) {
  if (err) {
    return console.log("Swoosh err:", err);
  } else {
    this.route(app);
    routes.fetch(collections);
    return timers.setInterval((function() {
      return routes.community.log();
    }), 864e5);
  }
});

app.engine("html", require('ejs').renderFile);

app.set("port", process.env.PORT || 3000);

app.set("views", __dirname + "/views");

app.set("view engine", "ejs");

app.use(express.favicon());

app.use(express.logger("dev"));

app.use(express.compress("dev"));

app.use(express.cookieParser("$xx$"));

app.use(express.bodyParser());

app.use(express.methodOverride());

app.use(app.router);

app.use(express["static"](path.join(__dirname, "client")));

app.get("/", routes.index.get);

app.get("/profile", routes.users.profile.get);

app.get("/community/:id", routes.community.get);

app.get("/explore", routes.explore.get);

app.get("/dashboard", routes.dashboard.get);

app.get("/create-community", routes["create-community"].get);

app.get("/community-min/:id", routes.community.min.get);

app.get("/community-explore/:type", routes.community.explore.get);

app.get("/write", routes.write.get);

app.get("/api/community/:id", routes.community.api.get);

app.get("/api/feed/multi/:from?/:to", routes.feed.api.multi);

app.get("/api/feed/:community/:type/:from?/:to", routes.feed.api.get);

app.get("/login", routes.users.authentication.login);

app.get("/profile/:id", routes.users.pubProfile.get);

app.put("/profile", routes.users.profile.put);

app.post("/signout", routes.users.authentication.signout);

app.post("/signup", routes.users.authentication.signup);

app.post("/create-community", routes.community.post);

app.post("/new-feed/:id", routes.write.newFeed);

app.post("/join/:id", routes.users.join);

if ("development" === app.get("env")) {
  app.use(express.errorHandler());
}

server = http.createServer(app);

services.init(server);

server.listen(app.get("port"), function() {
  return console.log("Express server listening on port " + app.get("port"));
});
