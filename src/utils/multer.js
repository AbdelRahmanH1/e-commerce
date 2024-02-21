import multer, { diskStorage } from "multer";

export const filter = {
  images: ["image/jpeg", "image/png"],
  pdf: ["application/pdf"],
};
export const upload = (type) => {
  const fileFilter = (req, file, cb) => {
    if (!type.includes(file.mimetype)) {
      cb(new Error("this type is invalid", { cause: 400 }), false);
    }
    cb(null, true);
  };
  return multer({ storage: diskStorage({}), fileFilter });
};
