import express from "express";
import cors from "cors";
import questionRouter from "./apps/questionRouter.mjs";


const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use("/questions", questionRouter);  

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
