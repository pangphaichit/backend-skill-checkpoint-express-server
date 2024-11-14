import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateQuestionData from "../middlewares/questionValidation.mjs";
import validateAnswerData from "../middlewares/AnswerValidation.mjs";
import validateVoteData from "../middlewares/voteValidation.mjs";
import validateSearchParamsData from "../middlewares/searchValidation.mjs";

const questionRouter = Router();

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     description: Create a new question with a title, description, and category.
 *     tags:
 *       - Questions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "What is the capital of France?"
 *               description:
 *                 type: string
 *                 example: "This is a basic geography question asking about the capital city of France."
 *               category:
 *                 type: string
 *                 example: "Geography"
 *             required:
 *               - title
 *               - description
 *               - category
 *     responses:
 *       201:
 *         description: Question created successfully.
 *       500:
 *         description: Unable to create question.
 */
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
    } catch (error) {
        console.error('Error details:', error); 
        return res.status(500).json({
          message: "Unable to create question."
        });
    }
  });

  /**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search for questions by category and title
 *     description: This endpoint allows you to search for questions by category and/or title. Both parameters are optional.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: The category of the question to filter by. Use "null" to filter by questions with no category.
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *         description: The title of the question to search for. Partial matching with wildcards is supported.
 *     responses:
 *       200:
 *         description: Successfully fetched questions.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to fetch questions.
 */

  questionRouter.get("/search", validateSearchParamsData, async (req, res) => {
    try {
      let { category, title } = req.query;
  
      const normalizedCategory = category ? category.toLowerCase() : null;
      const normalizedTitle = title ? title.toLowerCase() : null;
  
      let query = "SELECT * FROM questions";
      let values = [];
      let conditions = [];
      let counter = 1;
  
      if (normalizedTitle) {
        conditions.push(`title ILIKE $${counter}`);
        values.push(`%${normalizedTitle}%`);
        counter++;
      }
  
      if (normalizedCategory) {
        if (normalizedCategory === "null") {
          conditions.push(`category IS NULL`);
        } else {
          conditions.push(`category ILIKE $${counter}`);
          values.push(`%${normalizedCategory}%`);
          counter++;
        }
      }
 
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      const result = await connectionPool.query(query, values);
  
      if (result.rows.length === 0) {
        console.log("No matching questions found.");
        return res.status(404).json({ message: "Question not found." });
      }
  
      return res.status(200).json({
        data: result.rows,
      });
  
    } catch (error) {
      console.error("Error executing query: ", error);
  
      return res.status(500).json({
        message: "Unable to fetch questions.",
      });
    }
  });
  
/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get a list of all questions
 *     description: This endpoint returns a list of all questions stored in the database.
 *     tags:
 *       - Questions
 *     responses:
 *       200:
 *         description: Successfully fetched all questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the question.
 *                       title:
 *                         type: string
 *                         description: The title of the question.
 *                       description:
 *                         type: string
 *                         description: A description of the question.
 *                       category:
 *                         type: string
 *                         description: The category under which the question falls.
 *       500:
 *         description: Unable to fetch questions.
 */

