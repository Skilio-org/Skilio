import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Check,
  Clock3,
  Inbox,
  Link2,
  MessageSquare,
  Send,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  WorkspacePageHeader,
  WorkspaceSurface,
} from "@/components/dashboard/dashboard-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAcceptConnectionRequest,
  useConnections,
  useDeclineConnectionRequest,
  useRemoveConnection,
  useSendConnectionRequest,
  useWithdrawConnectionRequest,
} from "@/hooks/useConnections";
import useAuth from "@/hooks/useAuth";
import { useAccountRole } from "@/hooks/useAccountRole";
import { getInitials } from "@/utils";

export const Route = createFileRoute("/_layout/connects")({
  component: ConnectsPage,
  head: () => ({
    meta: [
      { title: "Connections & Network | Skilio" },
      {
        name: "description",
        content:
          "Manage client and freelancer network connections, respond to requests, and unlock direct collaboration.",
      },
    ],
  }),
});

function ConnectsPage() {
  const { user } = useAuth();
  const role = useAccountRole();

  // Queries to backend
  const { data: acceptedConnections = [], isLoading: loadingAccepted } = useConnections({
    status: "accepted",
    direction: "all",
  });

  const { data: receivedRequests = [], isLoading: loadingReceived } = useConnections({
    status: "pending",
    direction: "received",
  });

  const { data: sentRequests = [], isLoading: loadingSent } = useConnections({
    status: "pending",
    direction: "sent",
  });

  // Mutations
  const acceptMutation = useAcceptConnectionRequest();
  const declineMutation = useDeclineConnectionRequest();
  const withdrawMutation = useWithdrawConnectionRequest();
  const removeMutation = useRemoveConnection();
  const sendMutation = useSendConnectionRequest();

  // Send request dialog state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [jobPostId, setJobPostId] = useState("");
  const [note, setNote] = useState("");

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId.trim()) {
      toast.error("Please enter the user ID or recipient handle.");
      return;
    }
    if (note.length > 300) {
      toast.error("Introductory note cannot exceed 300 characters.");
      return;
    }

    try {
      await sendMutation.mutateAsync({
        receiver_id: recipientId.trim(),
        job_post_id: jobPostId.trim() || undefined,
        note: note.trim() || undefined,
      });

      setIsConnectModalOpen(false);
      setRecipientId("");
      setJobPostId("");
      setNote("");
    } catch {
      // error handled in mutation hook
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <WorkspacePageHeader
        eyebrow="Network & Collaboration"
        title="Connections"
        description="Connect directly with verified clients and freelancers to discuss opportunities and collaborate."
        actions={
          <Button
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            <span>Connect with {role === "client" ? "Freelancer" : "Client"}</span>
          </Button>
        }
      />

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Active Connections */}
        <WorkspaceSurface className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Connected Network
            </span>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display tracking-tight text-foreground">
              {acceptedConnections.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-1.5 py-0">
                Connected
              </Badge>
              <span>Direct messaging unlocked</span>
            </div>
          </div>
        </WorkspaceSurface>

        {/* Pending Received */}
        <WorkspaceSurface className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Received Requests
            </span>
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
              <Inbox className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display tracking-tight text-foreground">
              {receivedRequests.length}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3 text-amber-500" />
              <span>Awaiting your response</span>
            </div>
          </div>
        </WorkspaceSurface>

        {/* Sent Requests */}
        <WorkspaceSurface className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sent Inquiries
            </span>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
              <Send className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display tracking-tight text-foreground">
              {sentRequests.length}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>Pending recipient review</span>
            </div>
          </div>
        </WorkspaceSurface>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="network" className="w-full">
        <TabsList className="h-10 p-1 bg-muted/60 border">
          <TabsTrigger value="network" className="gap-2 px-4 text-xs font-medium">
            <Users className="size-3.5" />
            <span>My Connections ({acceptedConnections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="received" className="relative gap-2 px-4 text-xs font-medium">
            <Inbox className="size-3.5" />
            <span>Received Requests</span>
            {receivedRequests.length > 0 && (
              <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {receivedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2 px-4 text-xs font-medium">
            <Send className="size-3.5" />
            <span>Sent Requests ({sentRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACCEPTED CONNECTIONS */}
        <TabsContent value="network" className="mt-4 space-y-4">
          {loadingAccepted ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading connections...</p>
          ) : acceptedConnections.length === 0 ? (
            <WorkspaceSurface className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="size-12 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-lg">No active connections yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                Connect with clients or freelancers to unlock direct messaging and discuss projects.
              </p>
              <Button size="sm" onClick={() => setIsConnectModalOpen(true)}>
                Find Someone to Connect With
              </Button>
            </WorkspaceSurface>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {acceptedConnections.map((conn) => {
                const partner = conn.sender_id === user?.id ? conn.receiver : conn.sender;
                const partnerName = partner?.full_name || "Platform Member";
                const targetChatUserId = partner?.id || (conn.sender_id === user?.id ? conn.receiver_id : conn.sender_id);

                return (
                  <Card key={conn.id} className="overflow-hidden border bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-12 border">
                            <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                              {getInitials(partnerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-base leading-tight text-foreground">
                                {partnerName}
                              </h4>
                              {/* R6: Badge 'Connected' */}
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary border-primary/30 text-[11px] font-medium gap-1"
                              >
                                <UserCheck className="size-3" />
                                Connected
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {partner?.active_role === "client" ? "Client" : "Independent Specialist"}
                            </p>
                            {conn.job_post && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 mt-1">
                                <Briefcase className="size-3" />
                                <span>{conn.job_post.title}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeMutation.mutate(conn.id)}
                          title="Remove Connection"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {conn.note && (
                        <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border italic">
                          "{conn.note}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                        <span>Connected</span>
                        {/* R5: Direct Chat / Conversation Unlocked */}
                        <Link
                          to={role === "freelancer" ? "/freelancer-messages" : "/messages"}
                          search={{ userId: targetChatUserId }}
                        >
                          <Button size="sm" variant="default" className="h-8 gap-1.5 text-xs">
                            <MessageSquare className="size-3.5" />
                            <span>Direct Chat</span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: RECEIVED REQUESTS (Recipient Action: R1, R2, R3, R4) */}
        <TabsContent value="received" className="mt-4 space-y-4">
          {loadingReceived ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading requests...</p>
          ) : receivedRequests.length === 0 ? (
            <WorkspaceSurface className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="size-12 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-lg">No pending requests</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                When someone sends you a connection request, it will appear here for your review.
              </p>
            </WorkspaceSurface>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((conn) => {
                const senderName = conn.sender?.full_name || "Platform Member";

                return (
                  <Card key={conn.id} className="border bg-card/60 backdrop-blur-sm p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <Avatar className="size-12 border shrink-0">
                          <AvatarFallback className="font-semibold bg-amber-500/10 text-amber-500">
                            {getInitials(senderName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-base text-foreground">{senderName}</h4>
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                            >
                              Pending Request
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {conn.sender?.active_role === "client" ? "Client" : "Independent Specialist"}
                          </p>
                          {conn.job_post && (
                            <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                              <Briefcase className="size-3.5" />
                              <span>Referencing Job: {conn.job_post.title}</span>
                            </div>
                          )}
                          {/* 300-char note (F5 / C3) */}
                          {conn.note && (
                            <div className="mt-2 text-xs bg-muted/40 p-3 rounded-lg border text-foreground/90 max-w-2xl leading-relaxed">
                              "{conn.note}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recipient Action: Accept or Decline? (R2) */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={declineMutation.isPending}
                          onClick={() => declineMutation.mutate(conn.id)}
                          className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <X className="size-3.5" />
                          <span>Decline</span>
                        </Button>
                        <Button
                          size="sm"
                          disabled={acceptMutation.isPending}
                          onClick={() => acceptMutation.mutate(conn.id)}
                          className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Check className="size-3.5" />
                          <span>Accept & Unlock Chat</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: SENT REQUESTS (F6: Connection status PENDING) */}
        <TabsContent value="sent" className="mt-4 space-y-4">
          {loadingSent ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading sent requests...</p>
          ) : sentRequests.length === 0 ? (
            <WorkspaceSurface className="flex flex-col items-center justify-center py-16 text-center">
              <Send className="size-12 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-lg">No sent requests</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                You haven't sent any connection requests yet.
              </p>
              <Button size="sm" onClick={() => setIsConnectModalOpen(true)}>
                Send a Connection Request
              </Button>
            </WorkspaceSurface>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((conn) => {
                const receiverName = conn.receiver?.full_name || "Platform Member";

                return (
                  <Card key={conn.id} className="border bg-card/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            Request to: {receiverName}
                          </span>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                            PENDING
                          </Badge>
                        </div>
                        {conn.job_post && (
                          <p className="text-xs text-muted-foreground">
                            Job Context: {conn.job_post.title}
                          </p>
                        )}
                        {conn.note && (
                          <p className="text-xs text-muted-foreground italic mt-1">"{conn.note}"</p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        disabled={withdrawMutation.isPending}
                        onClick={() => withdrawMutation.mutate(conn.id)}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* SEND CONNECTION MODAL (F4, F5 / C2, C3) */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="size-5 text-primary" />
              <span>Connect with {role === "client" ? "Freelancer" : "Client"}</span>
            </DialogTitle>
            <DialogDescription>
              Send an inquiry. Once accepted, direct chat and messaging are permanently unlocked.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendConnection} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="recipientId">Recipient User ID</Label>
              <Input
                id="recipientId"
                placeholder="Paste the user ID to connect with"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jobPostId">Job Post ID (Optional)</Label>
              <Input
                id="jobPostId"
                placeholder="Optional job post ID reference"
                value={jobPostId}
                onChange={(e) => setJobPostId(e.target.value)}
              />
            </div>

            {/* Optional 300-char note (F5 / C3) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="note">Introductory Note (Optional)</Label>
                <span
                  className={`text-[11px] ${
                    note.length > 300 ? "text-destructive font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {note.length}/300
                </span>
              </div>
              <textarea
                id="note"
                rows={3}
                maxLength={300}
                placeholder={
                  role === "client"
                    ? "Add a brief note about the project or why you'd like to collaborate..."
                    : "Add a 300-character note referencing the job post or your relevant experience..."
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsConnectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendMutation.isPending || note.length > 300 || !recipientId.trim()}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-3.5" />
                <span>{sendMutation.isPending ? "Sending..." : "Send Request"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
