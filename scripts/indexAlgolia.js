import dotenv from 'dotenv';
dotenv.config();

import algoliasearch from 'algoliasearch';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const applicationId = process.env.ALGOLIA_APP_ID || 'defaultAppId';
  const adminApiKey = process.env.ALGOLIA_WRITE_API_KEY || 'defaultApiKey';

  if (!applicationId || !adminApiKey) {
    throw new Error('Algolia Application ID and Admin API Key must be set');
  }

  const client = algoliasearch(applicationId, adminApiKey);
  const index = client.initIndex('posts');

  const posts = await db.post.findMany({
    include: {
      author: true,
    },
  });

  const records = posts.map((post) => ({
    objectID: post.id,
    title: post.title,
    content: post.content,
    authorUsername: post.author.username,
  }));

  await index.saveObjects(records);
}

main()
  .then(() => {
    console.log('Data indexed to Algolia');
  })
  .catch((error) => {
    console.error('Error indexing data:', error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
