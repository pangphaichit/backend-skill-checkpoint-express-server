import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateVoteData from "../middlewares/voteValidation.mjs";

const answerRouter = Router();

answerRouter.post("/:answerId/vote", validateVoteData, async (req, res) => {
  const { answerId } = req.params; 
  const { vote } = req.body; 

  try {
    const checkAnswerQuery = 'SELECT * FROM answers WHERE id = $1';
    const answerResult = await connectionPool.query(checkAnswerQuery, [answerId]);

    if (answerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Answer not found."
      });
    }

    const checkVoteQuery = 'SELECT * FROM answer_votes WHERE answer_id = $1';
    const voteResult = await connectionPool.query(checkVoteQuery, [answerId]);

    if (voteResult.rows.length > 0) {
      const updateVoteQuery = 'UPDATE answer_votes SET vote = $1 WHERE answer_id = $2';
      await connectionPool.query(updateVoteQuery, [vote, answerId]);

      return res.status(200).json({
        message: "Vote on the answer has been recorded successfully."
      });
    } else {
      const insertVoteQuery = 'INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2)';
      await connectionPool.query(insertVoteQuery, [answerId, vote]);

      return res.status(201).json({
        message: "Vote on the answer has been recorded successfully."
      });
    }

  } catch (error) {
    console.error('Error details:', error);
    return res.status(500).json({
      message: "Unable to vote on the answer."
    });
  }
});

export default answerRouter;