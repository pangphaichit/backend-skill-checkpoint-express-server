function validateQuestionData(req, res, next) {

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Invalid request data."
    });
  }
    const requiredFields = [
      { name: 'title', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'description', type: 'string' },
    ];
  
    for (const field of requiredFields) {
      const value = req.body[field.name];
  

      if (!value) {
        return res.status(400).json({ message: "Invalid request data." });
      }

      if (typeof value !== field.type) {
        return res.status(400).json({ message: "Invalid request data." });
      }
    }
  
    next();
  }
  
export default validateQuestionData;