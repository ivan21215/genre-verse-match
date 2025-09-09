import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';

interface TicketManagerProps {
  eventId: string;
  isOwner?: boolean;
}

const TicketManager: React.FC<TicketManagerProps> = ({ eventId, isOwner = false }) => {
  const { tickets, fetchEventTickets, createTicket, updateTicket, purchaseTicket } = useTickets();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ticket_type: 'general',
    price: '',
    quantity_available: ''
  });

  useEffect(() => {
    fetchEventTickets(eventId);
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ticketData = {
        event_id: eventId,
        ticket_type: formData.ticket_type,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        quantity_available: formData.quantity_available ? parseInt(formData.quantity_available) : undefined
      };

      if (editingTicket) {
        const { error } = await updateTicket(editingTicket, ticketData);
        if (error) throw new Error(error);
        toast({ title: "Ticket updated successfully" });
      } else {
        const { error } = await createTicket(ticketData);
        if (error) throw new Error(error);
        toast({ title: "Ticket created successfully" });
      }

      setFormData({ ticket_type: 'general', price: '', quantity_available: '' });
      setShowCreateForm(false);
      setEditingTicket(null);
      fetchEventTickets(eventId);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save ticket",
        variant: "destructive"
      });
    }
  };

  const handlePurchase = async (ticketId: string) => {
    try {
      const { error } = await purchaseTicket(ticketId, 1);
      if (error) throw new Error(error);
      toast({ title: "Redirecting to checkout..." });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase ticket",
        variant: "destructive"
      });
    }
  };

  const startEdit = (ticket: any) => {
    setEditingTicket(ticket.id);
    setFormData({
      ticket_type: ticket.ticket_type,
      price: (ticket.price / 100).toString(),
      quantity_available: ticket.quantity_available?.toString() || ''
    });
    setShowCreateForm(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Tickets</h3>
        {isOwner && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="ticket_type">Ticket Type</Label>
                <Select
                  value={formData.ticket_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ticket_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Admission</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="early_bird">Early Bird</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="25.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantity">Available Quantity (optional)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity_available: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingTicket ? 'Update' : 'Create'} Ticket
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTicket(null);
                    setFormData({ ticket_type: 'general', price: '', quantity_available: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No tickets available for this event
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => {
            const availableTickets = ticket.quantity_available 
              ? ticket.quantity_available - ticket.quantity_sold 
              : null;
            const isSoldOut = availableTickets === 0;

            return (
              <Card key={ticket.id} className={isSoldOut ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold capitalize">
                        {ticket.ticket_type.replace('_', ' ')}
                      </h4>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(ticket.price)}
                      </p>
                      {ticket.quantity_available && (
                        <p className="text-sm text-muted-foreground">
                          {availableTickets} of {ticket.quantity_available} available
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {ticket.quantity_sold} sold
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {isOwner ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(ticket)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handlePurchase(ticket.id)}
                          disabled={isSoldOut}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TicketManager;