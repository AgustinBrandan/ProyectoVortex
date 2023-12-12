const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Error
const HttpError = require("./models/http.error");
// Users
const userRoutes = require("./routes/user-routes");
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use("/api/users", userRoutes); // /api/users

// Manejo rutas no definidas
app.use((req, res, next) => {
    throw new HttpError("Esta Ruta no existe", 404);
  });
// Middleware de manejo de errores
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || "Error desconocido" });
});


const mongoURL = 'mongodb+srv://agustin:' + process.env.DB_PASSWORD + '@cluster0.9jzc9h0.mongodb.net/?retryWrites=true&w=majority';

// Conexión a la base de datos
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(5000);
    console.log("Conexión a la base de datos establecida");
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error);
  });


