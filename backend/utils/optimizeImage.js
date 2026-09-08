import sharp from "sharp";
import fs from "fs";
import path from "path";


async function optimizeImage(filePath, maxWidth = 1200) {
  const tempPath = `${filePath}.tmp`;

  await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true }) 
    .jpeg({ quality: 80 }) 
    .toFile(tempPath);


  fs.unlinkSync(filePath);
  fs.renameSync(tempPath, filePath);
}

export default optimizeImage;