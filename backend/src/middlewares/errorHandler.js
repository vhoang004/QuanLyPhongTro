const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Du lieu khong hop le.",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Du lieu da ton tai.",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      message: "Khong the xoa vi co du lieu lien quan.",
    });
  }

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error("Unhandled Error:", err);
  return res.status(500).json({ message: "Loi server. Vui long thu lai sau." });
};

const notFound = (req, res) => {
  return res.status(404).json({ message: "Duong dan khong ton tai." });
};

module.exports = { errorHandler, notFound };
