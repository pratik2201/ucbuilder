import * as crypto  from "crypto";
//{, CipherGCMTypes, Encoding }
class xcrypto {
  static algorithm: crypto.CipherGCMTypes = "aes-256-gcm";
  static key: string = 'prat'; //crypto.randomBytes(32);
  static iv: Buffer = crypto.randomBytes(16);

  static encrypt(data: any, from: crypto.Encoding = "utf-8", to: crypto.Encoding = "hex"): string {
    let cipher = crypto.createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(data, from, to);
    encrypted += cipher.final(to);

    return encrypted;
  }

  static decrypt(data: any, from: crypto.Encoding = "hex", to: crypto.Encoding = "utf8"): string {
    let decipher = crypto.createDecipher(this.algorithm, this.key);
    let decrypted = decipher.update(data, from, to);
    decrypted += decipher.final(to);
    return decrypted;
  }
}

export { xcrypto };