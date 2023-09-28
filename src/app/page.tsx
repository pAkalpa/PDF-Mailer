"use client";

import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { open as shellOpen } from "@tauri-apps/api/shell";

export default function Login() {
  const router = useRouter();
  const onAppPasswordInfoClick = async () => {
    await shellOpen(
      "https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0015112"
    );
  };

  const onSaveLoginClick = async () => {
    router.replace("/experiments");
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-center">
            Mass Mailer Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex flex-row items-center gap-4">
              <Label htmlFor="name" className="text-right w-28">
                Email
              </Label>
              <Input
                id="name"
                type="email"
                placeholder="Email"
                className="w-[310px]"
              />
            </div>
            <div className="flex flex-row items-center gap-4">
              <Label htmlFor="username" className="text-right w-28">
                App Password
              </Label>
              <Input
                id="app-password"
                type="password"
                placeholder="App Password"
                className="w-[310px]"
              />
              <Tooltip>
                <TooltipTrigger>
                  <Info
                    onClick={onAppPasswordInfoClick}
                    className="justify-self-end"
                  />
                </TooltipTrigger>
                <TooltipContent sideOffset={7}>
                  <p>How to Generate App Password</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <CardFooter className="flex justify-end p-0 mt-8 mb-2">
            <Button className="mr-10" onClick={onSaveLoginClick}>
              Save Login
            </Button>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
