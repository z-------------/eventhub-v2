var gulp = require("gulp");

var paths = {
  sass: ["./source/*.scss", "./source/*.sass"],
  sass_imports: ["./source/sass-imports/*"],
  copy: ["./source/**/*",
    "!./source/*.pug", "!./source/*.scss", "!./source/*.sass",
    "!./source/sass-imports/", "!./source/sass-imports/**/*"]
};

/* sass */

gulp.task("sass", function() {
  var postcss = require("gulp-postcss");
  var autoprefixer = require("autoprefixer");
  var sass = require("gulp-sass");

  return gulp.src(paths.sass)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([ autoprefixer({ browsers: ["last 2 versions"] }) ]))
    .pipe(gulp.dest("./public/"));
});

/* pug */

gulp.task("pug", function() {
  var pug = require("gulp-pug");

  return gulp.src("./source/*.pug")
    .pipe(pug())
    .pipe(gulp.dest("./public/"));
});

/* copy */

gulp.task("copy", function() {
  return gulp.src(paths.copy)
    .pipe(gulp.dest("./public/"));
});

/* watch */

gulp.task("watch", function() {
  gulp.watch(paths.sass.concat(paths.sass_imports), ["sass"]);
  gulp.watch("./source/*.pug", ["pug"]);
  gulp.watch(paths.copy, ["copy"]);
});

/* default: everything */

gulp.task("default", ["sass", "pug", "copy", "watch"]);
