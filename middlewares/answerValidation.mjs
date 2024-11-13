function validateAnswerData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  const requiredFields = [
    { name: 'content', type: 'string', maxLength: 300 }
  ];

  for (const { name, type, maxLength } of requiredFields) {
    const value = req.body[name];

    if (!value || typeof value !== type) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    if (maxLength && value.length > maxLength) {
      return res.status(400).json({ message: "Invalid request data." });
    }
  }

  next();
}

export default validateAnswerData;
