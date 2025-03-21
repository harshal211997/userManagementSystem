const app = require("./app.js");
const dotEnv = require("dotenv");
const rateLimit = require("express-rate-limit");
const userRouter = require("./router/userRouter.js");
const userRoleRouter = require("./router/userRoleRouter.js");
//
dotEnv.config({ path: "./conf.env" });
//
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;
//
const createDbTable = require("./createDBTable.js");
//
createDbTable();

const limiter = rateLimit({
  //we are limited 10 request from one IP in 1hr
  max: 10,
  windowMs: 60 * 60 * 1000,
  //message if limit cross
  message: "To many request from this IP, please try again after an hour!",
});
//applying limiter middleware for all request coming from /api
app.use("/api", limiter);
//routing
app.use("/api/v1/users", userRouter);
app.use("/api/v1/userRoles", userRoleRouter);
//Creating the server:
app.listen(PORT, HOST, () => {
  console.log(`User Management App Started to listen on PORT ${PORT}...`);
});
