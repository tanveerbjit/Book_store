const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require('passport');
const cookieSession = require('cookie-session');
require("./util/passport")
const isAdmin = require("./middleware/isAdmin");
const multer = require("multer");
const upload = multer();
const app = express();
const DBserver = require('./DBserver');
const failure = require("./helpers/failed");
const isUser = require("./middleware/isUser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Dhaka');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

const port = process.env.PORT || 8000;

app.use(cookieSession({
  name: 'google-auth-session',
  keys: ['oAuth2']
}))


app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());



app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).json(failure("Invalide JSON Format"));
  }
  next();
});

app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/admin", isAdmin, require("./routes/adminRoutes"));
app.use("/api/v1/user", isUser, require("./routes/userRoutes"));
app.use("/api/v1/product", require("./routes/productRoutes"));



app.use(errorHandler);


app.use((req, res) => {
  res
    .status(404)
    .json(failure("The requested resource was not found on this server."));
});


DBserver.connect(()=>{
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
