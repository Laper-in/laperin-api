const Validator = require("fastest-validator");
const { user } = require("../database/models");

const v = new Validator();

const schema = {
  email: { type: "email", unique: true },
  username: { type: "string", min: 1, max: 255, unique: true, pattern: /^[^\s]+$/ },
  password: { type: "string", min: 1, max: 255, unique: true, pattern: /^[^\s]+$/ },

};

const check = v.compile(schema);

async function validateUser(userInput) {
  const validationResult = check(userInput);

  if (validationResult !== true) {
    return { error: validationResult };
  }

  const { email, username } = userInput;

  // Check if required fields are provided
  if (!email) {
    return { error: "Email is required" };
  }

  if (!username) {
    return { error: "Username is required" };
  }

  // Check for uniqueness in the database
  const existingEmailUser = await user.findOne({ where: { email } });
  const existingUsernameUser = await user.findOne({ where: { username } });

  if (existingEmailUser) {
    return { error: "Email already exists in the database" };
  }

  if (existingUsernameUser) {
    return { error: "Username already exists in the database" };
  }

  return { isValid: true };
}

module.exports = validateUser;
