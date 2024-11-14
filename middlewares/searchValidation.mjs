const validateSearchParamsData = (req, res, next) => {

  const allowedParams = ['category', 'title'];

  const { category, title } = req.query;

  const queryKeys = Object.keys(req.query);
  
  const invalidParams = queryKeys.filter(key => !allowedParams.includes(key.toLowerCase()));
  
  if (invalidParams.length > 0) {
    return res.status(400).json({
      message: "Invalid search parameters.",
    });
  }

  if (!category && !title) {
    return next(); 
  }

  const normalizedCategory = category ? category.trim().toLowerCase() : undefined;
  const normalizedTitle = title ? title.trim().toLowerCase() : undefined;

  if (normalizedCategory && typeof normalizedCategory !== 'string') {
    return res.status(400).json({
      message: "Invalid search parameters.",
    });
  }

  if (normalizedTitle && typeof normalizedTitle !== 'string') {
    return res.status(400).json({
      message: "Invalid search parameters.",
    });
  }

  next();
};

export default validateSearchParamsData;
