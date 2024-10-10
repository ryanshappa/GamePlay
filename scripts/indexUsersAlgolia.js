import algoliasearch from 'algoliasearch';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const appId = process.env.ALGOLIA_APP_ID || 'defaultAppId';
  const apiKey = process.env.ALGOLIA_WRITE_API_KEY || 'defaultApiKey';
  const client = algoliasearch(appId, apiKey);
  const index = client.initIndex('users');

  const users = await db.user.findMany();

  const records = users.map((user) => ({
    objectID: user.id,
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  }));

  await index.saveObjects(records);
}

main()
  .then(() => {
    console.log('User data indexed to Algolia');
  })
  .catch((error) => {
    console.error('Error indexing user data:', error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
