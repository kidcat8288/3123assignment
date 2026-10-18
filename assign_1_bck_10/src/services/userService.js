const User = require("../models/User");
const AppError = require("../utils/AppError");

async function createUser({ username, email, password }) {
  const existing = await User.findOne({
    $or: [{ username }, { email: email.toLowerCase() }],
  });
  if (existing) {
    const field = existing.username === username ? "Username" : "Email";
    throw new AppError(409, `${field} already exists.`);
  }

  try {
    return await User.create({ username, email, password });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(409, "User already exists.");
    }
    throw err;
  }
}

// Username takes priority if both are sent
async function findByUsernameOrEmail({ username, email }) {
  const filter = username ? { username } : { email: email.toLowerCase() };
  return User.findOne(filter);
}

module.exports = {
  createUser,
  findByUsernameOrEmail,
};
