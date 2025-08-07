"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import "./herosection.css";

const HeroSection = () => {
  const imageRef = useRef();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hero-wrapper">
      {/* Top-right login button */}
      <div className="login-button">
        <Link href="/sign-in">
          <button className="btn btn-outline">Login</button>
        </Link>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-heading">
            Manage Your Finances
            <br />
            With Intelligence
          </h1>
          <p className="hero-description">
            An AI-powered financial management platform that helps you track,
            analyse, and optimize your spending with real-time insights.
          </p>

          <div className="hero-buttons">
            <Link href="/dashboard">
              <button className="btn btn-primary">Get Started</button>
            </Link>
            <Link href="https://www.youtube.com/roadsidecoder">
              <button className="btn btn-outline">Watch Demo</button>
            </Link>
          </div>
        </div>

        <div ref={imageRef} className="hero-image-wrapper">
          <Image
            src="/banner.jpeg"
            width={1280}
            height={720}
            alt="Dashboard Preview"
            className="hero-img"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
