import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '~/server/api/root'; // Make sure this path is correct
import { createContext } from '~/server/api/trpc'; // Import your createContext function

export default createNextApiHandler({
  router: appRouter,
  createContext, // Pass the createContext function here
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      console.error('Something went wrong', error);
    }
  },
});
