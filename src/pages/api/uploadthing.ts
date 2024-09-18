import { createRouteHandler } from "uploadthing/next-legacy";
import { ourFileRouter } from "~/server/uploadthing"; // Import your router

export default createRouteHandler({
  router: ourFileRouter, 
});
