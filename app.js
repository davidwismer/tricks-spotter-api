import express from "express";
import createError from "http-errors";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import spotsRouter from "./routes/spots.js";
import tricksRouter from "./routes/tricks.js";
import loginRouter from "./routes/login.js"
import mongoose from 'mongoose';

//Connection to database
mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tricks-spotter-api');

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/spots", spotsRouter);
app.use("/tricks", tricksRouter);
app.use("/login", loginRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
