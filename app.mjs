import express from "express";
import cors from "cors";
import postQuestion from "./apps/questionRouter.mjs";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use("/questions", postQuestion);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
