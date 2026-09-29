const express = require("express");
const path = require("path");
const crypto = require("crypto");
const methodOverride = require("method-override");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const passport = require("./config/passport");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");
const searchRoutes = require("./routes/search");

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));
app.use(express.json());
app.use(methodOverride("_method"));
const sessionSecret =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET) {
  console.warn(
    "SESSION_SECRET is missing. A temporary secret is being used; sessions will reset whenever the server restarts.",
  );
}
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

app.get("/", (req, res) => res.redirect("/feed"));
app.use("/feed/:postId/comments", commentRoutes);
app.use("/feed", postRoutes);
app.use(userRoutes);
app.use(searchRoutes);
app.all("/*splat", (req, res, next) => next(new ExpressError("Page not found.", 404)));

app.use((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    error.statusCode = 400;
    error.message = "Image files must be 2 MB or smaller.";
  }
  const statusCode = error.statusCode || error.status || 500;
  if (error.code === 11000) error.message = "That username or email is already in use.";
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).render("error", { error });
});

module.exports = app;
