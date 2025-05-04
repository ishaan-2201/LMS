import express from "express";
import cors from "cors";

import "dotenv/config";
import connectToDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

//Initialize express
const app = express();

//Connect to Database
await connectToDB();

//Middlewares
app.use(cors());

//Routes
app.get("/", (req, res) => res.send("Hello from the express server"));
app.post("/clerk", express.json(), clerkWebhooks);

//Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
