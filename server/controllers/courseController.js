import Course from "../models/Course.js";

//Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Course by Id
export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id).populate({ path: "educator" });

    //Removing the lecture urls for the lectures of the course for which the preview is not free
    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });
    res.json({ success: true, course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
