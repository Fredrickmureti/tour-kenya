
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface SignupFormProps {
  formData: SignupFormData;
  setFormData: React.Dispatch<React.SetStateAction<SignupFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeTerms: checked
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input 
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input 
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone"
          name="phone"
          type="tel"
          placeholder="0712345678"
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="password">Password *</Label>
        <Input 
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input 
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="terms" 
          checked={formData.agreeTerms}
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the{' '}
          <Link to="/terms" className="text-brand-600 hover:text-brand-500">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-brand-600 hover:text-brand-500">
            Privacy Policy
          </Link>
        </label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-brand-600 hover:bg-brand-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : 'Create Account'}
      </Button>
    </form>
  );
};
