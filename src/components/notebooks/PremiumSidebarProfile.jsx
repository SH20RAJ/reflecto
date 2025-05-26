"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings, LogOut, User } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function PremiumSidebarProfile({ 
  session,
  isCollapsed,
  handleNavigation,
  handleLogout
}) {
  if (session?.user) {
    return (
      <div className="space-y-3">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-all">
              <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarImage src={session.user.image} alt={session.user.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white">
                  {session.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => handleNavigation("/settings", e)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
                <ModeToggle />
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-sm gap-2.5 h-9"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Sign Out</span>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={session.user.image} alt={session.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white">
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" align="start">
                <div className="flex flex-col">
                  <span>{session.user.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user.email}</span>
                </div>
              </TooltipContent>
            </Tooltip>

            <div className="flex w-full gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="start">Sign out</TooltipContent>
              </Tooltip>
              
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {!isCollapsed ? (
        <>
          <div className="p-2 rounded-lg bg-muted/40 flex items-center justify-between">
            <span className="text-sm">Not signed in</span>
            <ModeToggle />
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            onClick={(e) => handleNavigation("/login", e)}
          >
            Sign In
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleNavigation("/login", e)}
              >
                <User className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="start">Sign in</TooltipContent>
          </Tooltip>
          <ModeToggle />
        </div>
      )}
    </div>
  );
}
