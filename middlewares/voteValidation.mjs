const validateVoteData = (req, res, next) => {

  let { vote } = req.body;

  vote = parseInt(vote, 10);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Invalid vote value."
    });
  }

  if (vote === undefined) {
    return res.status(400).json({
      message: "Invalid vote value."
    });
  }

  if (![1, -1].includes(vote)) {
    return res.status(400).json({
      message: "Invalid vote value."
    });
  }

  next();
};

export default validateVoteData;
