import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "~/server/api/uploadthing";

export default createRouteHandler({
  router: ourFileRouter,
});
