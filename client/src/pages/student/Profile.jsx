import React, { useEffect, useState } from "react"
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Course from "./Course.jsx"
import { useLoadUserQuery, useUpdateUserMutation } from "@/features/api/authapi.js";
import { toast } from "sonner"
import { Navigate } from "react-router-dom";

const Profile = () => {

    const [Name, setName] = useState("");
    const [profilephoto, setprofilephoto] = useState("");
    const { data, isLoading, refetch } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
    const [updateUser, { data: updateUserdata, isError, isLoading: updateUserisLoading, error, isSuccess }] = useUpdateUserMutation();

    const onChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) setprofilephoto(file);
    };

    useEffect(() => {
        if (isSuccess) {
            refetch(); // to get profile page updated with new image and name
            toast.success(updateUserdata?.message || "profile updated");
        }
        if (isError) {
            toast.error(error?.data?.message || "failed to update profile");
        }
    }, [isSuccess, isError, updateUserdata, error, refetch]);

    if (isLoading) return <h1>Profile Loading...</h1>

    const user = data?.user;

    if (!user) return <Navigate to="/login" replace />

    const updateUserHandler = async () => {
        const formdata = new FormData();
        if (Name) formdata.append("name", Name);
        if (profilephoto) formdata.append("profilePhoto", profilephoto);
        await updateUser(formdata);
    };

    const enrolledCourses = user?.enrolledCourses || [];

    //console.log("enrolledCourses:", user?.enrolledCourses);
    return (
        <div className="max-w-4xl mx-auto my-10 p-20">
            <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
                <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
                        <AvatarImage src={user?.photourl || "https://github.com/shadcn.png"} alt="shadcn" />
                        <AvatarFallback>Photo</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <div className="mb-2">
                        <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                            Name:
                            <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">{user.name}</span>
                        </h1>
                    </div>
                    <div className="mb-2">
                        <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                            Email:
                            <span className="font-normal text-gray-700 dark:text-gray-300 ml-1"> {user.email}</span>
                        </h1>
                    </div>
                    <div className="mb-2">
                        <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                            Role:
                            <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">{user.role.toUpperCase()}</span>
                        </h1>
                    </div>

                    <Dialog>
                        <DialogTrigger className="mt-2 h-8 w-25 bg-gray-900 dark:bg-gray-300 text-white rounded px-1 text-center">
                            {/*<Button size="sm" className="mt-2 h-8 w-25 bg-gray-900 dark:bg-gray-300 text-white">
                                Edit Profile
                            </Button>*/}
                            Edit Profile
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    Make Changes To Your Profile Here. Click Save When You're Done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label>Name</Label>
                                    <Input type="text" value={Name} placeholder="name" className="col-span-3" onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label>Profile Photo</Label>
                                    <Input type="file" placeholder="name" accept="image/*" className="col-span-3" onChange={onChangeHandler} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button disabled={updateUserisLoading} onClick={updateUserHandler}>
                                    {
                                        updateUserisLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                            </>
                                        ) : "Save Changes"
                                    }
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div>
                <h1 className="font-medium text-lg">Courses You Are Enrolled In.</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5">
                    {
                        enrolledCourses.length === 0 ? (
                            <p>You Haven't Enrolled Yet.</p>
                        ) : (
                            enrolledCourses.map((course) => <Course key={course._id || course} course={course} />)
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Profile;