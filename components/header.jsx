import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, PenBox } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "./header.css"; 
import {checkUser} from "@/lib/checkUser";
const Header = async() => {
  await checkUser();
  return (
    <div className="header-container">
      <nav className="navbar">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="welth logo"
            height={60}
            width={200}
            className="logo-image"
          />
        </Link>

        <div className="nav-buttons">
          <SignedIn>
            <Link href="/dashboard" className="nav-button">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link href="/transaction/create" className="nav-button">
              <PenBox size={18} />
              <span>Add Transaction</span>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forcedRedirectUrl="/dashboard">
              <button className="nav-button">Login</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "avatar-box",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
