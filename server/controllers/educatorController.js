import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

//Update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });
    res.json({
      success: true,
      message: "You can now publish a course on LMS!",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Add a new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;
    if (!imageFile)
      return res.json({ success: false, message: "Thumbnail not attached!" });

    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    const newCourse = await Course.create(parsedCourseData);
    const uploadedImageToCloudinary = await cloudinary.uploader.upload(
      imageFile.path
    );
    newCourse.courseThumbnail = uploadedImageToCloudinary.secure_url;
    await newCourse.save();
    res.json({ success: true, message: "Course Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//List all courses of the educator
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const allCourses = await Course.find({ educator: educator });
    res.json({ success: true, courses: allCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get dashboard data
export const getEducatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    //Total Courses
    const allCourses = await Course.find({ educator: educator });
    const numberOfCourses = allCourses.length;
    const courseIds = allCourses.map((course) => course._id);

    //Total Earnings
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });
    let totalEarnings = 0;
    purchases.forEach((purchase) => {
      totalEarnings += purchase.amount;
    });

    const enrollments = [];
    for (const course of allCourses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );
      students.forEach((student) => {
        enrollments.push({
          courseTitle: course.courseTitle,
          student: student,
        });
      });
    }
    res.json({
      success: true,
      dashboardData: {
        numberOfCourses,
        totalEarnings,
        enrollments,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get enrolled students data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const allCourses = await Course.find({ educator: educator });
    const courseIds = allCourses.map((course) => course._id);
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");
    const enrolledStudentsData = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));
    res.json({ success: true, enrolledStudentsData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
