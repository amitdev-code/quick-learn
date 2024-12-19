import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchedQuery, SearchedLesson } from '../types/contentRepository';
import { getSearchQuery } from '@src/apiServices/learningPathService';
import RouteTab from './RouteTab';
import { en } from '@src/constants/lang/en';

const SEARCH_CATEGORIES = ['Roadmaps', 'Courses', 'Lessons'] as const;
const MINIMUM_SEARCH_LENGTH = 3;
const SEARCH_DELAY_MS = 500;

interface NavbarSearchBoxProps {
  isMember: boolean;
}

const NavbarSearchBox: React.FC<NavbarSearchBoxProps> = ({ isMember }) => {
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [SEARCH_RESULTS, setSearchResults] = useState<SearchedQuery>({
    Roadmaps: [],
    Courses: [],
    Lessons: [],
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseRoute = useMemo(
    () => (isMember ? '/dashboard/learning-path' : '/dashboard/content'),
    [isMember],
  );

  // Fetch search results
  useEffect(() => {
    const fetchResults = setTimeout(() => {
      if (searchQuery.trim().length >= MINIMUM_SEARCH_LENGTH) {
        setIsLoading(true);
        getSearchQuery(searchQuery)
          .then((res) => {
            setSearchResults(
              res?.data || { Roadmaps: [], Courses: [], Lessons: [] },
            );
            setIsLoading(false);
          })
          .catch((error) => console.error('Search query error:', error));
      } else {
        setSearchResults({ Roadmaps: [], Courses: [], Lessons: [] });
      }
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(fetchResults);
    };
  }, [searchQuery]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if there are any results across all categories
  const hasNoResults =
    searchQuery.length >= MINIMUM_SEARCH_LENGTH &&
    SEARCH_CATEGORIES.every((category) => SEARCH_RESULTS[category].length === 0);

  // Render search results for a specific category
  const renderCategoryResults = (
    category: (typeof SEARCH_CATEGORIES)[number],
  ) => {
    const items = SEARCH_RESULTS[category];

    if (items.length === 0) return null;

    return (
      <div key={category}>
        <div className="font-bold text-slate-700 border-b border-gray-300">
          # {category}{' '}
          <span className="text-sm text-gray-700 italic font-normal">
            ({items.length} {category.toLowerCase()})
          </span>
        </div>
        <div className="max-h-[120px] overflow-auto">
          {items.map((item, i) => {
            const commonProps = {
              id: item.id,
              name: item.name,
              baseLink: baseRoute,
              onClick: () => setIsDropdownActive(false),
            };

            if (category === 'Lessons') {
              const lesson = item as SearchedLesson;
              return (
                <RouteTab
                  {...commonProps}
                  key={i}
                  type="lesson"
                  course_id={lesson.course_id}
                  roadmap_id={lesson.roadmap_id}
                />
              );
            }

            return (
              <RouteTab
                {...commonProps}
                key={i}
                type={category.toLowerCase() as 'roadmaps' | 'courses'}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="relative flex-1" ref={dropdownRef}>
        {/* Search Input Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>

        {/* Search Input */}
        <input
          id="search"
          name="search"
          type="search"
          value={searchQuery}
          placeholder="Search Roadmaps, Courses or Lessons"
          onFocus={() => setIsDropdownActive(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full h-full rounded-md border-0 bg-gray-700 py-1.5 pl-10 pr-3 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 outline-0"
        />

        {/* Search Results Dropdown */}
        {isDropdownActive && (
          <div className="absolute w-full top-[43px] text-black bg-white border rounded-md p-1 z-50">
            {searchQuery.length < MINIMUM_SEARCH_LENGTH ? (
              <div className="text-center text-sm text-gray-500 p-2">
                {en.Search.default_text}
              </div>
            ) : isLoading ? (
              <div className="text-center text-gray-500 p-2">
                {en.Search.Loading}
              </div>
            ) : hasNoResults ? (
              <div className="text-center text-gray-500 p-2 text-sm">
                {en.Search.no_search_result_found}
              </div>
            ) : (
              <div>{SEARCH_CATEGORIES.map(renderCategoryResults)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarSearchBox;
