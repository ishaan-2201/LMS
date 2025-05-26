import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useUser, useAuth } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  //Fetch all the courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  const calculateAverageRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    let total_rating = 0;
    for (let rating of course.courseRatings) {
      total_rating += rating.rating;
    }
    return total_rating / course.courseRatings.length;
  };

  const calculateChapterDuration = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateTotalLectures = (course) => {
    let lectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        lectures += chapter.chapterContent.length;
      }
    });
    return lectures;
  };

  const fetchEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses);
  };

  useEffect(() => {
    fetchAllCourses();
    fetchEnrolledCourses();
  }, []);

  const logToken = async () => {
    console.log(await getToken());
  };

  useEffect(() => {
    if (user) {
      logToken();
    }
  }, [user]);
  const contextValue = {
    currency,
    allCourses,
    navigate,
    calculateAverageRating,
    isEducator,
    setIsEducator,
    calculateChapterDuration,
    calculateCourseDuration,
    calculateTotalLectures,
    enrolledCourses,
    setEnrolledCourses,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};
