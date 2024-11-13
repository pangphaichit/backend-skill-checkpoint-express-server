import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const postQuestion = Router();

postQuestion.post("/", async (req, res) => {

    const newQuestion = req.body;
  
    try {
      const query = `insert into questions (title, description, category)
      values ($1, $2, $3) returning id`;
  
      const values = [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
      ];
  
      const result = await connectionPool.query(query, values);
      const questionId = result.rows[0].id;
      return res.status(201).json({  message: `Question id: ${questionId} has been created successfully`, });
    } catch {
        console.error('Error details:', error); 
        return res.status(500).json({
          message: "Server could not create question because database connection.",
        });
    }
  });

postQuestion.get("/", async (req, res) => {
    try {
const result = await connectionPool.query("select * from questions");
return res.status(200).json({
data: result.rows,
});
} catch (e) {
    console.error(e);  
    return res.status(500).json({
      message: "Server could not read question because of a database connection issue"
    });
  }
});

postQuestion.get("/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      const query = "SELECT * FROM questions WHERE id = $1";
      const result = await connectionPool.query(query, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested question"
        });
      }
  
      return res.status(200).json({
        data: result.rows[0],
      });
    } catch (e) {
      console.error(e);  
      return res.status(500).json({
        message: "Server could not read question because of a database connection issue"
      });
    }
  });

postQuestion.put("/:id", async (req, res) => {
    const id = req.params.id;  
    const { title, description, category } = req.body;  
  
    try {
      const checkQuery = "SELECT * FROM questions WHERE id = $1";
      const checkResult = await connectionPool.query(checkQuery, [id]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested question to update"
        });
      }
  
      const updateQuery = `
        UPDATE questions
        SET title = $1, description = $2, category = $3
        WHERE id = $4
        RETURNING *;
      `;
      const values = [title, description, category, id];
  
      const updateResult = await connectionPool.query(updateQuery, values);
      const updatedQuestion = updateResult.rows[0];
  
      return res.status(200).json({
        message: "Question updated successfully",
        question: updatedQuestion,
      });
  
    } catch (e) {
      console.error(e);  
      return res.status(500).json({
        message: "Server could not update question because of a database connection issue"
      });
    }
  });

postQuestion.delete("/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      const checkQuery = "SELECT * FROM questions WHERE id = $1";
      const result = await connectionPool.query(checkQuery, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested question to delete",
        });
      }
  
      const deleteQuery = "DELETE FROM questions WHERE id = $1";
      await connectionPool.query(deleteQuery, [id]);
  
      return res.status(200).json({
        message: `Question id: ${id} has been deleted successfully`,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Server could not delete question because database connection",
      });
    }
  });

export default postQuestion;