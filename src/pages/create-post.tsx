import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import Layout from '~/components/layout';
import { Label } from '~/components/ui/label';
import { useToast } from '~/hooks/use-toast';
import { api } from '~/utils/api';

const CreatePost = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [engine, setEngine] = useState("unity");
  const [isMobileFriendly, setIsMobileFriendly] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [fileKey, setFileKey] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Query for post status - enabled only when we have a gameId and are processing
  const { data: postData, refetch: refetchPost } = api.post.getPostById.useQuery(
    { id: gameId },
    { 
      enabled: false, // We'll manually trigger refetch
    }
  );

  // Poll for status changes
  useEffect(() => {
    if (processingStatus === 'processing' && gameId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const result = await refetchPost();
          const status = result.data?.status;
          
          if (status === 'valid') {
            setProcessingStatus('success');
            clearInterval(pollingIntervalRef.current!);
            toast({
              title: "Success!",
              description: "Your game has been uploaded and is now live!",
            });
            // Redirect to homepage after a short delay
            setTimeout(() => {
              router.push("/");
            }, 1500);
          } else if (status === 'invalid') {
            setProcessingStatus('error');
            clearInterval(pollingIntervalRef.current!);
            toast({
              variant: "destructive",
              title: "Upload Failed",
              description: "Your game file is invalid. Please ensure your zip contains an index.html file and all required game files for your engine.",
            });
          } else if (status === 'error') {
            setProcessingStatus('error');
            clearInterval(pollingIntervalRef.current!);
            toast({
              variant: "destructive",
              title: "Processing Error",
              description: "An error occurred while processing your game. Please try uploading again.",
            });
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [processingStatus, gameId, refetchPost, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !fileKey) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a title and upload a game.",
      });
      return;
    }

    // The post was already created when the file was uploaded
    // Just show processing status if still processing, or redirect if done
    if (processingStatus === 'success') {
      router.push("/");
    } else if (processingStatus === 'processing') {
      toast({
        title: "Processing",
        description: "Your game is still being processed. Please wait...",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setProcessingStatus('uploading');
      setUploading(true);

      try {
        // Request a presigned URL from the server
        const res = await fetch("/api/getPresignedUrl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            title: title || "Untitled Game",
            content,
            engine,
            isMobileFriendly,
          }),
        });

        const data = await res.json() as { 
          message?: string; 
          presignedUrl?: string; 
          fileKey?: string; 
          postId?: string; 
        };

        if (!res.ok) {
          throw new Error(data.message || "Failed to get presigned URL");
        }

        const { presignedUrl, fileKey, postId } = data;

        if (!presignedUrl) {
          throw new Error("No presigned URL received");
        }

        // Upload the file to S3
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          body: selectedFile,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to storage");
        }

        if (fileKey) {
          setFileKey(fileKey);
        }
        if (postId) {
          setGameId(postId);
        }
        
        setProcessingStatus('processing');
        toast({
          title: "File Uploaded",
          description: "Your game is being processed. This may take a moment...",
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        setProcessingStatus('error');
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const isProcessing = processingStatus === 'uploading' || processingStatus === 'processing';

  return (
    <div className="p-4 ml-4 mt-0">
      <h1 className="text-2xl font-bold mb-3">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="mb-3">
          <Label className="block text-sm font-medium mb-1">Title</Label>
          <Input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of your game"
            className="w-full bg-muted text-foreground"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-3">
          <Label className="block text-sm font-medium mb-1">Description</Label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter a description for your game (optional)"
            className="w-full h-24 p-2 border rounded bg-muted text-foreground"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-3">
          <Label className="block text-sm font-medium mb-1">Game Engine</Label>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="bg-muted text-foreground p-2 rounded w-auto"
            disabled={isProcessing}
          >
            <option value="unity">Unity</option>
            <option value="godot">Godot</option>
            <option value="unreal">Unreal Engine</option>
            <option value="threejs">Three.js</option>
          </select>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <input
            type="checkbox"
            id="mobileFriendly"
            checked={isMobileFriendly}
            onChange={(e) => setIsMobileFriendly(e.target.checked)}
            className="w-4 h-4 rounded border-input"
            disabled={isProcessing}
          />
          <Label htmlFor="mobileFriendly" className="cursor-pointer">Mobile-friendly game</Label>
          <span className="text-sm text-muted-foreground">(Game works well on touch devices)</span>
        </div>

        <div className="mb-4">
          <Label htmlFor="file">Upload your game file</Label>
          <p className="text-sm text-gray-500">Please upload your game packaged as a .zip file.</p>
          <p className="text-sm text-gray-500 mb-2">Ensure your HTML file in the web build export is named "index.html".</p>
          <div className="mt-2 inline-block relative">
            <label className={`bg-blue-600 text-foreground py-2 px-4 rounded cursor-pointer hover:bg-blue-700 inline-block relative overflow-hidden ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {file ? "Change File" : "Choose File"}
              <input
                type="file"
                id="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
            <span className="ml-2 text-foreground">
              {file ? file.name : "No file chosen"}
            </span>
          </div>
          
          {/* Progress indicator */}
          {isProcessing && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {/* Spinner */}
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {processingStatus === 'uploading' ? 'Uploading file...' : 'Processing your game...'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {processingStatus === 'uploading' 
                      ? 'Uploading your zip file to our servers' 
                      : 'Validating and extracting game files. This may take a moment.'}
                  </p>
                </div>
              </div>
              {/* Progress bar animation */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                <div 
                  className={`bg-blue-600 h-2 rounded-full ${processingStatus === 'processing' ? 'animate-pulse' : ''}`}
                  style={{ 
                    width: processingStatus === 'uploading' ? '30%' : '70%',
                    transition: 'width 0.5s ease-in-out'
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Error state */}
          {processingStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                There was an error processing your game. Please check your file and try again.
              </p>
            </div>
          )}
          
          {/* Success state */}
          {processingStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your game has been uploaded successfully! Redirecting...
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!title.trim() || !fileKey || isProcessing}
          className={!title.trim() || !fileKey || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isProcessing ? "Processing..." : "Create Post"}
        </Button>
      </form>
    </div>
  );
};

CreatePost.getLayout = (page: React.ReactNode) => <Layout showSideBar={false}>{page}</Layout>;

export default CreatePost;
