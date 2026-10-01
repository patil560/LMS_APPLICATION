import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseapi";

const Dashboard = () => {
    const { data, isSuccess, isLoading, isError } = useGetPurchasedCoursesQuery();

    if (isLoading) return <h1>Loading...</h1>
    if (isError) return <h1>Failed to get purchased courses</h1>

    // FIX: fallback should be an object (data itself), not an array,
    // and purchasedCourse should default to an array so .map never breaks
    const { purchasedCourse = [] } = data || {};

    const courseData = purchasedCourse.map((course) => ({
        name: course.courseId?.courseTitle,
        price: course.courseId?.coursePrice
    }));

    // Derived stats (replacing the hardcoded "400" / "1200")
    // totals come from the server (counted by the database over ALL sales, not just the latest 100)
    const totalSales = data?.totalSales ?? purchasedCourse.length;
    const totalRevenue = data?.totalRevenue ?? courseData.reduce((acc, c) => acc + (c.price || 0), 0);

    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ml-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle>Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
                </CardContent>
            </Card>

            {/* FIX: this card had a duplicate "Total Sales" title — should be revenue */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-600">₹{totalRevenue}</p>
                </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-700">Course Prices</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={courseData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis stroke="#6b7280" />
                            <Tooltip formatter={(value, name) => [`₹${value}`, name]} />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#4a90e2"
                                strokeWidth={3}
                                dot={{ stroke: "#4a90e2", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

export default Dashboard;