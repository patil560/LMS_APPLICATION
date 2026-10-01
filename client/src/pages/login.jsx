import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRegisterUserMutation, useLoginUserMutation } from "@/features/api/authapi"
import { toast } from "sonner"

export function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [registerUser, { isLoading: registerisLoading }] = useRegisterUserMutation()
  const [loginUser, { isLoading: loginisLoading }] = useLoginUserMutation()

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (tab === "login") {
        const result = await loginUser({ email, password }).unwrap();
        toast.success(result.message || "login successful");
        navigate("/");
      } else {
        const result = await registerUser({ name, email, password }).unwrap();
        toast.success(result.message || "signup successful");
        setTab("login");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Auth failed");
      console.error("Auth error:", error);
    }
  };

  const isLoading = tab === "login" ? loginisLoading : registerisLoading
  return (
    <div className=" flex justify-center  items-center mt-20 ">
      <Card className="w-full max-w-sm ">
        <CardHeader>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="flex w-full justify-center gap-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </TabsContent>

            <TabsContent value="signin">
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Enter your details below to create your account
              </CardDescription>
            </TabsContent>
          </Tabs>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {tab === "signin" && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  minLength={tab === "signin" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : tab === "login" ? "Login" : "Sign In"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter />
      </Card>
    </div>

  )
}