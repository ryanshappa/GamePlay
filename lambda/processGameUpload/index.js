const AWS = require('aws-sdk');
const unzipper = require('unzipper');
const axios = require('axios');

const s3 = new AWS.S3();

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const sourceBucketName = process.env.SOURCE_BUCKET_NAME;
  const destinationBucketName = process.env.DESTINATION_BUCKET_NAME;
  const apiEndpoint = process.env.API_ENDPOINT;

  if (!sourceBucketName || !destinationBucketName || !apiEndpoint) {
    console.error(
      'SOURCE_BUCKET_NAME, DESTINATION_BUCKET_NAME, or API_ENDPOINT not defined'
    );
    return;
  }

  for (const record of event.Records) {
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const bucket = record.s3.bucket.name;
    const objectMetadata = await s3
      .headObject({ Bucket: bucket, Key: srcKey })
      .promise();
    const { Metadata } = objectMetadata;

    const gameId = Metadata.postId || Metadata.postid;
    const userId = Metadata.userid || Metadata.userId;
    const engine = Metadata.engine;

    if (!gameId || !userId || !engine) {
      console.error('Missing metadata in S3 object');
      continue;
    }

    console.log('Starting to process the uploaded zip file.');

    try {
      // 1. Download the zip from S3
      console.log(`Fetching object from S3: Bucket=${bucket}, Key=${srcKey}`);
      const zipObject = await s3
        .getObject({ Bucket: bucket, Key: srcKey })
        .promise();
      console.log('Successfully fetched zip file from S3.');

      // 2. Unzip in memory
      console.log('Opening the zip file.');
      const zip = await unzipper.Open.buffer(zipObject.Body);
      console.log('Zip file opened.');

      // 3. Validate that essential game files exist
      console.log('Validating game files.');
      let isValid = validateGameFiles(zip.files, engine);
      console.log(`Validation result: ${isValid}`);

      if (!isValid) {
        console.error('Validation failed: Missing required files.');
        // Update the post status to 'invalid'
        await axios.post(`${apiEndpoint}/updatePostStatus`, {
          gameId,
          status: 'invalid',
        });
        continue;
      }

      // 4. Upload each extracted file to the destination bucket, preserving folder paths
      console.log('Uploading extracted files to the destination bucket.');
      for (const entry of zip.files) {
        if (entry.type === 'File') {
          const filePath = entry.path; // This includes any subfolders
          console.log(`Processing file: ${filePath}`);

          let content = await entry.buffer();

          // Only adjust index.html if Unity
          if (filePath.endsWith('index.html') && engine === 'unity') {
            console.log('Adjusting paths in index.html for Unity.');
            let indexContent = content.toString('utf-8');
            // Adjust any /Build/ or /TemplateData/ references
            indexContent = indexContent.replace(
              /(src|href)="\/?(TemplateData|Build|Assets)\//g,
              '$1="$2/'
            );
            content = Buffer.from(indexContent, 'utf-8');
          }

          // Determine Content-Type/Encoding
          const { contentType, contentEncoding } = getFileHeaders(filePath);

          // Upload to S3, preserving the exact subfolder structure
          // so if filePath is "GodotExport/index.html", it goes to
          // gameId/GodotExport/index.html in S3
          await s3
            .putObject({
              Bucket: destinationBucketName,
              Key: `${gameId}/${filePath}`,
              Body: content,
              ContentType: contentType,
              ContentEncoding: contentEncoding || undefined,
              ACL: 'public-read',
            })
            .promise();
        }
      }

      // 5. Construct public URL for index.html
      const gameUrl = `https://${destinationBucketName}.s3.amazonaws.com/${gameId}/index.html`;

      // 6. Update the post with the final URL
      await axios.post(`${apiEndpoint}/updatePost`, {
        gameId,
        gameUrl,
        status: 'valid',
      });

      console.log('Successfully processed game upload.');
    } catch (error) {
      console.error('Error processing game upload:', error);
      // Mark the post as error
      await axios.post(`${apiEndpoint}/updatePostStatus`, {
        gameId,
        status: 'error',
      });
    }
  }
};

// -------------------------------------------------------
// Validate files exist for each engine
// -------------------------------------------------------
function validateGameFiles(files, engine) {
  let requiredFiles = [];

  if (engine === 'unity') {
    requiredFiles = ['index.html', 'Build/'];
  } else if (engine === 'godot') {
    // We expect at least: index.html, .pck, .wasm, and .js
    // (Possibly .audio.worklet.js, but we'll just check for at least one .js)
    requiredFiles = ['index.html', '.pck', '.wasm', '.js'];
  }

  const fileNames = files.map((file) => file.path.toLowerCase());

  return requiredFiles.every((requiredFile) =>
    fileNames.some((fileName) => fileName.includes(requiredFile))
  );
}

// -------------------------------------------------------
// Get appropriate Content-Type & Content-Encoding
// -------------------------------------------------------
function getFileHeaders(originalPath) {
  // We'll convert to lowercase just for checking the extension
  // but keep the original path intact for the final Key
  let filePath = originalPath.toLowerCase();

  let contentType = 'application/octet-stream';
  let contentEncoding = null;

  if (filePath.endsWith('.html')) {
    contentType = 'text/html; charset=utf-8';
  } else if (filePath.endsWith('.js')) {
    contentType = 'application/javascript';
  } else if (filePath.endsWith('.css')) {
    contentType = 'text/css';
  } else if (filePath.endsWith('.png')) {
    contentType = 'image/png';
  } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    contentType = 'image/jpeg';
  } else if (filePath.endsWith('.gif')) {
    contentType = 'image/gif';
  } else if (filePath.endsWith('.wasm')) {
    contentType = 'application/wasm';
  } else if (filePath.endsWith('.pck')) {
    // Godot .pck is data – can stay octet-stream
    contentType = 'application/octet-stream';
  }

  // Check for .gz
  if (filePath.endsWith('.gz')) {
    contentEncoding = 'gzip';
    // remove .gz so we can determine the underlying type
    filePath = filePath.slice(0, -3);

    if (filePath.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (filePath.endsWith('.data')) {
      contentType = 'application/octet-stream';
    } else if (filePath.endsWith('.wasm')) {
      contentType = 'application/wasm';
    }
  }

  return { contentType, contentEncoding };
}
