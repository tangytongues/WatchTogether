import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Video, Users, Monitor, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { CreateRoomModal } from "@/components/create-room-modal";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Video className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold">WatchTogether</span>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-full"
            data-testid="button-create-room-header"
          >
            Create Room
          </Button>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-chart-2/10 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Your Personal Hangout Space</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight">
              Watch Together,
              <br />
              <span className="text-primary">Anywhere</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Create your own virtual room. Video chat, share screens, and watch content with friends in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-full text-base px-8 py-6 h-auto"
                data-testid="button-create-room-hero"
              >
                Start a Room
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full text-base px-8 py-6 h-auto backdrop-blur-sm bg-background/50"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>

            <div className="pt-12 grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
              <div>
                <div className="text-3xl font-heading font-bold text-primary">Free</div>
                <div className="text-sm text-muted-foreground mt-1">Always</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-chart-2">Instant</div>
                <div className="text-sm text-muted-foreground mt-1">Setup</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-chart-3">Easy</div>
                <div className="text-sm text-muted-foreground mt-1">to Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete suite of features for the perfect virtual hangout
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="group p-8 rounded-xl bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Video & Voice Chat</h3>
              <p className="text-muted-foreground">
                Crystal-clear video and audio calls with your friends. See everyone's reactions in real-time.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Screen Sharing</h3>
              <p className="text-muted-foreground">
                Share your screen to watch movies, browse together, or collaborate on projects seamlessly.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Watch Together</h3>
              <p className="text-muted-foreground">
                Synchronized video playback keeps everyone in perfect sync. Pause, play, and rewind together.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Live Chat</h3>
              <p className="text-muted-foreground">
                Text chat alongside video. Share links, react to moments, and keep the conversation flowing.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Instant Rooms</h3>
              <p className="text-muted-foreground">
                Create a room in seconds. Share the link with friends and start hanging out immediately.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Private & Secure</h3>
              <p className="text-muted-foreground">
                Your room, your rules. Peer-to-peer connections ensure your privacy is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 p-12 rounded-2xl bg-card/50 border border-card-border backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold">
              Ready to hang out?
            </h2>
            <p className="text-lg text-muted-foreground">
              Create your room now and invite your friends. No sign-up required.
            </p>
            <Button 
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-full text-base px-8 py-6 h-auto"
              data-testid="button-create-room-cta"
            >
              Create a Room
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="font-heading font-semibold">WatchTogether</span>
            </div>
            <p>© 2025 WatchTogether. Your personal hangout space.</p>
          </div>
        </div>
      </footer>

      <CreateRoomModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
