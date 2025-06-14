// Option 1: Update your main app.js/server.js to mount routes under /api/users/
// In your main server file:
import express from "express";
import {login, register } from "../controllers/authController.js"; // or wherever your auth routes are
import {handleUploadError, uploadApartmentImage} from "../middleware/uploadmiddleware.js";

const app = express();



// Option 2: If you want to keep the current structure, 
// create a separate userRoutes.js file:

// routes/userRoutes.js

const router = express.Router();

// These will be accessible as /api/users/register and /api/users/login
router.post(
  "/register",
  uploadApartmentImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "national_id_pic", maxCount: 1 },

  ]),
  handleUploadError,
  register
);

router.post("/login", login);

export default router;

