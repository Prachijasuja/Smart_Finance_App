"use client";
import React from "react";
import { SignIn } from "@clerk/nextjs";

const Page = () => {
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      redirectUrl="/dashboard" // <- redirect after sign-in
    />
  );
};

export default Page;
