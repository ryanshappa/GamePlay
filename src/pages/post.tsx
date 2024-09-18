// import { useRouter } from "next/router";
// import { api } from "~/utils/api";

// export default function PostPage() {
//   const router = useRouter();
//   const { id } = router.query;

//   const { data: post, isLoading } = api.post.getPostById.useQuery({ id: Number(id) });

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!post) {
//     return <div>No post found</div>;
//   }

//   return (
//     <div>
//       <h1>{post.title}</h1>
//       <iframe
//         src={post.fileUrl || undefined} // Ensure fileUrl is a valid string
//         width="100%"
//         height="600px"
//         allowFullScreen
//       />
//     </div>
//   );
// }
