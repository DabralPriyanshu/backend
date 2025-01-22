
import multer from 'multer';
import path from 'path'; // Core Node.js module for handling file paths

// Configure storage for multer
const storage = multer.diskStorage({
  // Set the destination folder for uploaded files
  destination: (req, file, cb) => {
    cb(null, "./public/temp"); // Specify the folder (e.g., 'uploads/')
  },

  // Customize the file name
  filename: (req, file, cb) => {
    cb(null,file.originalname); 
  },
});

// Initialize multer with storage configuration
 export const upload = multer({ storage });

