import React, { Fragment, useEffect, useState } from 'react';
import { Modal } from 'flowbite-react';
import { CloseIcon, ReadFileIcon } from '../components/UIElements';
import { format, subMonths } from 'date-fns';
import { Tooltip } from 'flowbite-react';
import { DateFormats } from '@src/constants/dateFormats';
import { en } from '@src/constants/lang/en';
import { TUser } from '../types/userTypes';
import { TUserDailyProgress } from '../types/contentRepository';

interface props {
  userProgressData: Course[];
  userDailyProgressData: TUserDailyProgress[];
  isOpen: boolean;
  setShow: (value: boolean) => void;
  memberDetail: TUser;
}

interface Lesson {
  lesson_id: number;
  completed_date: string;
  lesson_name: string;
  created_at?: string;
  updated_at?: string;
  event_at?: string;
}

export interface Course {
  course_id: number;
  lessons: Lesson[];
}
interface DateCount {
  date: string;
  count: number;
}

interface InputData {
  date: string;
  count: number;
}

interface DailyLessonProgress {
  id: number;
  created_at: string;
  updated_at: string;
  token: string;
  user_id: number;
  lesson_id: number;
  course_id: number;
  status: string;
  expiresAt: string;
  lesson: {
    name: string;
  };
}
interface OutputData {
  timestamp: string;
  count: number;
  opacity: number;
}

interface ActivityList {
  lesson_id: number;
  event_at: string;
  lesson_name?: string;
  course_id?: number;
  status?: string;
  user_id?: number;
  token?: string;
}

