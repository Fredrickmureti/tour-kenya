
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              <div>
                <div className="font-medium">Credit/Debit Card</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="mpesa" id="mpesa" />
            <Label htmlFor="mpesa" className="flex items-center cursor-pointer flex-1">
              <Smartphone className="h-5 w-5 mr-2 text-green-600" />
              <div>
                <div className="font-medium">M-Pesa</div>
                <div className="text-sm text-gray-500">Pay with your mobile money</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
