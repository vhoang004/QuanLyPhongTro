const authService = require("../services/authService");
const { Account } = require("../models");
const { Op } = require("sequelize");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username va mat khau la bat buoc." });
    }

    const result = await authService.login(username, password, res);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mat khau hien tai va mat khau moi la bat buoc." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mat khau moi phai it nhat 6 ky tu." });
    }

    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email la bat buoc." });
    }
    const result = await authService.resetPassword(email);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, ma xac minh va mat khau moi la bat buoc." });
    }
    const result = await authService.verifyOtpAndReset(email, otp, newPassword);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username khong duoc de trong." });
    }

    req.user.username = username.trim();
    if (email !== undefined) req.user.email = email.trim();
    await req.user.save();

    const { password: _, ...userData } = req.user.toJSON();
    return res.json({ message: "Cap nhat thong tin thanh cong.", user: userData });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

const getAllAccounts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", status, role } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    // Admin chỉ thấy tài khoản manager (chủ trọ)
    if (req.user.role === 'admin' && !role) {
      where.role = 'manager';
    } else if (role) {
      where.role = role;
    }

    const { rows, count } = await Account.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
      ...paginateQuery({ page, limit }),
    });

    return res.json(buildPaginationResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username va mat khau la bat buoc." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mat khau phai it nhat 6 ky tu." });
    }

    // Admin chỉ được tạo tài khoản manager (chủ trọ)
    const finalRole = req.user.role === 'admin' ? 'manager' : (role || 'manager');

    const account = await Account.create({ username, password, email, role: finalRole });
    const { password: _, ...userData } = account.toJSON();
    return res.status(201).json({ message: "Tao tai khoan thanh cong.", user: userData });
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role, status, password } = req.body;

    const account = await Account.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: "Tai khoan khong ton tai." });
    }

    // Admin không được sửa tài khoản admin khác
    if (req.user.role === 'admin' && account.role === 'admin') {
      return res.status(403).json({ message: "Ban khong co quyen sua tai khoan Quyen tri vien." });
    }

    if (email !== undefined) account.email = email;
    if (role !== undefined) account.role = req.user.role === 'admin' ? 'manager' : role;
    if (status !== undefined) account.status = status;
    if (password) account.password = password;

    await account.save();
    const { password: _, ...userData } = account.toJSON();
    return res.json({ message: "Cap nhat tai khoan thanh cong.", user: userData });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "Khong the xoa tai khoan dang su dung." });
    }

    const account = await Account.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: "Tai khoan khong ton tai." });
    }

    // Admin không được xóa tài khoản admin khác
    if (req.user.role === 'admin' && account.role === 'admin') {
      return res.status(403).json({ message: "Ban khong co quyen xoa tai khoan Quyen tri vien." });
    }

    await account.destroy();
    return res.json({ message: "Xoa tai khoan thanh cong." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  updateProfile,
  getProfile,
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
};

function paginateQuery({ page, limit }) {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return { limit: parseInt(limit), offset };
}

function buildPaginationResponse(data, count, page, limit) {
  const totalPages = Math.ceil(count / limit);
  return {
    data,
    pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages },
  };
}
