const validateVoteData = (req, res, next) => {
    const { vote } = req.body;
  
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Invalid vote value."
      });
    }

    if (vote === undefined) {
      return res.status(400).json({
        message: "Vote field is required."
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
  