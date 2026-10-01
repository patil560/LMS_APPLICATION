import { School,Menu } from "lucide-react"
import { Link, useNavigate } from 'react-router-dom';
import React from "react"
import { Button } from "@/components/ui/button"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DarkMode } from "../Darkmode.jsx"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useLogoutUserMutation } from "@/features/api/authapi.js";
import {toast} from "sonner"
import { useSelector } from "react-redux";


const Navbar = () => {
    //taking user from redux store  
    const {user} =useSelector(store=>store.auth)
    //console.log(user)
    //const user = true;  // Replace with your authentication logic
    const role = user?.role || "student";
    const navigate = useNavigate();
    const [logoutUser] = useLogoutUserMutation();
    


   const logouthandler = async () => {
    try {
      await logoutUser().unwrap();
      toast.success("User logged out");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
    }
  };


    return (
        <div className='h-16 dark:bg-[#020817]  bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10  '>
            
            {/* Dekstop */}

            <div className=" h-full p-10 hidden  md:flex items-center justify-between gap-10 mx-auto max-w-7xl   ">
                <div className="flex items-center gap-2  ">
                    <School size={30} />
                    <Link to="/">
                    <h1 className='md:block font-extrabold text-2xl'>E-Coders</h1>
                    </Link>
                </div>
                <div className="flex items-center gap-8 ">
                    {/* user icon and dark mode icon */}
                    {
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full">
                                    <Avatar>
                                    <AvatarImage src={user.photourl || "https://github.com/shadcn.png"} alt="shadcn" />
                                    <AvatarFallback>LR</AvatarFallback>
                                </Avatar>
                                </Button>} />
                                <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Link to="my-learning">My Learning</Link></DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Link to="/wishlist">Wishlist</Link></DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Link to="profile">Edit Profile</Link></DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logouthandler}>Log out</DropdownMenuItem>
                                        {
                                            role === "instructor"   && (
                                                <>
                                        <DropdownMenuSeparator />  
                                        <DropdownMenuItem><Link to="/admin/dashboard">Dashboard</Link></DropdownMenuItem>
                                    
                                                </>
                                            )
                                        }
                                        </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2 ">
                                <Button variant="outline" onClick={()=>navigate("/login")}> Log in</Button>
                                <Button onClick={()=>navigate("/login")}>Sign up</Button>
                            </div>
                        )
                    }

                    <DarkMode />
                </div>
            </div>

            {/* mobile device */}
            {/* md used in attributes for mobile responsiveness */}
            
            <div className="flex items-center justify-between md:hidden px-4 h-full ">
                     <h1 className="text-xl font-bold"><Link to="/">E-Coders</Link></h1>
                     <MobileNavbar />
            </div>
           
        </div>
    )
}

export default Navbar;

const MobileNavbar = () => {
        const {user} =useSelector(store=>store.auth)
        const role = user?.role || "student"; // or "student" based on your logic
        const navigate = useNavigate();

        const [logoutUser] = useLogoutUserMutation();
       const logouthandler = async () => {
                try {
                await logoutUser().unwrap();
                toast.success("User logged out");
                navigate("/login", { replace: true });
                } catch (error) {
                toast.error("Logout failed");
                }
            };

    return (

        <Sheet>
            <SheetTrigger render={<Button size="icon" hover:bg-gray-200="true" className='rounded-full bg-gray-200' variant="outline">
                <Menu />
            </Button>} />
            <SheetContent  className=" " side="right">
                <SheetHeader className="flex flex-row items-center mt-10 justify-between gap-2"    >
                    <SheetTitle><Link to="/">E-Coders</Link></SheetTitle>
                    {/* <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription> */}
                    <DarkMode />
                </SheetHeader>

                <nav className="flex text-lg  flex-col gap-3 ml-4">
                {user ? (
                    <>
                    <span>
                        <Link to="/my-learning">My Learning</Link>
                    </span>
                    <span>
                        <Link to="/wishlist">Wishlist</Link>
                    </span>
                    <span>
                        <Link to="/profile">Edit Profile</Link>
                    </span>
                    <span onClick={logouthandler} className="cursor-pointer">
                        Log out
                    </span>
                    {role === "instructor" && (
                        <SheetFooter className="mt-4 flex items-center">
                        <span className=" h-8 w-29 bg-gray-900 dark:bg-gray-300 text-white rounded px-2  text-center ">
                            <Link to="/admin/dashboard">Dashboard</Link>
                        </span>
                        <SheetClose >
                            <span className="h-8 w-30 bg-gray-900 dark:bg-gray-300 text-white rounded px-4 text-center ">Close</span>
                        </SheetClose>
                        </SheetFooter>
                    )}
                    </>
                ) : (
                    <span className="mt-2 h-8 w-25 bg-gray-900 dark:bg-gray-300 text-white rounded px-1 text-center ">
                    <Link to="/login">Login</Link>
                    </span>
                )}
                </nav>
            </SheetContent>
        </Sheet>
    )

} 