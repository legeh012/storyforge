import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, FolderOpen, TrendingUp, Activity, Bot, Menu, Video, UserCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navLinks = [
    { to: "/create", label: "Create", icon: null },
    { to: "/media", label: "Media", icon: FolderOpen },
    { to: "/video-generation", label: "Video Studio", icon: Video },
    { to: "/analytics", label: "Analytics", icon: TrendingUp },
    { to: "/system-monitor", label: "Monitor", icon: Activity },
    { to: "/viral-bots", label: "Viral Bots", icon: Bot },
    { to: "/workflow", label: "Workflow", icon: null },
    { to: "/dashboard", label: "Dashboard", icon: null },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StoryForge
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2 font-medium"
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/create">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                Create Project
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  StoryForge
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    {link.icon && <link.icon className="h-5 w-5 text-primary" />}
                    <span className="text-base font-medium">{link.label}</span>
                  </Link>
                ))}
                
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  {user ? (
                    <>
                      <Link to="/profile" onClick={() => setIsOpen(false)} className="block">
                        <Button variant="outline" className="w-full">
                          <UserCircle className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                      <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        Sign In
                      </Button>
                    </Link>
                  )}
                  <Link to="/create" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      Create Project
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
