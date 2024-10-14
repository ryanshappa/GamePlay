import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
  throw new Error('Algolia credentials are not set in environment variables.');
}

export const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

// Initialize separate indices for users and posts
export const usersIndex = algoliaClient.initIndex('users');
export const postsIndex = algoliaClient.initIndex('posts'); 