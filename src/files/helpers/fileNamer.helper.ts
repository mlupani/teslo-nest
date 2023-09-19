import { v4 as uuidv4 } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  const fileExt = file.originalname.split('.')[1];
  const newName = uuidv4() + '.' + fileExt;
  callback(null, newName);
};
