const AWS = require('aws-sdk');
const unzipper = require('unzipper');
const axios = require('axios');

const s3 = new AWS.S3();

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const bucketName = process.env.BUCKET_NAME;
  const apiEndpoint = process.env.API_ENDPOINT;

  if (!bucketName || !apiEndpoint) {
    console.error('BUCKET_NAME or API_ENDPOINT environment variable is not defined');
    return;
  }

  for (const record of event.Records) {
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const bucket = record.s3.bucket.name;
    const objectMetadata = await s3.headObject({ Bucket: bucket, Key: srcKey }).promise();
    const { Metadata } = objectMetadata;

    const gameId = Metadata.postId;
    const userId = Metadata.userid;
    const engine = Metadata.engine;

    if (!gameId || !userId || !engine) {
      console.error('Missing metadata in S3 object');
      continue;
    }

    console.log('Starting to process the uploaded zip file.');

    try {
      // Get the uploaded zip file
      console.log(`Fetching object from S3: Bucket=${bucket}, Key=${srcKey}`);
      const zipObject = await s3.getObject({ Bucket: bucket, Key: srcKey }).promise();
      console.log('Successfully fetched the zip file from S3.');

      // Extract the zip file
      console.log('Opening the zip file.');
      const zip = await unzipper.Open.buffer(zipObject.Body);
      console.log('Zip file opened.');

      // Validate the game files
      console.log('Validating game files.');
      let isValid = validateGameFiles(zip.files, engine);
      console.log(`Validation result: ${isValid}`);

      if (!isValid) {
        console.error('Validation failed: Missing required files.');
        // Update the post status to 'invalid' via API
        await axios.post(`${apiEndpoint}/updatePostStatus`, {
          gameId,
          status: 'invalid',
        });
        continue; // Skip processing
      }

      // Upload extracted files back to S3
      console.log('Uploading extracted files back to S3.');
      for (const entry of zip.files) {
        if (entry.type === 'File') {
          const filePath = entry.path; // Relative path within the zip
          console.log(`Processing file: ${filePath}`);
          let content = await entry.buffer();

          // Adjust index.html if necessary
          if (filePath.endsWith('index.html')) {
            console.log('Adjusting index.html content.');
            let indexContent = content.toString('utf-8');

            // Adjust paths if needed
            indexContent = indexContent.replace(
              /(src|href)="\/?(TemplateData|Build|Assets)\//g,
              '$1="$2/'
            );

            content = Buffer.from(indexContent, 'utf-8');
          }

          // Determine content type
          const { contentType, contentEncoding } = getFileHeaders(filePath);

          // Upload the file
          await s3
            .putObject({
              Bucket: bucketName,
              Key: `games/${gameId}/${filePath}`,
              Body: content,
              ContentType: contentType,
              ContentEncoding: contentEncoding || undefined,
              ACL: 'public-read',
            })
            .promise();
        }
      }

      // Construct the URL to the game's index.html
      const gameUrl = `https://${bucketName}.s3.amazonaws.com/games/${gameId}/index.html`;

      // Update the post via API
      await axios.post(`${apiEndpoint}/updatePost`, {
        gameId,
        gameUrl,
        status: 'valid',
      });

      console.log('Successfully processed game upload.');
    } catch (error) {
      console.error('Error processing game upload:', error);
      // Optionally, update the post status to 'error' via API
      await axios.post(`${apiEndpoint}/updatePostStatus`, {
        gameId,
        status: 'error',
      });
    }
  }
};

function validateGameFiles(files, engine) {
  let requiredFiles = [];

  if (engine === 'unity') {
    requiredFiles = ['index.html', 'Build/'];
  } else if (engine === 'godot') {
    requiredFiles = ['index.html', '.pck', '.wasm', '.js'];
  }

  const fileNames = files.map((file) => file.path);

  return requiredFiles.every((requiredFile) =>
    fileNames.some((fileName) => fileName.includes(requiredFile))
  );
}

function getFileHeaders(filePath) {
  let contentType = "application/octet-stream";
  let contentEncoding = null;

  if (filePath.endsWith(".html")) {
    contentType = "text/html; charset=utf-8";
  } else if (filePath.endsWith(".js")) {
    contentType = "application/javascript";
  } else if (filePath.endsWith(".css")) {
    contentType = "text/css";
  } else if (filePath.endsWith(".png")) {
    contentType = "image/png";
  } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
    contentType = "image/jpeg";
  } else if (filePath.endsWith(".gif")) {
    contentType = "image/gif";
  } else if (filePath.endsWith(".wasm")) {
    contentType = "application/wasm";
  } else if (filePath.endsWith(".pck")) {
    contentType = "application/octet-stream";
  }

  // Check for compressed files and set Content-Encoding
  if (filePath.endsWith(".gz")) {
    contentEncoding = "gzip";

    // Remove the .gz extension for correct Content-Type
    filePath = filePath.slice(0, -3);

    if (filePath.endsWith(".js")) {
      contentType = "application/javascript";
    } else if (filePath.endsWith(".data")) {
      contentType = "application/octet-stream";
    } else if (filePath.endsWith(".wasm")) {
      contentType = "application/wasm";
    }
  }

  return { contentType, contentEncoding };
}
