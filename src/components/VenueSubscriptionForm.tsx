
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Copy, Calendar, ChartBar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VenueSubscriptionFormProps {
  onClose: () => void;
}

// Function to generate a random venue code
const generateVenueCode = (venueName: string): string => {
  const prefix = venueName.slice(0, 3).toUpperCase();
  const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  return `${prefix}-${randomNumbers}-${month}${year}`;
};

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [venueCode, setVenueCode] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (value: string) => {
    setFormData(prev => ({ ...prev, plan: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique venue code valid for one month
    const code = generateVenueCode(formData.venueName);
    setVenueCode(code);
    setIsSubmitted(true);
    
    // Simulate subscription process
    toast({
      title: "Payment Successful",
      description: "Your venue subscription has been processed.",
    });
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(venueCode);
    toast({
      title: "Code Copied",
      description: "Venue code has been copied to clipboard.",
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSubmitted ? (
          <>
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
                    <Label htmlFor="standard" className="flex-grow">
                      <div className="font-medium">Standard Plan - $49.99/month</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" /> Post events to calendar
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label htmlFor="premium" className="flex-grow">
                      <div className="font-medium">Premium Plan - $99.99/month</div>
                      <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" /> Post events to calendar
                        </div>
                        <div className="flex items-center">
                          <ChartBar className="h-4 w-4 mr-1" /> Access genre popularity analytics
                        </div>
                      </div>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Subscription Successful</DialogTitle>
              <DialogDescription>
                Your venue has been registered successfully. Use the code below to access your dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="bg-muted p-4 rounded-md mb-4">
                <div className="text-sm text-muted-foreground mb-1">Your Venue Code (valid for 1 month):</div>
                <div className="flex items-center justify-between">
                  <code className="bg-background px-2 py-1 rounded text-lg font-mono">{venueCode}</code>
                  <Button size="sm" variant="outline" onClick={copyCodeToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md mb-4">
                <div className="font-medium mb-2">
                  {formData.plan === "standard" ? "Standard Plan Features:" : "Premium Plan Features:"}
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">✓</div>
                    Post events to the event calendar
                  </li>
                  {formData.plan === "premium" && (
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">✓</div>
                      Access to genre popularity analytics
                    </li>
                  )}
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                This code allows you to log in to the venue dashboard for 30 days. 
                Your subscription will automatically renew monthly.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VenueSubscriptionForm;
