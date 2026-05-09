// AuthBar - sits at the top of the lesson panel.
// Shows sign-in button for guests, user info + sign-out for signed-in users.

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function AuthBar() {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-950">
      <span className="text-gray-400 text-xs font-mono tracking-wide">
        Terminal Trainer
      </span>

      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded transition-colors">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Progress saved</span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7",
              },
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
}
