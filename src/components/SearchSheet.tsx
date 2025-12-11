// src/components/SearchSheet.tsx
import React, { createContext, useContext } from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Index,
  connectSearchBox,
  connectHits,
  connectStateResults,
} from 'react-instantsearch-dom';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { Search } from 'lucide-react';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''
);

// Context to pass onClose down to hit components
const SearchSheetContext = createContext<{ onClose: () => void }>({
  onClose: () => {},
});

interface CustomSearchBoxProps {
  currentRefinement: string;
  refine: (value: string) => void;
}

// Custom SearchBox for the sheet
const CustomSearchBox: React.FC<CustomSearchBoxProps> = ({
  currentRefinement,
  refine,
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    <input
      type="search"
      value={currentRefinement}
      onChange={(event) => refine(event.currentTarget.value)}
      className="bg-muted text-foreground rounded-full pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-ring"
      placeholder="Search posts and users..."
      autoFocus
    />
  </div>
);

const SearchBox = connectSearchBox(CustomSearchBox);

// Custom Hits for Posts
const PostsHitsComponent = ({ hits }: { hits: any[] }) => {
  const { onClose } = useContext(SearchSheetContext);
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Posts</h3>
      {hits.length > 0 ? (
        <div className="space-y-2">
          {hits.map((hit) => (
            <Link
              key={hit.objectID}
              href={`/post/${hit.objectID}`}
              onClick={onClose}
            >
              <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <p className="text-foreground font-medium">{hit.title}</p>
                {hit.content && (
                  <p className="text-muted-foreground text-sm line-clamp-1">
                    {hit.content}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No posts found.</p>
      )}
    </div>
  );
};

const ConnectedPostsHits = connectHits(PostsHitsComponent);

// Custom Hits for Users
const UsersHitsComponent = ({ hits }: { hits: any[] }) => {
  const { onClose } = useContext(SearchSheetContext);
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Users</h3>
      {hits.length > 0 ? (
        <div className="space-y-2">
          {hits.map((hit) => (
            <Link
              href={`/profile/${hit.objectID}`}
              key={hit.objectID}
              onClick={onClose}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={hit.avatarUrl} alt={hit.username} />
                  <AvatarFallback>
                    {hit.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground font-medium">{hit.username}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No users found.</p>
      )}
    </div>
  );
};

const ConnectedUsersHits = connectHits(UsersHitsComponent);

// StateResults to check if there's a query
const StateResults = connectStateResults(
  ({
    searchState,
    children,
  }: {
    searchState: any;
    children: React.ReactNode;
  }) => {
    const query = searchState && searchState.query;
    if (!query || query.trim() === '') {
      return (
        <div className="mt-8 text-center text-muted-foreground">
          <p>Start typing to search for posts and users</p>
        </div>
      );
    }
    return <>{children}</>;
  }
);

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[450px] p-6 bg-background">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Search</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <SearchSheetContext.Provider value={{ onClose: handleClose }}>
            <InstantSearch indexName="posts" searchClient={searchClient}>
              <SearchBox />
              <StateResults>
                <Index indexName="posts">
                  <ConnectedPostsHits />
                </Index>
                <Index indexName="users">
                  <ConnectedUsersHits />
                </Index>
              </StateResults>
            </InstantSearch>
          </SearchSheetContext.Provider>
        </div>
      </SheetContent>
    </Sheet>
  );
}
