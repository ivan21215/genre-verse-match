
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const genreOptions = [
  "Techno", "Hip Hop", "Rock", "Cajke", "Trash", 
  "White Girl Music", "Dance", "Jazz", "Rap", "Pop"
];

type Event = {
  id: string;
  name: string;
  date: Date;
  genre: string;
  description: string;
};

const VenueEventManager: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "Techno Friday",
      date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      genre: "Techno",
      description: "Weekly techno night with DJ Alex"
    },
    {
      id: "2",
      name: "Hip Hop Saturday",
      date: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000),
      genre: "Hip Hop",
      description: "Hip hop night featuring local talent"
    }
  ]);
  
  const [newEvent, setNewEvent] = useState({
    name: "",
    genre: "",
    description: ""
  });

  const handleAddEvent = () => {
    if (!date || !newEvent.name || !newEvent.genre) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEvent.name,
      date: date,
      genre: newEvent.genre,
      description: newEvent.description
    };

    setEvents([...events, event]);
    setNewEvent({ name: "", genre: "", description: "" });
    
    toast({
      title: "Event Added",
      description: "Your event has been added to the calendar",
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Event Deleted",
      description: "Your event has been removed from the calendar",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border p-4 rounded-md">
        <h3 className="font-medium text-lg">Add New Event</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Name</label>
            <Input 
              placeholder="Enter event name" 
              value={newEvent.name}
              onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
            />
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
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
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
        <h3 className="font-medium text-lg mb-4">Upcoming Events</h3>
        {events.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{format(event.date, "PPP")}</TableCell>
                    <TableCell>
                      <Badge>{event.genre}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.description}</TableCell>
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
