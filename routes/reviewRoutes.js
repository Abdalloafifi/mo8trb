import express from 'express';
const app = express();
const router = express.Router();

import { createReview, deleteReview, getApartmentReviews, updateReview } from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";



// Create a new review
router.post("/",authenticate, createReview);
// Get reviews for an apartment
router.get("/:apartmentId",authenticate, getApartmentReviews);
// Update a review
router.put("/:reviewId",authenticate, updateReview); 
// Delete a review
router.delete("/:reviewId", authenticate, deleteReview);


export default router;