const ActivityGraph: React.FC<props> = (props) => {
  const [userProgressArray, setUserProgressArray] = useState<OutputData[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userActivityList, setUserActivityList] = useState<ActivityList[]>([]);

  const getDateCounts = (courses: Course[]): DateCount[] => {
    const dateCounts: Record<string, number> = {};
    courses.forEach((course) => {
      course.lessons.forEach((lesson) => {
        // Extract the date (ignoring time)
        const date = lesson.completed_date.split('T')[0];
        // Increment the count for this date
        dateCounts[date] ? dateCounts[date]++ : (dateCounts[date] = 1);
      });
    });
    // Convert the dateCounts object to an array of objects
    return Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
  };

  const generateDailyData = (input: InputData[]): OutputData[] => {
    const result: OutputData[] = [];
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const inputMap = new Map<string, number>();
    let maxCount = 0;

    // Populate the map and find the maximum count
    input.forEach((item) => {
      inputMap.set(item.date, item.count);
      if (item.count > maxCount) {
        maxCount = item.count;
      }
    });

    for (let d = new Date(sixMonthsAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split('T')[0];
      const count = inputMap.get(currentDate) || 0;

      // Calculate opacity based on the highest count and normalize
      const normalizedOpacity = maxCount > 0 ? (count / maxCount) * 100 : 0;
      const tailwindOpacity = Math.round(normalizedOpacity / 5) * 5;

      result.push({
        timestamp: currentDate,
        count,
        opacity: tailwindOpacity,
      });
    }

    return result;
  };

  function getLastSixMonths() {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      months.unshift(format(date, 'MMM'));
    }
    return months;
  }

  const mergeArrays = (
    array1: Lesson[],
    array2: DailyLessonProgress[],
  ): ActivityList[] => {
    // Process first array
    const processedArray1 = array1.map((item) => ({
      lesson_id: item.lesson_id,
      lesson_name: item.lesson_name,
      event_at: item.completed_date,
    }));

    // Process second array
    const processedArray2 = array2.map((item) => ({
      lesson_id: item.lesson_id,
      course_id: item.course_id,
      status: item.status,
      user_id: item.user_id,
      lesson_name: item.lesson.name,
      token: item.token,
      event_at:
        item.created_at === item.updated_at ? item.expiresAt : item.updated_at,
    }));

    // Combine both arrays
    return [...processedArray1, ...processedArray2];
  };
  useEffect(() => {
    if (props.userProgressData && props.userProgressData.length) {
      setUserProgressArray(
        generateDailyData(getDateCounts(props.userProgressData)),
      );

      // Extract all lessons
      const allLessons = props.userProgressData.flatMap(
        (course) => course.lessons,
      );

      const mergedArray = mergeArrays(allLessons, props.userDailyProgressData);

      // SORT the lessons by completed_date in descending order
      mergedArray.sort(
        (a, b) =>
          new Date(b.event_at).valueOf() - new Date(a.event_at).valueOf(),
      );

      setUserActivityList(mergedArray);
    } else {
      setUserProgressArray(generateDailyData(getDateCounts([])));
    }
  }, [props.userDailyProgressData, props.userProgressData]);

  console.log(userActivityList, 'userActivityList');

  return (
    <Fragment>
      <Modal show={props.isOpen} size="4xl">
        <Modal.Body>
          <div className="mb-4 flex items-center justify-between rounded-t dark:border-gray-700 sm:mb-5">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {props.memberDetail?.first_name}{' '}
              {props.memberDetail?.last_name.concat("'s")} Activities
            </p>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-2.5 ml-auto inline-flex items-center"
              onClick={() => props.setShow(false)}
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul
              className="flex flex-wrap -mb-px text-sm font-medium text-center"
              id="myTab"
              data-tabs-toggle="#myTabContent"
              role="tablist"
            >
              <li className="mr-1">
                <button
                  className={`inline-block px-2 pb-2 ${
                    selectedTab === 0
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:border-transparent'
                  }`}
                  id="brand-tab"
                  data-tabs-target="#brandi"
                  type="button"
                  role="tab"
                  aria-controls="brandi"
                  aria-selected="true"
                  onClick={() => setSelectedTab(0)}
                >
                  Activities
                </button>
              </li>
              <li className="mr-1">
                <button
                  className={`inline-block px-2 pb-2 ${
                    selectedTab === 1
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:border-transparent'
                  }`}
                  id="consistency-tab"
                  data-tabs-target="#consistency"
                  type="button"
                  role="tab"
                  aria-controls="consistency"
                  aria-selected="false"
                  onClick={() => setSelectedTab(1)}
                >
                  Consistency
                </button>
              </li>
            </ul>
          </div>

          <div id="myTabContent">
            {selectedTab === 0 && (
              <Fragment>
                <div id="brandi" role="tabpanel" aria-labelledby="brand-tab">
                  <div className="max-h-[230px] overflow-y-auto scrollbar-width: 3;">
                    {userActivityList && userActivityList.length ? (
                      <>
                        <ol className="relative ms-3 border-s border-dashed border-gray-200 dark:border-gray-700">
                          {userActivityList.map(
                            (item: ActivityList, index: number) => (
                              <Fragment key={index}>
                                <li className="mb-6 ms-6">
                                  <span className="absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-gray-800 dark:ring-gray-800">
                                    <ReadFileIcon
                                      colorClass={`${
                                        item.status
                                          ? item.status === 'COMPLETED'
                                            ? 'text-blue-500'
                                            : 'text-red-500'
                                          : 'text-green-500'
                                      }`}
                                    />
                                  </span>{' '}
                                  <h3 className="mb-0.5 flex items-center pt-1 text-base font-semibold text-gray-900 dark:text-white">
                                    {item.lesson_name}
                                  </h3>{' '}
                                  <time className="mb-2 block text-gray-500 dark:text-gray-400 text-xs">
                                    {item.status
                                      ? item.status === 'COMPLETED'
                                        ? en.teams.readDailyLessons
                                        : en.teams.missedDailyLessons
                                      : en.teams.markedCompletedOn}
                                    {format(
                                      new Date(item.event_at),
                                      DateFormats.fullDate,
                                    )}
                                  </time>
                                </li>{' '}
                              </Fragment>
                            ),
                          )}
                        </ol>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center">
                          <p className="text-xl">No Record Found.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            )}
            {selectedTab === 1 && (
              <div className="grid place-items-center">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-2 pt-6">
                    <h6 className="h-4 text-xs">Sun</h6>
                    <h6 className="h-4 text-xs" />
                    <h6 className="h-4 text-xs">Tue</h6>
                    <h6 className="h-4 text-xs" />
                    <h6 className="h-4 text-xs">Thu</h6>
                    <h6 className="h-4 text-xs" />
                    <h6 className="h-4 text-xs">Sat</h6>
                  </div>
                  <div>
                    <div
                      className="flex items-center justify-between"
                      style={{ width: 600 }}
                    >
                      {getLastSixMonths().map(
                        (month: string, index: number) => (
                          <h6 className="w-full text-xs" key={index}>
                            {month}
                          </h6>
                        ),
                      )}
                    </div>
                    <div
                      className="mt-2 grid w-full grid-flow-col gap-2"
                      style={{
                        gridTemplateRows: 'repeat(7, minmax(0px, 1fr))',
                      }}
                    >
                      {/* MAIN GRID */}
                      {userProgressArray?.map(
                        (item: OutputData, index: number) => {
                          return (
                            <Fragment key={index}>
                              <Tooltip
                                content={`${item.count} activities on ${format(
                                  item.timestamp,
                                  DateFormats.shortDate,
                                )}`}
                                placement="top"
                              >
                                <div
                                  className={`h-4 w-4 bg-lime-600 opacity-${
                                    item.opacity > 0 ? item.opacity : 20
                                  }`}
                                />
                              </Tooltip>
                            </Fragment>
                          );
                        },
                      )}
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-right text-xs">
                      <span>Less</span>
                      <span className="h-4 w-4 bg-lime-600 opacity-20" />
                      <span className="h-4 w-4 bg-lime-600 opacity-50" />
                      <span className="h-4 w-4 bg-lime-600 opacity-80" />
                      <span className="h-4 w-4 bg-lime-600" />
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default ActivityGraph;
