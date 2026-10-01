import { useEffect, useState } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { useGetCoursedetailWithStatusQuery, useVerifySessionMutation } from "@/features/api/purchaseapi";

const PurchaseCourseProtectedRoute = ({ children }) => {
    const { courseId } = useParams();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id"); // present when returning from Stripe

    const { data, isLoading, isError, refetch } = useGetCoursedetailWithStatusQuery(courseId);
    const [verifySession] = useVerifySessionMutation();
    const [verifyDone, setVerifyDone] = useState(!sessionId);

    // Returning from Stripe: confirm the payment with the server first, so we do not
    // depend on the webhook having arrived yet.
    useEffect(() => {
        if (!sessionId) return;
        verifySession(sessionId)
            .unwrap()
            .then(() => refetch())
            .catch(() => {})
            .finally(() => setVerifyDone(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    if (isLoading || !verifyDone) return <p>Loading...</p>;

    if (isError) return <p>Something went wrong. Please try again.</p>;

    return data?.purchased ? (
        children
    ) : (
        <Navigate to={`/course-detail/${courseId}`} replace />
    );
};

export default PurchaseCourseProtectedRoute;
