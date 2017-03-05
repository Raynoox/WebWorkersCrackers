var hashSHA1 = function (passphrase, salt) {
  return CryptoJS.SHA1(salt + passphrase).toString();
}
var hashMD5 = function(passphrase, salt) {
  return  CryptoJS.MD5(salt + passphrase).toString();
}
