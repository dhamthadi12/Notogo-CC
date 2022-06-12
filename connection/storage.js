const util = require("util");
const Multer = require("multer");
const maxSize = 2 * 1024 * 1024;
let processFilew = Multer({
    storage: Multer.memoryStorage(),
    limits: { fileSize: maxSize },
}).single("file");
let processFile = util.promisify(processFilew);

const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: "./keys/storage-key.json" });

module.exports = { processFile, storage }