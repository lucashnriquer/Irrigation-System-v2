const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const ip = require("ip");
console.dir(ip.address());

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/irrigationDB");

const DeviceSchema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
    unique: true,
  },
  user: String,
  name: String,
  led_status: {
    type: Boolean,
    default: false,
  },
  data: {
    type: String,
    default: 0,
  },
  threshold: {
    type: Number,
    default: 45,
  },
  force: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  devices: [],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Device = mongoose.model("Device", DeviceSchema);
const User = mongoose.model("User", UserSchema);

app.get("/", (req, res) => {
  res.render("landing");
});

app.post("/button/:username/:id", (req, res) => {
  Device.updateOne(
    { id: req.params.id },
    { led_status: req.body.led_status, force: true },
    (err, response) => {
      if (err) {
        res.send(err);
      }
    }
  );
  res.redirect("back");
});

app
  .route("/devices")
  .get((req, res) => {
    Device.find((err, devices) => {
      if (err) {
        res.send(err);
      } else {
        res.send(devices);
      }
    });
  })
  .post((req, res) => {
    Device.findOne({ id: req.body.id }).then((device) => {
      if (device) {
        res.send("This device already exists.");
      } else {
        const newDevice = new Device({
          id: req.body.id,
          name: req.body.name,
        });
        newDevice.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.send(newDevice);
          }
        });
      }
    });
  })
  .delete((req, res) => {
    Device.deleteMany((err) => {
      if (err) {
        res.send(err);
      } else {
        res.send("Successfully deleted all devices.");
      }
    });
  });

app
  .route("/devices/:id")
  .get((req, res) => {
    Device.findOne({ id: req.params.id }, (err, device) => {
      if (err) {
        res.send(err);
      } else {
        if (device) {
          res.send(device);
        } else {
          res.send("No device matching this id.");
        }
      }
    });
  })
  .put((req, res) => {
    Device.replaceOne({ id: req.params.id }, req.body, (err, response) => {
      if (err) {
        res.send(err);
      } else {
        if (response.modifiedCount) {
          res.send("Successfully updated device.");
        } else {
          res.send("No device matching this id.");
        }
      }
    });
  })
  .patch((req, res) => {
    Device.updateOne({ id: req.params.id }, req.body, (err, response) => {
      if (err) {
        res.send(err);
      } else {
        if (response.modifiedCount) {
          res.send("Successfully updated device.");
        } else {
          res.send("No device matching this id.");
        }
      }
    });
  })
  .delete((req, res) => {
    Device.deleteOne({ id: req.params.id }, (err, response) => {
      if (err) {
        res.send(err);
      } else {
        if (response.deletedCount) {
          res.send("Successfully deleted device.");
        } else {
          res.send("No device matching this id.");
        }
      }
    });
  });

app
  .route("/users")
  .get((req, res) => {
    User.find((err, users) => {
      if (err) {
        res.send(err);
      } else {
        res.send(users);
      }
    });
  })
  .post((req, res) => {
    User.findOne({ username: req.body.username }).then((user) => {
      if (user) {
        res.send("This user already exists.");
      } else {
        const newUser = new User({
          username: req.body.username,
          password: req.body.password,
        });
        newUser.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.send(newUser);
          }
        });
      }
    });
  })
  .delete((req, res) => {
    User.deleteMany((err) => {
      if (err) {
        res.send(err);
      } else {
        res.send("Successfully deleted all users.");
      }
    });
  });

app
  .route("/users/:username")
  .get((req, res) => {
    User.findOne({ username: req.params.username }, (err, user) => {
      if (err) {
        res.send(err);
      } else {
        if (user) {
          res.send(user);
        } else {
          res.send("No user matching this username.");
        }
      }
    });
  })
  .put((req, res) => {
    User.replaceOne(
      { username: req.params.username },
      req.body,
      (err, response) => {
        if (err) {
          res.send(err);
        } else {
          if (response.modifiedCount) {
            res.send("Successfully updated user.");
          } else {
            res.send("No user matching this username.");
          }
        }
      }
    );
  })
  .patch((req, res) => {
    User.updateOne(
      { username: req.params.username },
      req.body,
      (err, response) => {
        if (err) {
          res.send(err);
        } else {
          if (response.modifiedCount) {
            res.send("Successfully updated user.");
          } else {
            res.send("No user matching this username.");
          }
        }
      }
    );
  })
  .delete((req, res) => {
    User.deleteOne({ username: req.params.username }, (err, response) => {
      if (err) {
        res.send(err);
      } else {
        if (response.deletedCount) {
          res.send("Successfully deleted user.");
        } else {
          res.send("No user matching this username.");
        }
      }
    });
  });

app.route("/:username/mydevices").get((req, res) => {
  Device.find({ user: req.params.username }, (err, devices) => {
    if (err) {
      res.send(err);
    } else {
      if (devices) {
        res.render("home", {
          user: { username: req.params.username, devices: devices },
        });
      } else {
        res.send("No user matching this username.");
      }
    }
  });
});

app.route("/config/:id").get((req, res) => {
  Device.findOne({ id: req.params.id }, (err, device) => {
    if (err) {
      res.send(err);
    } else {
      if (device) {
        res.render("device", { device: device });
      } else {
        res.send("No device matching this id.");
      }
    }
  });
});

app.route("/config/:id/submit").post((req, res) => {
  Device.updateOne({ id: req.params.id }, req.body, (err, response) => {
    if (err) {
      res.send(err);
    } else {
      if (response.modifiedCount) {
        res.redirect("/" + req.body.user + "/mydevices");
      } else {
        res.send("No device matching this id.");
      }
    }
  });
});

app.route("/add/:username/:id").post((req, res) => {
  User.findOne({ username: req.params.username }, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      if (user) {
        Device.findOne({ id: req.params.id }, (err, device) => {
          if (err) {
            res.send(err);
          } else {
            if (device) {
              user.devices.push(device.id);
              user.save();
            } else {
              res.send("No device matching this id.");
            }
          }
        });
        Device.updateOne(
          { id: req.params.id },
          { user: req.params.username },
          (err, response) => {
            if (err) {
              res.send(err);
            } else {
              if (response.modifiedCount) {
                res.send("Successfully updated device.");
              } else {
                res.send("No device matching this id.");
              }
            }
          }
        );
      } else {
        res.send("No user matching this username.");
      }
    }
  });
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username }, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        if (user) {
          if (user.password === password) {
            res.redirect("/" + user.username + "/mydevices");
          } else {
            res.send("Wrong password.");
          }
        } else {
          res.send("This user doesn't exist.");
        }
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.findOne({ username: req.body.username }).then((user) => {
      if (user) {
        res.send("This user already exists.");
      } else {
        const newUser = new User({
          username: req.body.username,
          password: req.body.password,
        });
        newUser.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.redirect("/" + newUser.username + "/mydevices");
          }
        });
      }
    });
  });

app.get("/monitor", (req, res) => {
  Device.find((err, devices) => {
    if (err) {
      res.send(err);
    } else {
      res.render("home", {
        user: { devices: devices, username: "LANDINGPAGE" },
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
