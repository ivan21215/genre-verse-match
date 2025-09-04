
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import LoadingIndicator from "@/components/LoadingIndicator";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/hooks/useEvents";
import { useVenues } from "@/hooks/useVenues";
import { useAuth } from "@/contexts/AuthContext";

const genreOptions = [
  "Techno", "Hip Hop", "Rock", "Cajke", "Trash", 
  "White Girl Music", "Dance", "Jazz", "Rap", "Pop"
];

const VenueEventManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { events, loading, createEvent, fetchUserVenueEvents, deleteEvent } = useEvents();
  const { venues } = useVenues();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newEvent, setNewEvent] = useState({
    title: "",
    genre: "",
    description: "",
    start_time: "20:00",
    end_time: "02:00",
    venue_id: "",
    max_attendees: ""
  });

  // Get user's venues for the dropdown
  const userVenues = venues.filter(venue => venue.owner_id === user?.id);

  useEffect(() => {
    if (user) {
      fetchUserVenueEvents();
    }
  }, [user, fetchUserVenueEvents]);

  const handleAddEvent = async () => {
    if (!date || !newEvent.title || !newEvent.genre || !newEvent.venue_id) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const eventData = {
      title: newEvent.title,
      description: newEvent.description || null,
      event_date: format(date, 'yyyy-MM-dd'),
      start_time: newEvent.start_time,
      end_time: newEvent.end_time || null,
      genre: newEvent.genre,
      venue_id: newEvent.venue_id,
      max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null
    };

    const { error } = await createEvent(eventData);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      setNewEvent({ 
        title: "", 
        genre: "", 
        description: "", 
        start_time: "20:00", 
        end_time: "02:00", 
        venue_id: "", 
        max_attendees: "" 
      });
      setDate(new Date());
      
      toast({
        title: "Event Added",
        description: "Your event has been added to the calendar",
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await deleteEvent(id);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Event Deleted",
        description: "Your event has been removed from the calendar",
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to manage events.</p>
      </div>
    );
  }

  if (userVenues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You need to create a venue first before adding events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 border p-4 rounded-md">
        <h3 className="font-medium text-lg">Add New Event</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Title</label>
            <Input 
              placeholder="Enter event title" 
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Venue</label>
            <Select 
              value={newEvent.venue_id} 
              onValueChange={(value) => setNewEvent({...newEvent, venue_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {userVenues.map(venue => (
                  <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Genre</label>
            <Select 
              value={newEvent.genre} 
              onValueChange={(value) => setNewEvent({...newEvent, genre: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {genreOptions.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => 
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input 
                type="time"
                value={newEvent.start_time}
                onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Time (Optional)</label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input 
                type="time"
                value={newEvent.end_time}
                onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Attendees (Optional)</label>
            <Input 
              type="number"
              placeholder="100" 
              value={newEvent.max_attendees}
              onChange={(e) => setNewEvent({...newEvent, max_attendees: e.target.value})}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input 
              placeholder="Enter event description" 
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            />
          </div>
        </div>
        
        <Button onClick={handleAddEvent} className="mt-2">
          Add Event to Calendar
        </Button>
      </div>
      
      <div>
        <h3 className="font-medium text-lg mb-4">Your Events</h3>
        {loading ? (
          <LoadingIndicator />
        ) : events.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.venues?.name}
                    </TableCell>
                    <TableCell>{format(new Date(event.event_date), "PPP")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {event.start_time}
                        {event.end_time && ` - ${event.end_time}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{event.genre}</Badge>
                    </TableCell>
                    <TableCell>
                      {event.attendees || 0}
                      {event.max_attendees && ` / ${event.max_attendees}`}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md text-muted-foreground">
            No events scheduled. Add your first event above.
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueEventManager;
