import Stripe from "stripe";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import CourseProgress from "../models/CourseProgress.js";

//Get user data
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error, message });
  }
};

//Get user enrolled courses with the lecture links
export const getUserEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId).populate("enrolledCourses");
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    res.json({ success: true, userEnrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error, message });
  }
};

//Purchase Course

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth.userId;
    const { origin } = req.headers;
    const userdata = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!courseData || !userdata) {
      return res.json({
        success: false,
        message: "User data or course data is missing!",
      });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId: userId,
      amount: (
        courseData.coursePrice -
        (courseData.coursePrice * courseData.discount) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    //Stripe payment gateway initialization
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    const courseProgressData = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    });

    if (courseProgressData) {
      if (courseProgressData.lecturesCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture already completed!",
        });
      }
      courseProgressData.lecturesCompleted.push(lectureId);
      await courseProgressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lecturesCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Course Progress updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    const courseProgressData = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    });
    res.json({ success: true, courseProgressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Add User Ratings to Course
export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;
  if (!userId || !courseId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "Invalid credentials" });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User has not purchased this course",
      });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === userId
    );
    if (existingRatingIndex >= 0) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }
    await course.save();
    res.json({ success: true, message: "Rating Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
