import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, MessageCircle } from "lucide-react";

const customers = [
  { id: 1, name: "Sarah Johnson", service: "Wedding Photography", avatar: "/placeholder.svg", online: true, lastMessage: "Can we discuss the photo timeline?", time: "2m ago", bookingDate: "Dec 25, 2024" },
  { id: 2, name: "Mike Chen", service: "Corporate Catering", avatar: "/placeholder.svg", online: false, lastMessage: "Menu looks perfect, thank you!", time: "1h ago", bookingDate: "Jan 15, 2025" },
  { id: 3, name: "Emily Davis", service: "Birthday Decoration", avatar: "/placeholder.svg", online: true, lastMessage: "Love the color scheme you suggested", time: "3h ago", bookingDate: "Feb 8, 2025" },
  { id: 4, name: "Robert Smith", service: "DJ Services", avatar: "/placeholder.svg", online: true, lastMessage: "Playlist is ready for review", time: "5h ago", bookingDate: "Mar 12, 2025" },
  { id: 5, name: "Lisa Anderson", service: "Event Planning", avatar: "/placeholder.svg", online: false, lastMessage: "Meeting scheduled for tomorrow", time: "1d ago", bookingDate: "Apr 20, 2025" },
];

const messages = [
  { id: 1, sender: "Sarah Johnson", message: "Hi! I wanted to discuss the timeline for our wedding photography session.", time: "10:30 AM", isMe: false },
  { id: 2, sender: "Me", message: "Of course! I suggest we start with the preparation shots at 2 PM. What do you think?", time: "10:32 AM", isMe: true },
  { id: 3, sender: "Sarah Johnson", message: "That sounds perfect! Should we also include some outdoor shots?", time: "10:35 AM", isMe: false },
  { id: 4, sender: "Me", message: "Absolutely! The garden area would be beautiful for couple portraits.", time: "10:37 AM", isMe: true },
  { id: 5, sender: "Sarah Johnson", message: "Great! Can we discuss the photo timeline in more detail?", time: "10:40 AM", isMe: false },
];

const VendorChat = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Customer Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Customer List */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Customers</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-4 cursor-pointer transition-colors border-b border-border hover:bg-muted ${
                    selectedCustomer.id === customer.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {customer.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{customer.name}</p>
                        <span className="text-xs text-muted-foreground">{customer.time}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs mb-1">{customer.service}</Badge>
                      <p className="text-sm text-muted-foreground truncate">{customer.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">Event: {customer.bookingDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 shadow-md flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedCustomer.avatar} />
                  <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedCustomer.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{selectedCustomer.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.online ? "Online" : "Offline"} • {selectedCustomer.service}
                </p>
                <p className="text-xs text-muted-foreground">Event Date: {selectedCustomer.bookingDate}</p>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorChat;