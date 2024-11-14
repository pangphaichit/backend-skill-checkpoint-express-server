import express from "express";
import swaggerUi from "swagger-ui-express"; 
import swaggerJSDoc from "swagger-jsdoc"; 
import cors from "cors";
import questionRouter from "./apps/questionRouter.mjs";
import answerRouter from "./apps/answerRouter.mjs";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'This API provides functionalities for managing questions and answers.',
  },
  servers: [
    {
      url: 'http://localhost:4000', 
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./apps/*.mjs'], 
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/questions", questionRouter);  
app.use("/answers", answerRouter);  

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});
