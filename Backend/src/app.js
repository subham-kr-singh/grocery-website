const express = require("express");
const cors = require("cors")
const app = express();

// require routes 
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const productRoutes = require("./routes/product.routes");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors)


// routes
app.use((req, res) => {
  res.send("page Not Found");
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products" , productRoutes);


exports.modules = app;
