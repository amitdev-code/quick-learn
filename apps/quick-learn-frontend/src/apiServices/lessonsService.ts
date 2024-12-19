import {
  TLesson,
  TUserDailyProgress,
} from '@src/shared/types/contentRepository';
import axiosInstance, { AxiosSuccessResponse } from './axios';
import {
  ContentRepositoryApiEnum,
  DailyLessionEnum,
} from '@src/constants/api.enum';
import {
  LessonProgress,
  LessonStatus,
  UserLessonProgress,
} from '@src/shared/types/LessonProgressTypes';

export const FETCH_ARCHIVE_LESSONS = async (): Promise<
  AxiosSuccessResponse<TLesson[]>
> => {
  const response = await axiosInstance.get<AxiosSuccessResponse<TLesson[]>>(
    ContentRepositoryApiEnum.LESSON_ARCHIVED,
  );
  return response.data;
};

export const getUnapprovedLessons = async (): Promise<
  AxiosSuccessResponse<TLesson[]>
> => {
  const response = await axiosInstance.get<AxiosSuccessResponse<TLesson[]>>(
    ContentRepositoryApiEnum.LESSON_UNAPPROVED,
  );
  return response.data;
};

export const getLessonDetails = async (
  id: string,
  approved = true,
): Promise<AxiosSuccessResponse<TLesson>> => {
  const response = await axiosInstance.get<AxiosSuccessResponse<TLesson>>(
    ContentRepositoryApiEnum.LESSON + `/${id}` + `?approved=${approved}`,
  );
  return response.data;
};

export const APPROVED_LESSON = async (
  id: string,
): Promise<AxiosSuccessResponse> => {
  const response = await axiosInstance.patch<AxiosSuccessResponse>(
    ContentRepositoryApiEnum.LESSON + `/${id}/approve`,
  );
  return response.data;
};

export const UPDATE_LESSON = async (
  id: string,
  data: Partial<TLesson>,
): Promise<AxiosSuccessResponse<TLesson>> => {
  const response = await axiosInstance.patch<AxiosSuccessResponse<TLesson>>(
    ContentRepositoryApiEnum.LESSON + `/${id}`,
    data,
  );
  return response.data;
};

// this api mark lesson as read.
export const markAsDone = async (
  lessonId: string,
  courseId: string,
  isCompleted: boolean,
  userId: number,
): Promise<AxiosSuccessResponse> => {
  const response = await axiosInstance.post<AxiosSuccessResponse>(
    `${ContentRepositoryApiEnum.LESSON_PROGRESS}/complete/${lessonId} ${
      userId ? `/${userId}` : ''
    }`,
    {
      courseId: parseInt(courseId),
      isCompleted: isCompleted,
    },
  );
  return response.data;
};

//this api returns read lesson array
export const getCourseProgress = async (
  courseId: string,
): Promise<AxiosSuccessResponse<LessonProgress[]>> => {
  const response = await axiosInstance.get<
    AxiosSuccessResponse<LessonProgress[]>
  >(`${ContentRepositoryApiEnum.LESSON_PROGRESS}/${courseId}/progress`);
  return response.data;
};

export const getLessonStatus = async (
  LessonId: string,
  userId?: number,
): Promise<AxiosSuccessResponse<LessonStatus>> => {
  const response = await axiosInstance.get<AxiosSuccessResponse<LessonStatus>>(
    `${ContentRepositoryApiEnum.LESSON_PROGRESS}/check/${LessonId} ${
      userId ? `/${userId}` : ''
    }`,
  );
  return response.data;
};

export const getUserProgress = async (
  userId?: number | null,
): Promise<AxiosSuccessResponse<UserLessonProgress[]>> => {
  const response = await axiosInstance.get<
    AxiosSuccessResponse<UserLessonProgress[]>
  >(
    `${ContentRepositoryApiEnum.LESSON_PROGRESS}/userprogress${
      userId ? `/${userId}` : ''
    }`,
  );
  return response.data;
};

export const getUserDailyLessonProgress = async (
  userId: number,
): Promise<AxiosSuccessResponse<TUserDailyProgress[]>> => {
  const response = await axiosInstance.get<
    AxiosSuccessResponse<TUserDailyProgress[]>
  >(`${ContentRepositoryApiEnum.LESSON_PROGRESS}/daily-lesson/${userId}`);
  return response.data;
};

export const getDailyLessionDetail = async (
  lessonId: string,
  courseId: string,
  token: string,
): Promise<AxiosSuccessResponse<TLesson>> => {
  const response = await axiosInstance.get<AxiosSuccessResponse<TLesson>>(
    `${DailyLessionEnum.GET_DAILY_LESSON_DETAILS.replace(':lesson', lessonId)
      .replace(':course', courseId)
      .replace(':token', token)}`,
  );
  return response.data;
};
