import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "@/config.js";
import { useEditLectureMutation ,useRemoveLectureMutation,useGetLectureByIdQuery,} from "@/features/api/courseapi"
const MEDIA_API = `${API_URL}/api/v1/media`;
import { useParams,useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";


const LectureTab = () => {
  //console.log(useEditLectureMutation)
  const [lectureTitle, setlectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  //const navigate = useNavigate();
  const params = useParams();
  const {courseId, lectureId} = params;

  //sending frontend data to backend
  const [editLecture, { data, isLoading, isSuccess, error }] = useEditLectureMutation();
  const [removeLecture,{data:removedata,isLoading:removeLectureLoading, isSuccess:removeLectureIsSuccess,error:removeLectureError}] = useRemoveLectureMutation();
  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setlectureTitle(lecture.lectureTitle);
      setIsFree(!!lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
    }
  },[lecture]);
  
  
  //event handlers
  
  
  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    //console.log(e.target.files?.[0])
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setMediaProgress(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
        withCredentials: true,
        onUploadProgress: ({ loaded, total }) => {
          const percent = Math.round((loaded * 100) / total);
          //console.log("Upload progress:", percent); // to verify in console
          setUploadProgress(percent);
        },
      });

      if (res.data.success) {
        //console.log(res.data.data);
        setUploadVideoInfo({
          videoUrl: res.data.data.secure_url,
          publicId: res.data.data.public_id,
        });
        setBtnDisable(false);
        toast.success(res?.data.message ?? "Video uploaded successfully");
      } else {
        toast.error(res?.data?.message ?? "Video upload failed");
        setBtnDisable(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Video upload failed");
      setBtnDisable(true);
    } finally {
      // Optionally keep progress visible a bit longer for UX
      setTimeout(() => {
        setMediaProgress(false);
      }, 400);
    }
  };

  const editLectureHandler = async () => {
    //alert("its working")
    await editLecture({ lectureTitle,videoInfo:uploadVideoInfo, isPreviewFree:isFree, courseId, lectureId });
    //console.log(data)
  }

  useEffect(() => {
    if(isSuccess){
      toast.success(data?.message || "Lecture Edited successFully")
    }

    if(error){
      toast.error(error?.data?.message || "Error Lecture Not Updated!")
    }
  }, [isSuccess,error])


 const removeLectureHandler = async() =>{
    await removeLecture(lectureId);
   
 }

   useEffect(() => {
    if(removeLectureIsSuccess){
      toast.success(removedata?.message || "Lecture Removed successFully")
    }

    if(removeLectureError){
      toast.error(removeLectureError?.data?.message || "Error Lecture Not removed!")
    }
  }, [removeLectureIsSuccess,removeLectureError])

  return (
    <Card className="">
      <CardHeader className="flex flex-col justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>Make Changes And Click Save When Done</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={removeLectureLoading} variant="destructive" onClick={removeLectureHandler}>
            {
            removeLectureLoading ? <>
            <Loader2 className="h-4 w-4 animate-spin"/> Please Wait
            </> :  "Remove Lecture"
            } 
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setlectureTitle(e.target.value)}
            type="text"
            placeholder="Ex:- Introduction to Node.js"
          />
        </div>

        <div className="my-5">
          <Label>
            Video<span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            className="w-fit"
            onChange={fileChangeHandler}
          />
        </div>

        <div className="flex items-center space-x-2 my-5">
          <Switch id="is-free" checked={isFree} onCheckedChange={setIsFree} />
          <Label htmlFor="is-free">Is This Video Free</Label>
        </div>

        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        <div className="mt-4">
          <Button disabled={isLoading}  onClick={editLectureHandler}>
            {
            isLoading ? <>
            <Loader2 className="h-4 w-4 animate-spin"/> Please Wait
            </> :  "Update Lecture"
            } 
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;