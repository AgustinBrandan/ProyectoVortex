// Esta función genera un token aleatorio (puede ser más compleja según tus requerimientos)
const generateUniqueToken = () => {
  const tokenLength = 20;
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < tokenLength; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
};

module.exports = { generateUniqueToken };
