const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const staticRouter = require("./routes/staticRoute");
const userRouter = require("./routes/user");
const { connectMongoDb } = require("./connection");
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//connecting to mongodb
connectMongoDb(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

//Routes
app.use("/", staticRouter);
app.use("/user", userRouter);

//Now using ejs
app.set("view engine", "ejs"); // setting the view engine to ejs
app.set("views", path.resolve("./views")); // setting the views folder to views/ejs

app.use(express.static("views"));
app.use("/image", express.static("views/images"));

app.use("/uploads", express.static("uploads"));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, ${new Date()} `);
});
