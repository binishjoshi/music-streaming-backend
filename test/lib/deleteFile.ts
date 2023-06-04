import { unlinkSync } from 'fs';

export const deleteFile = (file) => {
  try {
    unlinkSync(file);
  } catch (error) {}
};
