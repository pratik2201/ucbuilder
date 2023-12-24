const crypto = require("crypto");
class xcrypto {
  /** @type {CipherGCMTypes}  */ 
  static algorithm = "aes-256-cbc";
  static key = 'prat';//crypto.randomBytes(32);
  static iv = crypto.randomBytes(16);
  /**
   * @param {any} data
   * @param {crypto.Encoding} from
   * @param {crypto.Encoding} to
   */
  static encrypt(data, from = "utf-8", to = "hex") {
    let cipher = crypto.createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(data, from, to);
    encrypted += cipher.final(to);
    
    return encrypted;
  }
  /**
   * @param {any} data
   * @param {crypto.Encoding} from
   * @param {crypto.Encoding} to
   */
  static decrypt(data, from = "hex", to = "utf8") {
    let decipher = crypto.createDecipher(this.algorithm, this.key);
    let decrypted = decipher.update(data, from, to);
    decrypted += decipher.final(to);
    return decrypted;
  }
}
module.exports = { xcrypto };
/*
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");

console.log("Original text: ", "Hello World");
console.log("Encrypted text: ", encrypted);
console.log("Decrypted text: ", decrypted);*/
