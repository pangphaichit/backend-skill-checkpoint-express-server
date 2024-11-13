import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateQuestionData from "../middlewares/questiontValidation.mjs";

const postQuestion = Router();

postQuestion.post("/", validateQuestionData, async (req, res) => {

    const newQuestion = req.body;
  
    try {
      const query = `insert into questions (title, description, category)
      values ($1, $2, $3)`;
  
      const values = [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
      ];
  
      await connectionPool.query(query, values);
      return res.status(201).json({  message: "Question created successfully." });
    } catch {
        console.error('Error details:', error); 
        return res.status(500).json({
          message: "Unable to create question."
        });
    }
  });

postQuestion.get("/", async (req, res) => {
    try {
const result = await connectionPool.query("SELECT * FROM questions");
return res.status(200).json({
data: result.rows,
});
} catch (e) {
    console.error(e);  
    return res.status(500).json({
      message: "Unable to fetch questions."
    });
  }
});

postQuestion.get("/:questionId", async (req, res) => {
    const questionId = req.params.questionId;
  
    try {
      const query = "SELECT * FROM questions WHERE id = $1";
      const result = await connectionPool.query(query, [questionId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found."
        });
      }
  
      return res.status(200).json({
        data: result.rows[0],
      });
    } catch (e) {
      console.error(e);  
      return res.status(500).json({
        message: "Unable to fetch questions."
      });
    }
  });

postQuestion.put("/:questionId", validateQuestionData, async (req, res) => {
    const questionId = req.params.questionId;  
    const { title, description, category } = req.body;  
  
    try {
      const checkQuery = "SELECT * FROM questions WHERE id = $1";
      const checkResult = await connectionPool.query(checkQuery, [questionId]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found."
        });
      }
  
      const updateQuery = `
        UPDATE questions
        SET title = $1, description = $2, category = $3
        WHERE id = $4
        RETURNING *;
      `;
      const values = [title, description, category, questionId];
  
      const updateResult = await connectionPool.query(updateQuery, values);
      const updatedQuestion = updateResult.rows[0];
  
      return res.status(200).json({
        message: "Question updated successfully"
      });
  
    } catch (e) {
      console.error(e);  
      return res.status(500).json({
        message: "Unable to fetch questions."
      });
    }
  });

postQuestion.delete("/:questionId", async (req, res) => {
    const questionId = req.params.questionId;
  
    try {
      const checkQuery = "SELECT * FROM questions WHERE id = $1";
      const result = await connectionPool.query(checkQuery, [questionId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }
  
      const deleteQuery = "DELETE FROM questions WHERE id = $1";
      await connectionPool.query(deleteQuery, [questionId]);
  
      return res.status(200).json({
        message: "Question post has been deleted successfully.",
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Unable to delete question."
      });
    }
  });

export default postQuestion;