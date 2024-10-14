import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Index,
  connectSearchBox,
  connectHits,
  connectStateResults,
} from 'react-instantsearch-dom';
import Link from 'next/link'; // Import Link

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''
);


interface CustomSearchBoxProps {
  currentRefinement: string; 
  refine: (value: string) => void; 
  onFocus?: () => void; 
  onBlur?: () => void; 
}

// Custom SearchBox
const CustomSearchBox: React.FC<CustomSearchBoxProps> = ({ currentRefinement, refine, onFocus, onBlur }) => (
  <div className="relative">
    <input
      type="search"
      value={currentRefinement}
      onChange={(event) => refine(event.currentTarget.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      className="bg-gray-700 text-white rounded-full px-4 py-2 w-96"
      placeholder="Search..."
    />
  </div>
);

const SearchBox = connectSearchBox(CustomSearchBox);

// Custom Hits for Posts
const PostsHits = ({ hits }: { hits: any[] }) => (
  <div>
    <h3 className="text-lg font-bold px-4">Posts</h3>
    {hits.length > 0 ? (
      hits.map((hit) => (
        <div key={hit.objectID} className="px-4 py-2 hover:bg-gray-700">
          <Link href={`/post/${hit.objectID}`} className="text-white">
            {hit.title}
          </Link>
        </div>
      ))
    ) : (
      <p className="px-4 text-gray-400">No posts found.</p>
    )}
  </div>
);

const ConnectedPostsHits = connectHits(PostsHits);

// Custom Hits for Users
const UsersHits = ({ hits }: { hits: any[] }) => (
  <div>
    <h3 className="text-lg font-bold px-4">Users</h3>
    {hits.length > 0 ? (
      hits.map((hit) => (
        <div key={hit.objectID} className="px-4 py-2 hover:bg-gray-700">
          <Link href={`/profile/${hit.objectID}`} className="text-white">
            {hit.username}
          </Link>
        </div>
      ))
    ) : (
      <p className="px-4 text-gray-400">No users found.</p>
    )}
  </div>
);

const ConnectedUsersHits = connectHits(UsersHits);

// StateResults to check if there's a query
const StateResults = connectStateResults(({ searchState, children }: { searchState: any; children: React.ReactNode }) => {
  const query = searchState && searchState.query;
  if (!query || query.trim() === '') {
    return null;
  }
  return children;
});

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <InstantSearch indexName="posts" searchClient={searchClient}>
      <div className="relative">
        <SearchBox
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isFocused && (
          <StateResults>
            <div
              className="absolute mt-1 w-full bg-gray-800 rounded-md z-10"
              onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus when clicking on hits
            >
              <Index indexName="posts">
                <ConnectedPostsHits />
              </Index>
              <Index indexName="users">
                <ConnectedUsersHits />
              </Index>
            </div>
          </StateResults>
        )}
      </div>
    </InstantSearch>
  );
}
