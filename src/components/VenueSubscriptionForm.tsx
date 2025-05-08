
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VenueSubscriptionFormProps {
  onClose: () => void;
}

const VenueSubscriptionForm: React.FC<VenueSubscriptionFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    venueName: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    plan: "standard",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (value: string) => {
    setFormData(prev => ({ ...prev, plan: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate subscription process
    setTimeout(() => {
      toast({
        title: "Subscription Successful",
        description: "Your venue has been registered. You'll receive your venue code by email.",
      });
      onClose();
    }, 1000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe as a Venue</DialogTitle>
          <DialogDescription>
            Fill out this form to list your venue and gain access to the dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input
              id="venueName"
              name="venueName"
              value={formData.venueName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Subscription Plan</Label>
            <RadioGroup 
              value={formData.plan} 
              onValueChange={handlePlanChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="flex-grow font-medium">
                  Standard Plan - $49.99/month
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="premium" id="premium" />
                <Label htmlFor="premium" className="flex-grow font-medium">
                  Premium Plan - $99.99/month
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2 border-t pt-4 mt-4">
            <Label>Payment Details</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiration Date</Label>
                  <Input
                    id="cardExpiry"
                    name="cardExpiry"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input
                    id="cardCvc"
                    name="cardCvc"
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VenueSubscriptionForm;
