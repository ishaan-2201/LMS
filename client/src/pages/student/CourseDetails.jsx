import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import YouTube from "react-youtube";

const CourseDetails = () => {
  const { id } = useParams();
  const {
    allCourses,
    calculateAverageRating,
    calculateChapterDuration,
    calculateCourseDuration,
    calculateTotalLectures,
    currency,
  } = useContext(AppContext);
  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const fetchCourseData = async () => {
    const courseData = allCourses.find((course) => course._id === id);
    setCourse(courseData);
  };

  const toggleSection = (index) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [index]: !prevOpenSections[index],
    }));
  };
  useEffect(() => {
    fetchCourseData();
  }, [allCourses]);
  return course ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full -z-1 bg-gradient-to-b h-section-height from-cyan-100/70"></div>
        {/* left column */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {course.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: course.courseDescription.slice(0, 200),
            }}
          ></p>
          {/* reviews and ratings */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateAverageRating(course)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  className="w-3.5 h-3.5"
                  key={i}
                  src={
                    i < Math.floor(calculateAverageRating(course))
                      ? assets.star
                      : assets.star_blank
                  }
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({course.courseRatings.length} rating
              {course.courseRatings.length > 1 && "s"}){" "}
            </p>
            <p>
              {" "}
              {course.enrolledStudents.length}{" "}
              {course.enrolledStudents.length > 1 ? "students" : "student"}
            </p>
          </div>
          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">CodeWithHarry</span>
          </p>
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {course.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSections[index] ? "" : "-rotate-90"
                        }`}
                        src={assets.down_arrow_icon}
                        alt=""
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures -
                      {calculateChapterDuration(chapter)}
                    </p>
                  </div>

                  {openSections[index] && (
                    <div className="overflow-hidden transition-all duration-300 max-h-96">
                      <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 tex-gray-600 border-t border-gray-300">
                        {chapter.chapterContent.map((lecture, idx) => (
                          <li key={idx} className="flex items-start gap-2 py-1">
                            <img
                              src={assets.play_icon}
                              alt=""
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                              <p>{lecture.lectureTitle}</p>
                              <div className="flex gap-2">
                                {lecture.isPreviewFree && (
                                  <p
                                    className="text-blue-500 cursor-pointer"
                                    onClick={() =>
                                      setPreviewVideo({
                                        videoId: lecture.lectureUrl
                                          .split("/")
                                          .pop(),
                                      })
                                    }
                                  >
                                    Preview
                                  </p>
                                )}
                                <p>
                                  {humanizeDuration(
                                    lecture.lectureDuration * 60 * 1000,
                                    { units: ["h", "m"] }
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html: course.courseDescription,
              }}
            ></p>
          </div>
        </div>
        {/* right column */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {previewVideo ? (
            <YouTube
              videoId={previewVideo.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={course.courseThumbnail} alt="" />
          )}
          <div className="p-5">
            <div className="flex items-center gap-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="" />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 text-2xl md:text-4xl font-semibold">
                {currency}
                {(
                  course.coursePrice -
                  (course.coursePrice * course.discount) / 100
                ).toFixed(2)}
              </p>
              <p className="line-through md:text-lg text-gray-500">
                {currency}
                {course.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">{course.discount}% off</p>
            </div>
            <div className="flex items-center text-sm md:text-default pt-2 md:pt-4 gap-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateAverageRating(course)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="" />
                <p>{calculateCourseDuration(course)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="" />
                <p>{calculateTotalLectures(course)} lessons</p>
              </div>
            </div>

            <button className="w-full bg-blue-600 px-10 py-3 text-white font-medium rounded md:mt-6 mt-4 cursor-pointer">
              {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
            </button>

            <div className="pt-6">
              <p className="text-lg md:text-xl font-medium text-gray-800">
                What’s in the course?
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
                <li>Quizzes to test your knowledge.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;
