import React, { useEffect } from "react";
import { Button } from "@/components/ui/button.jsx"
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseapi";
import {Loader2} from "lucide-react"
import { toast } from "sonner"

const BuyCourseButton = ({ courseId }) => {

        const [createCheckoutSession, { data, isLoading, isSuccess,error,isError }] = useCreateCheckoutSessionMutation();

        const purchaseCourseHandler = async () => {
                await createCheckoutSession(courseId).unwrap();
        }

        useEffect(()=>{
                if(isSuccess){
                        toast.success(data?.message || " checkoutSession is succesfull");
                        if(data?.url){
                                window.location.href = data.url; //redirect to strip checkouturl
                        }else{
                                toast.error("Invalid response from server ");
                        }              
                };

                if(isError){
                       toast.error(error?.data?.message || "Failed to create checkout")
                }



        },[data,isSuccess,error,isError])

        return (

                <Button disabled={isLoading} className="w-full" onClick={purchaseCourseHandler}>
                        {
                                isLoading ? (

                                        <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Please wait
                                        </>
                                ) : "Purchase Course"

                        }
                </Button>

        )
}

export default BuyCourseButton;