questionRouter.get("/", async (req, res) => {
    try {
const result = await connectionPool.query("SELECT * FROM questions");
return res.status(200).json({
data: result.rows,
});
} catch (error) {
    console.error(error);  
    return res.status(500).json({
      message: "Unable to fetch questions."
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Retrieve a specific question by ID
 *     description: Fetches a question from the database based on the provided `questionId`.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The unique identifier for the question.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "What is the capital of France?"
 *                 description:
 *                   type: string
 *                   example: "This is a basic geography question asking about the capital city of France."
 *                 category:
 *                   type: string
 *                   example: "Geography"
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to fetch questions.
 */

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
    } catch (error) {
      console.error(error);  
      return res.status(500).json({
        message: "Unable to fetch questions."
      });
    }
  });

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update an existing question by its ID
 *     description: Updates the title, description, and category of an existing question.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The unique identifier of the question to be updated.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the question.
 *               description:
 *                 type: string
 *                 description: The description of the question.
 *               category:
 *                 type: string
 *                 description: The category to which the question belongs.
 *             required:
 *               - title
 *               - description
 *               - category
 *           example:
 *             title: "What is the capital of Germany?"
 *             description: "Updated question asking about the capital city of Germany."
 *             category: "Geography"
 *     responses:
 *       200:
 *         description: Question updated successfully.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to fetch questions.
 */

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
  
    } catch (error) {
      console.error(error);  
      return res.status(500).json({
        message: "Unable to fetch questions."
      });
    }
  });

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question by its ID
 *     description: Deletes a specific question from the database using its unique ID.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The unique identifier of the question to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question post has been deleted successfully.
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to delete question
 */

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
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Unable to delete question."
      });
    }
  });

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Creates an answer for a given question
 *     description: This endpoint allows you to create an answer for a specific question by providing the answer content in the request body.
 *     tags:
 *       - Questions
 *     parameters:
 *       - name: questionId
 *         in: path
 *         description: The ID of the question to which the answer is being added
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: The answer object to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the answer
 *                 example: "The capital of France is Paris."
 *     responses:
 *       201:
 *         description: Answer created successfully.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to create answer.
 */

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

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   get:
 *     summary: Get all answers for a specific question
 *     description: Fetches all answers associated with a specific question based on the provided question ID.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question whose answers are being retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of answers for the specified question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique identifier of the answer.
 *                       content:
 *                         type: string
 *                         description: The content of the answer.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to fetch answers.
 */

questionRouter.get("/:questionId/answers", async (req, res) => {
    const { questionId } = req.params;  

    try {
        const checkQuestionQuery = "SELECT * FROM questions WHERE id = $1";
        const checkQuestionResult = await connectionPool.query(checkQuestionQuery, [questionId]);

        if (checkQuestionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        const query = `
            SELECT id, content
            FROM answers
            WHERE question_id = $1
        `;
        const result = await connectionPool.query(query, [questionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No answers found for this question."
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

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   delete:
 *     summary: Deletes all answers for a specific question.
 *     description: Deletes all answers associated with a question if the question exists and has answers.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question whose answers need to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All answers for the question have been deleted successfully.
 *       404:
 *         description: 
 *           - Question not found.
 *           - No answers found for the question.
 *       500:
 *         description: Unable to delete answers.
 */

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to delete answers."
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Record a vote for a question
 *     description: Allows users to vote on a question. If a vote already exists for the question, it will be updated. Otherwise, a new vote will be recorded.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to vote on.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote:
 *                 type: integer
 *                 description: The vote value (e.g., 1 for upvote, -1 for downvote).
 *                 example: 1
 *     responses:
 *       200:
 *         description: The vote on the question has been recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vote on the question has been recorded successfully."
 *       201:
 *         description: The vote on the question has been recorded successfully (when a new vote is inserted).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vote on the question has been recorded successfully."
 *       404:
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Question not found."
 *       500:
 *         description: Unable to vote on the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unable to vote question."
 */

questionRouter.post("/:questionId/vote", validateVoteData, async (req, res) => {
  const { questionId } = req.params;
  const { vote } = req.body;

  try {
    const checkQuestionQuery = 'SELECT * FROM questions WHERE id = $1';
    const questionResult = await connectionPool.query(checkQuestionQuery, [questionId]);

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found."
      });
    }

    const checkVoteQuery = 'SELECT * FROM question_votes WHERE question_id = $1';
    const voteResult = await connectionPool.query(checkVoteQuery, [questionId]);

    if (voteResult.rows.length > 0) {
      const updateVoteQuery = 'UPDATE question_votes SET vote = $1 WHERE question_id = $2';
      await connectionPool.query(updateVoteQuery, [vote, questionId]);

      return res.status(200).json({
        message: "Vote on the question has been recorded successfully."
      });
    } 

    else {
      const insertVoteQuery = 'INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)';
      await connectionPool.query(insertVoteQuery, [questionId, vote]);

      return res.status(201).json({
        message: "Vote on the question has been recorded successfully."
      });
    }

  } catch (error) {
    console.error('Error details:', error);
    return res.status(500).json({
      message: "Unable to vote question."
    });
  }
});


export default questionRouter;