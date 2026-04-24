const app = require("./src/app");
const connectDB = require("./src/config/db")


require("dotenv").config();


const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, (req,res) => {
    console.log(`Server Listen at http://localhost:${PORT}`);
});
