import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '';

if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY) {
  throw new Error('Algolia search credentials are not set in environment variables.');
}

export const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

// Initialize separate indices for users and posts
export const usersIndex = algoliaClient.initIndex('users');
export const postsIndex = algoliaClient.initIndex('posts');