import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateQuestionData from "../middlewares/questionValidation.mjs";
import validateAnswerData from "../middlewares/AnswerValidation.mjs";

const questionRouter = Router();

questionRouter.post("/", validateQuestionData, async (req, res) => {

    const newQuestion = req.body;
  
    try {
      const query = `INSERT INTO questions (title, description, category)
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

  questionRouter.get("/search", async (req, res) => {
    try {
        const { category, title } = req.query;
        
        let query = "SELECT * FROM questions";
        let values = [];
        let conditions = [];
        let counter = 1;
        
        if (title) {
            conditions.push(`title ILIKE $${counter}`);
            values.push(`%${title}%`);
            counter++;
          }

        if (category) {
            conditions.push(`category ILIKE $${counter}`);
            values.push(`%${category}%`);
            counter++;
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
          }

        const result = await connectionPool.query(query, values);

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

questionRouter.get("/", async (req, res) => {
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

questionRouter.get("/:questionId", async (req, res) => {
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

questionRouter.put("/:questionId", validateQuestionData, async (req, res) => {
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

questionRouter.delete("/:questionId", async (req, res) => {
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

  questionRouter.post("/:questionId/answers", validateAnswerData, async (req, res) => {
    const questionId = req.params.questionId;
    const newAnswer = req.body;
  
    try {
      const checkQuestionQuery = "SELECT * FROM questions WHERE id = $1";
      const checkQuestionResult = await connectionPool.query(checkQuestionQuery, [questionId]);
  
      if (checkQuestionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found."
        });
      }
  
      const query = `INSERT INTO answers (content, question_id) VALUES ($1, $2)`;
      const values = [
        newAnswer.content,
        questionId
      ];
  
      await connectionPool.query(query, values);
  
      return res.status(201).json({
        message: "Answer created successfully."
      });
    } catch (error) {
      console.error('Error details:', error); 
      return res.status(500).json({
        message: "Unable to create answer."
      });
    }
  });

  questionRouter.get("/:questionId/answers", async (req, res) => {
    const { questionId } = req.params;  

    try {
        const query = `
            SELECT id, content
            FROM answers
            WHERE question_id = $1
        `;
        const result = await connectionPool.query(query, [questionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        return res.status(200).json({
            data: result.rows
        });
    } catch (error) {
        console.error('Error details:', error);
        return res.status(500).json({
            message: "Unable to fetch answers."
        });
    }
});

questionRouter.delete("/:questionId/answers", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const checkQuestionQuery = "SELECT * FROM questions WHERE id = $1";
    const checkQuestionResult = await connectionPool.query(checkQuestionQuery, [questionId]);

    if (checkQuestionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const checkAnswersQuery = "SELECT * FROM answers WHERE question_id = $1";
    const checkAnswersResult = await connectionPool.query(checkAnswersQuery, [questionId]);

    if (checkAnswersResult.rows.length === 0) {
      return res.status(404).json({
        message: "No answers found for this question.",
      });
    }

    const deleteAnswersQuery = "DELETE FROM answers WHERE question_id = $1";
    await connectionPool.query(deleteAnswersQuery, [questionId]);

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Unable to delete answers."
    });
  }
});

export default questionRouter;